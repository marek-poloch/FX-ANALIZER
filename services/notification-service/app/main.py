"""Notification service — dispatches alerts to Telegram / email / webhook.

Each channel is a separate pluggable function. In demo/mock mode the dispatch
is logged to stdout so the whole loop works without any credentials.
"""
from __future__ import annotations

import os
import smtplib
from email.message import EmailMessage
from typing import Literal

import httpx
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="FX Whale Radar — Notification Service")

Channel = Literal["telegram", "discord", "slack", "email", "webhook", "stdout"]


class DispatchRequest(BaseModel):
    channel: Channel
    subject: str
    body: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "fxradar-notifications"}


@app.post("/dispatch")
async def dispatch(req: DispatchRequest) -> dict:
    if req.channel == "telegram":
        return await send_telegram(req.subject, req.body)
    if req.channel == "discord":
        return await send_webhook(os.getenv("DISCORD_WEBHOOK_URL"), {"content": f"**{req.subject}**\n{req.body}"})
    if req.channel == "slack":
        return await send_webhook(os.getenv("SLACK_WEBHOOK_URL"), {"text": f"*{req.subject}*\n{req.body}"})
    if req.channel == "webhook":
        return await send_webhook(os.getenv("N8N_WEBHOOK_URL"), {"subject": req.subject, "body": req.body})
    if req.channel == "email":
        return send_email(req.subject, req.body)
    # Default / mock
    print(f"[notify:stdout] {req.subject}\n{req.body}")
    return {"ok": True, "channel": "stdout"}


async def send_telegram(subject: str, body: str) -> dict:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        print(f"[notify:telegram:mock] {subject}\n{body}")
        return {"ok": True, "channel": "telegram", "mode": "mock"}
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(url, json={"chat_id": chat_id, "text": f"{subject}\n\n{body}"})
    return {"ok": r.status_code == 200, "channel": "telegram", "status": r.status_code}


async def send_webhook(url: str | None, payload: dict) -> dict:
    if not url:
        print(f"[notify:webhook:mock] {payload}")
        return {"ok": True, "mode": "mock"}
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(url, json=payload)
    return {"ok": r.status_code < 300, "status": r.status_code}


def send_email(subject: str, body: str) -> dict:
    host = os.getenv("SMTP_HOST")
    if not host:
        print(f"[notify:email:mock] {subject}\n{body}")
        return {"ok": True, "channel": "email", "mode": "mock"}
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = os.getenv("SMTP_FROM", "fxradar@localhost")
    msg["To"] = os.getenv("SMTP_TO", os.getenv("SMTP_FROM", "root@localhost"))
    msg.set_content(body)
    with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587"))) as s:
        s.starttls()
        user, pw = os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD")
        if user and pw:
            s.login(user, pw)
        s.send_message(msg)
    return {"ok": True, "channel": "email"}
