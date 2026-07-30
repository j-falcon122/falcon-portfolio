"""Daily Amplify log + canary digest → SNS (one email per day)."""

from __future__ import annotations

import os
import re
import time
from datetime import datetime, timezone

import boto3

logs = boto3.client("logs")
synthetics = boto3.client("synthetics")
sns = boto3.client("sns")

LOG_GROUP = os.environ.get("LOG_GROUP", "/aws/amplify/d24dzap3bleern")
CANARY_NAME = os.environ.get("CANARY_NAME", "falcon-portfolio-heartbeat")
TOPIC_ARN = os.environ["TOPIC_ARN"]
SITE_NAME = os.environ.get("SITE_NAME", "falcon-portfolio")
LOOKBACK_HOURS = int(os.environ.get("LOOKBACK_HOURS", "24"))


def run_insights(query: str) -> dict:
    end = int(time.time())
    start = end - LOOKBACK_HOURS * 3600
    query_id = logs.start_query(
        logGroupName=LOG_GROUP,
        startTime=start,
        endTime=end,
        queryString=query,
    )["queryId"]

    for _ in range(30):
        time.sleep(1)
        res = logs.get_query_results(queryId=query_id)
        if res["status"] in ("Complete", "Failed", "Cancelled", "Timeout"):
            return res
    return {"status": "Timeout", "results": []}


def field_map(row: list) -> dict:
    return {cell["field"]: cell["value"] for cell in row}


def handler(event, context):
    report_q = run_insights(
        """
        fields @message
        | filter @message like /REPORT RequestId/
        | parse @message /Duration: (?<duration>[0-9.]+) ms/
        | stats count(*) as requests, avg(duration) as avgMs, max(duration) as maxMs
        """
    )
    error_q = run_insights(
        """
        fields @timestamp, @message
        | filter @message like /(?i)(ERROR|Error|Task timed out|Unhandled|FATAL)/
        | sort @timestamp desc
        | limit 10
        """
    )
    canary = synthetics.get_canary_runs(Name=CANARY_NAME, MaxResults=20)

    stats = field_map(report_q.get("results", [[]])[0]) if report_q.get("results") else {}
    requests = stats.get("requests", "0")
    avg_ms = f"{float(stats['avgMs']):.1f}" if stats.get("avgMs") else "n/a"
    max_ms = f"{float(stats['maxMs']):.1f}" if stats.get("maxMs") else "n/a"

    error_rows = [field_map(r) for r in error_q.get("results", [])]
    error_count = len(error_rows)

    runs = canary.get("CanaryRuns", [])
    passed = sum(1 for r in runs if r.get("Status", {}).get("State") == "PASSED")
    failed = sum(1 for r in runs if r.get("Status", {}).get("State") == "FAILED")
    last = runs[0] if runs else {}
    last_status = last.get("Status", {}).get("State", "NONE")
    last_at = (
        last.get("Timeline", {}).get("Completed")
        or last.get("Timeline", {}).get("Started")
        or "n/a"
    )

    healthy = error_count == 0 and failed == 0 and last_status != "FAILED"
    subject = (
        f"Daily OK · {SITE_NAME} (last {LOOKBACK_HOURS}h)"
        if healthy
        else f"Daily ATTENTION · {SITE_NAME} (last {LOOKBACK_HOURS}h)"
    )

    if error_rows:
        error_preview = "\n".join(
            f"- {r.get('@timestamp', '?')}: "
            f"{re.sub(r'\\s+', ' ', (r.get('@message') or '')[:180])}"
            for r in error_rows
        )
    else:
        error_preview = "- none"

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    body = f"""{SITE_NAME} daily log digest
Generated: {now}
Window: last {LOOKBACK_HOURS} hours

SSR / Amplify compute
  Log group: {LOG_GROUP}
  Requests (REPORT lines): {requests}
  Avg duration: {avg_ms} ms
  Max duration: {max_ms} ms
  Error-like lines (sample max 10): {error_count}
{error_preview}

Uptime canary
  Name: {CANARY_NAME}
  Recent runs sampled: {len(runs)} (passed {passed}, failed {failed})
  Last run: {last_status} at {last_at}

Links
  Logs: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/{LOG_GROUP.replace('/', '$252F')}
  Canary: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#synthetics:/canary/detail/{CANARY_NAME}

Immediate emails still fire only when the uptime alarm enters ALARM.
"""

    sns.publish(TopicArn=TOPIC_ARN, Subject=subject[:100], Message=body)
    return {
        "ok": True,
        "healthy": healthy,
        "requests": requests,
        "errorCount": error_count,
        "lastStatus": last_status,
    }
