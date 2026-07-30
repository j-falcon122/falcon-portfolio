# AWS logging & monitoring checklist (Falcon + future sites)

Reusable playbook for Amplify / public sites. Region used here: **us-east-1**.

## What you already have (Falcon)

| Piece | Value |
| --- | --- |
| Amplify app | `falcon-portfolio` (`d24dzap3bleern`) |
| Prod URL | https://jordanjfalcon.com/ |
| App logs | `/aws/amplify/d24dzap3bleern` |
| Platform | `WEB_COMPUTE` (SSR) — logs show `START` / `REPORT` per request |

## Phase 1 — Read logs (no cost beyond storage)

1. Console: **CloudWatch → Log groups →** `/aws/amplify/d24dzap3bleern`
2. Or CLI Logs Insights (last hour):

```bash
START=$(python3 -c 'import time; print(int((time.time()-3600)*1000))')
END=$(python3 -c 'import time; print(int(time.time()*1000))')
Q=$(aws logs start-query --region us-east-1 \
  --log-group-name /aws/amplify/d24dzap3bleern \
  --start-time "$START" --end-time "$END" \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR|Error|REPORT/ | sort @timestamp desc | limit 20' \
  --query queryId --output text)
sleep 3
aws logs get-query-results --region us-east-1 --query-id "$Q" --output table
```

3. Set retention (keeps the bill small):

```bash
aws logs put-retention-policy --region us-east-1 \
  --log-group-name /aws/amplify/d24dzap3bleern \
  --retention-in-days 14
```

**Learn:** `START` / `REPORT` = one SSR invocation. Duration + memory on `REPORT` tell you cold starts vs warm.

## Phase 2 — Alerts (SNS email)

One topic per site (or one shared `site-alerts` topic with multiple subscriptions).

```bash
aws sns create-topic --region us-east-1 --name falcon-portfolio-alerts
# subscribe your email, then confirm the AWS confirmation message
```

Or run the script in Phase 3 (creates topic + subscription).

## Phase 3 — Uptime canary + alarm

Script (repo): [`scripts/aws-uptime-monitoring.sh`](../scripts/aws-uptime-monitoring.sh)

```bash
chmod +x scripts/aws-uptime-monitoring.sh
SITE_URL=https://jordanjfalcon.com/ \
ALERT_EMAIL=you@example.com \
PROJECT_SLUG=falcon-portfolio \
BRAND_CHECK='Jordan Falcon' \
./scripts/aws-uptime-monitoring.sh
```

Creates:

- SNS topic `{slug}-alerts` + email sub (confirm!)
- S3 artifact bucket (private, 31-day expiry)
- Synthetics canary every **15 minutes** (cheaper than 5m while learning)
- Alarm if `SuccessPercent` &lt; 90% for 2 periods (`treat-missing-data=breaching`)

**For the next site:** change `SITE_URL`, `PROJECT_SLUG`, and optional `BRAND_CHECK`.

Approximate cost: a few dollars/month per 15‑minute canary.

## Phase 4 — Later (when you outgrow this)

- Structured JSON logs from API routes (`level`, `route`, `requestId`)
- Dashboard: canary success + Amplify/SSR duration
- Optional: ADOT / Application Signals for deeper tracing

## Security note

Prefer an IAM user/role with least privilege over long-term root CLI use. `aws login` (CLI 2.32+) gives short-lived credentials for day-to-day work.
