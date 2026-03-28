# HumanLogs2026 API

Bun server cho HumanLogs2026, gồm:

- tRPC API
- Socket.IO realtime server
- health endpoint
- ElevenLabs webhook
- debug webhook endpoint cho local testing
- endpoint personalization cho Twilio

Chạy local:

```bash
cd apps/api
bun run dev
```

Build production:

```bash
bun run build
```
