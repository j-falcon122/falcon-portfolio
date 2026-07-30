#!/usr/bin/env bash
# Deploy a once-daily Amplify log digest email via SNS.
#
# Usage:
#   TOPIC_ARN=arn:aws:sns:us-east-1:ACCOUNT:falcon-portfolio-alerts \
#   ./scripts/deploy-daily-digest.sh
#
# Optional env:
#   PROJECT_SLUG=falcon-portfolio
#   LOG_GROUP=/aws/amplify/d24dzap3bleern
#   CANARY_NAME=falcon-portfolio-heartbeat
#   SCHEDULE_CRON='cron(0 13 * * ? *)'   # 13:00 UTC ≈ 9am ET
#   SEND_NOW=1                          # invoke once after deploy

set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
PROJECT_SLUG="${PROJECT_SLUG:-falcon-portfolio}"
TOPIC_ARN="${TOPIC_ARN:?Set TOPIC_ARN}"
LOG_GROUP="${LOG_GROUP:-/aws/amplify/d24dzap3bleern}"
CANARY_NAME="${CANARY_NAME:-falcon-portfolio-heartbeat}"
SCHEDULE_CRON="${SCHEDULE_CRON:-cron(0 13 * * ? *)}"
FN_NAME="${PROJECT_SLUG}-daily-digest"
ROLE_NAME="${PROJECT_SLUG}-daily-digest-role"
RULE_NAME="${PROJECT_SLUG}-daily-digest"

ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Deploying $FN_NAME in $REGION"

TRUST='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
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
      "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],
      "Resource": "arn:aws:logs:${REGION}:${ACCOUNT}:log-group:/aws/lambda/${FN_NAME}:*"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:StartQuery","logs:GetQueryResults","logs:DescribeLogGroups"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["synthetics:GetCanaryRuns","synthetics:GetCanary"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "${TOPIC_ARN}"
    }
  ]
}
EOF
)"
aws iam put-role-policy --role-name "$ROLE_NAME" \
  --policy-name "${PROJECT_SLUG}-daily-digest-inline" \
  --policy-document "$POLICY"
sleep 8

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp "$ROOT/scripts/daily-digest/handler.py" "$TMP/handler.py"
( cd "$TMP" && zip -q function.zip handler.py )

ENV_VARS="Variables={TOPIC_ARN=${TOPIC_ARN},LOG_GROUP=${LOG_GROUP},CANARY_NAME=${CANARY_NAME},SITE_NAME=${PROJECT_SLUG},LOOKBACK_HOURS=24}"

if aws lambda get-function --region "$REGION" --function-name "$FN_NAME" >/dev/null 2>&1; then
  aws lambda update-function-code --region "$REGION" --function-name "$FN_NAME" \
    --zip-file "fileb://${TMP}/function.zip" >/dev/null
  aws lambda wait function-updated --region "$REGION" --function-name "$FN_NAME"
  aws lambda update-function-configuration --region "$REGION" --function-name "$FN_NAME" \
    --runtime python3.12 --handler handler.handler --timeout 60 --memory-size 256 \
    --role "$ROLE_ARN" --environment "$ENV_VARS" >/dev/null
  aws lambda wait function-updated --region "$REGION" --function-name "$FN_NAME"
  echo "Updated function $FN_NAME"
else
  aws lambda create-function --region "$REGION" --function-name "$FN_NAME" \
    --runtime python3.12 --role "$ROLE_ARN" --handler handler.handler \
    --timeout 60 --memory-size 256 \
    --zip-file "fileb://${TMP}/function.zip" \
    --environment "$ENV_VARS" >/dev/null
  aws lambda wait function-active --region "$REGION" --function-name "$FN_NAME"
  echo "Created function $FN_NAME"
fi

FN_ARN="$(aws lambda get-function --region "$REGION" --function-name "$FN_NAME" --query Configuration.FunctionArn --output text)"

aws events put-rule --region "$REGION" --name "$RULE_NAME" \
  --schedule-expression "$SCHEDULE_CRON" \
  --state ENABLED \
  --description "Daily ${PROJECT_SLUG} log digest" >/dev/null

aws lambda add-permission --region "$REGION" --function-name "$FN_NAME" \
  --statement-id "${RULE_NAME}-invoke" \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:${REGION}:${ACCOUNT}:rule/${RULE_NAME}" >/dev/null 2>&1 || true

aws events put-targets --region "$REGION" --rule "$RULE_NAME" --targets \
  "Id=1,Arn=${FN_ARN}" >/dev/null

# Quiet OK emails from the uptime alarm — keep ALARM only
ALARM_NAME="${CANARY_NAME}-success"
if aws cloudwatch describe-alarms --region "$REGION" --alarm-names "$ALARM_NAME" \
  --query 'MetricAlarms[0].AlarmName' --output text 2>/dev/null | grep -q "$ALARM_NAME"; then
  aws cloudwatch put-metric-alarm --region "$REGION" \
    --alarm-name "$ALARM_NAME" \
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
    --alarm-actions "$TOPIC_ARN"
  echo "Uptime alarm OK emails disabled (ALARM only)"
fi

echo
echo "Done."
echo "  Function: $FN_NAME"
echo "  Schedule: $SCHEDULE_CRON (default 13:00 UTC ≈ 9:00 AM ET)"
echo "  Topic:    $TOPIC_ARN"

if [[ "${SEND_NOW:-0}" == "1" ]]; then
  echo "Invoking once now..."
  aws lambda invoke --region "$REGION" --function-name "$FN_NAME" \
    --payload '{}' /tmp/${FN_NAME}-out.json >/dev/null
  cat /tmp/${FN_NAME}-out.json
  echo
fi
