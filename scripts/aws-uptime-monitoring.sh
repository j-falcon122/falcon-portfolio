#!/usr/bin/env bash
# Provision lightweight uptime monitoring for a public site (reusable).
#
# Usage:
#   SITE_URL=https://example.com/ ALERT_EMAIL=you@example.com \
#   PROJECT_SLUG=my-site ./scripts/aws-uptime-monitoring.sh
#
# Creates (us-east-1 by default):
#   - SNS topic + email subscription (confirm the email!)
#   - Private S3 bucket for Synthetics artifacts (31-day expiry)
#   - IAM role for the canary
#   - CloudWatch Synthetics heartbeat (once daily via cron; stays under Free Tier 100 runs/mo)
#   - CloudWatch alarm on SuccessPercent < 90%
#
# Cost ballpark: Free Tier covers 100 runs/mo. rate() max is 1 hour (~720/mo = paid);
# use cron for once/twice daily to stay free.

set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
SITE_URL="${SITE_URL:?Set SITE_URL e.g. https://jordanjfalcon.com/}"
ALERT_EMAIL="${ALERT_EMAIL:?Set ALERT_EMAIL}"
PROJECT_SLUG="${PROJECT_SLUG:?Set PROJECT_SLUG e.g. falcon-portfolio}"
BRAND_CHECK="${BRAND_CHECK:-}" # optional regex; empty = status-code only

ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="${PROJECT_SLUG}-synthetics-${ACCOUNT}-${REGION}"
TOPIC_NAME="${PROJECT_SLUG}-alerts"
CANARY_NAME="${PROJECT_SLUG}-heartbeat"
ROLE_NAME="CloudWatchSyntheticsRole-${PROJECT_SLUG}"

echo "==> Account $ACCOUNT · region $REGION"
echo "==> Monitoring $SITE_URL → $ALERT_EMAIL"

TOPIC_ARN="$(aws sns create-topic --region "$REGION" --name "$TOPIC_NAME" --query TopicArn --output text)"
aws sns set-topic-attributes --region "$REGION" --topic-arn "$TOPIC_ARN" \
  --attribute-name DisplayName --attribute-value "${PROJECT_SLUG} alerts" >/dev/null
aws sns subscribe --region "$REGION" --topic-arn "$TOPIC_ARN" \
  --protocol email --notification-endpoint "$ALERT_EMAIL" >/dev/null
echo "SNS topic: $TOPIC_ARN"
echo "Confirm the subscription email sent to $ALERT_EMAIL"

if ! aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  aws s3api create-bucket --region "$REGION" --bucket "$BUCKET" >/dev/null
  aws s3api put-public-access-block --bucket "$BUCKET" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET" --lifecycle-configuration '{
    "Rules": [{"ID":"expire-artifacts","Status":"Enabled","Filter":{"Prefix":""},"Expiration":{"Days":31}}]
  }'
fi
echo "Artifacts bucket: s3://$BUCKET"

TRUST='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":["lambda.amazonaws.com","synthetics.amazonaws.com"]},"Action":"sts:AssumeRole"}]}'
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$TRUST" >/dev/null
fi
ROLE_ARN="$(aws iam get-role --role-name "$ROLE_NAME" --query Role.Arn --output text)"

POLICY="$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:GetBucketLocation","s3:ListBucket"],
      "Resource": ["arn:aws:s3:::${BUCKET}","arn:aws:s3:::${BUCKET}/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents","logs:DescribeLogGroups","logs:DescribeLogStreams"],
      "Resource": "arn:aws:logs:${REGION}:${ACCOUNT}:log-group:/aws/lambda/cwsyn-*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListAllMyBuckets","xray:PutTraceSegments"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "cloudwatch:PutMetricData",
      "Resource": "*",
      "Condition": {"StringEquals":{"cloudwatch:namespace":"CloudWatchSynthetics"}}
    }
  ]
}
EOF
)"
aws iam put-role-policy --role-name "$ROLE_NAME" \
  --policy-name "${PROJECT_SLUG}-synthetics-inline" \
  --policy-document "$POLICY"
echo "IAM role: $ROLE_ARN"
sleep 8

RUNTIME="$(aws synthetics describe-runtime-versions --region "$REGION" \
  --query "RuntimeVersions[?starts_with(VersionName, 'syn-nodejs-puppeteer')].VersionName" \
  --output text | tr '\t' '\n' | sort -t- -k4,4V | tail -1)"
echo "Runtime: $RUNTIME"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
mkdir -p "$TMP/nodejs/node_modules"

# Escape brand check for embedding in JS string
BRAND_JS="${BRAND_CHECK//\\/\\\\}"
BRAND_JS="${BRAND_JS//\'/\\\'}"

cat > "$TMP/nodejs/node_modules/pageLoadBlueprint.js" <<JS
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const loadUrl = async function () {
  const url = process.env.SITE_URL || '${SITE_URL}';
  const brand = process.env.BRAND_CHECK || '${BRAND_JS}';
  log.info('Checking ' + url);
  const page = await synthetics.getPage();
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  const status = response ? response.status() : 0;
  log.info('Status ' + status);
  if (status < 200 || status > 399) {
    throw new Error('Failed to load ' + url + ' status=' + status);
  }
  if (brand) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!new RegExp(brand, 'i').test(bodyText || '')) {
      throw new Error('Page loaded but brand check failed: ' + brand);
    }
  }
  return 'ok';
};

exports.handler = async () => loadUrl();
JS

( cd "$TMP" && zip -qr canary.zip nodejs )
ZIP_B64="$(base64 < "$TMP/canary.zip" | tr -d '\n')"

ENV_VARS="SITE_URL=${SITE_URL}"
if [[ -n "$BRAND_CHECK" ]]; then
  ENV_VARS+=",BRAND_CHECK=${BRAND_CHECK}"
fi

if aws synthetics get-canary --region "$REGION" --name "$CANARY_NAME" >/dev/null 2>&1; then
  aws synthetics update-canary --region "$REGION" --name "$CANARY_NAME" \
    --code "ZipFile=${ZIP_B64},Handler=pageLoadBlueprint.handler" \
    --runtime-version "$RUNTIME" \
    --schedule 'Expression=cron(0 14 * * ? *)' \
    --run-config "TimeoutInSeconds=60,EnvironmentVariables={${ENV_VARS}}" \
    --success-retention-period-in-days 2 \
    --failure-retention-period-in-days 14 \
    --artifact-s3-location "s3://${BUCKET}/canary-artifacts" \
    --execution-role-arn "$ROLE_ARN" >/dev/null
  echo "Updated canary: $CANARY_NAME"
else
  aws synthetics create-canary --region "$REGION" --name "$CANARY_NAME" \
    --code "ZipFile=${ZIP_B64},Handler=pageLoadBlueprint.handler" \
    --artifact-s3-location "s3://${BUCKET}/canary-artifacts" \
    --execution-role-arn "$ROLE_ARN" \
    --schedule 'Expression=cron(0 14 * * ? *)' \
    --runtime-version "$RUNTIME" \
    --run-config "TimeoutInSeconds=60,EnvironmentVariables={${ENV_VARS}}" \
    --success-retention-period-in-days 2 \
    --failure-retention-period-in-days 14 \
    --tags "project=${PROJECT_SLUG},purpose=uptime" >/dev/null
  echo "Created canary: $CANARY_NAME"
fi

aws synthetics start-canary --region "$REGION" --name "$CANARY_NAME" >/dev/null 2>&1 || true

aws cloudwatch put-metric-alarm --region "$REGION" \
  --alarm-name "${CANARY_NAME}-success" \
  --alarm-description "${PROJECT_SLUG} uptime canary success below 90%" \
  --namespace CloudWatchSynthetics \
  --metric-name SuccessPercent \
  --dimensions "Name=CanaryName,Value=${CANARY_NAME}" \
  --statistic Average \
  --period 900 \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2 \
  --threshold 90 \
  --comparison-operator LessThanThreshold \
  --treat-missing-data breaching \
  --alarm-actions "$TOPIC_ARN" \
  --ok-actions "$TOPIC_ARN"

echo
echo "Done."
echo "  Topic:   $TOPIC_ARN"
echo "  Canary:  $CANARY_NAME (cron daily 14:00 UTC)"
echo "  Alarm:   ${CANARY_NAME}-success"
echo "  Next:    Confirm the SNS email, then wait for the first canary run."
echo "  Console: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#synthetics:/canary/detail/${CANARY_NAME}"
