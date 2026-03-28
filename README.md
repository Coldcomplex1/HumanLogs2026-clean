# HumanLogs2026

HumanLogs2026 là nền tảng điều phối cứu trợ khi lũ lụt theo mô hình dashboard-first: tiếp nhận cuộc gọi/nhắn tin AI, tự tạo case, hiển thị điểm hỗ trợ trên bản đồ, quản lý hộ dân, đội cứu trợ, phương tiện, kế hoạch điều phối và cập nhật thời gian thực qua Socket.IO.

## Stack

- Monorepo: Bun workspaces + Turbo
- Frontend: React 19, Vite, Tailwind CSS, React Router, TanStack Query
- Backend: Bun, tRPC, Socket.IO
- Database: PostgreSQL + Drizzle ORM
- Bản đồ: MapLibre GL + react-map-gl
- Form/validation: react-hook-form + zod
- AI/telephony: OpenAI SDK, ElevenLabs React SDK, ElevenLabs webhook, ghi chú Twilio personalization

## Cấu trúc repo

```text
HumanLogs2026/
├── apps/
│   ├── api/              # Bun server, Socket.IO, webhook, health
│   └── web/              # Dashboard, map, CRUD, call/chat, conversations
├── packages/
│   ├── api/              # Routers, services, AI helpers, flood heuristics
│   ├── db/               # Schema, migrations, seed
│   └── typescript-config/
├── docker-compose.yml    # PostgreSQL local
├── .env.example          # Bộ biến mẫu tổng hợp
└── sample-elevenlabs-webhook.json
```

## Chạy local

### Chạy nhanh chỉ với frontend demo

Nếu bạn chưa muốn dựng backend, có thể chạy frontend độc lập bằng mock data:

```bash
cp apps/web/.env.example apps/web/.env
```

Đảm bảo `apps/web/.env` có:

```env
VITE_USE_MOCK_DATA=true
VITE_API_URL=https://example.com
VITE_SOCKET_URL=https://example.com
VITE_AGENT_ID=
```

Sau đó chỉ cần:

```bash
bun install
bun run dev:web
```

Frontend sẽ dùng dữ liệu demo lưu trong `localStorage`, không cần API, không cần PostgreSQL. Các trang `/call` và `/chat` vẫn có thể kết nối ElevenLabs nếu bạn điền `VITE_AGENT_ID`.

### 1. Chuẩn bị môi trường

- Cài Bun 1.3+
- Cài Docker Desktop hoặc Docker Engine
- Sao chép env:

```bash
cp .env.example .env.local-notes
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 2. Khởi động PostgreSQL

```bash
docker compose up -d
```

Postgres mặc định:

- Host: `localhost`
- Port: `5432`
- Database: `humanlogs2026`
- User: `postgres`
- Password: `postgres`

### 3. Cài dependencies

```bash
bun install
```

### 4. Chạy migration và seed

```bash
bun run db:migrate
bun run db:seed
```

### 5. Chạy ứng dụng

```bash
bun run dev
```

Mặc định:

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8000](http://localhost:8000)
- Health: [http://localhost:8000/health](http://localhost:8000/health)

## Scripts chính

- `bun run dev`: chạy cả web và api
- `bun run dev:web`: chạy riêng web
- `bun run dev:api`: chạy riêng api
- `bun run build`: build toàn monorepo
- `bun run check-types`: kiểm tra TypeScript
- `bun run db:migrate`: chạy migration Drizzle
- `bun run db:seed`: nạp dữ liệu demo
- `bun run db:studio`: mở Drizzle Studio

## Dữ liệu demo

Seed mặc định tạo:

- 12+ điểm hỗ trợ tại miền Trung và miền Nam
- 20+ hộ dân / người cần hỗ trợ
- đội cứu trợ, phương tiện, marker nguy hiểm, route reports
- vài kế hoạch điều phối
- conversation cuộc gọi/nhắn tin mẫu

## ElevenLabs

### Browser test surfaces

- `/call`: thử voice agent qua `@elevenlabs/react`
- `/chat`: thử nhắn tin với trợ lý AI
- Nếu thiếu `VITE_AGENT_ID` hoặc `ELEVENLABS_AGENT_ID`, UI vẫn mở nhưng sẽ hiện trạng thái “chưa cấu hình”
- Nếu `VITE_USE_MOCK_DATA=true`, dashboard vẫn chạy hoàn chỉnh bằng dữ liệu demo mà không cần backend

### Webhook sau cuộc gọi

API nhận:

- `POST /webhook/elevenlabs`
- `POST /webhook/debug/elevenlabs`

Local test:

```bash
curl -X POST http://localhost:8000/webhook/debug/elevenlabs \
  -H "Content-Type: application/json" \
  --data @sample-elevenlabs-webhook.json
```

Payload mẫu cũng có tại `sample-elevenlabs-webhook.json` và `apps/api/elevenlabs-webhook.json`.

### Dynamic variables

Hiện tại app hỗ trợ truyền:

- `phone_number`

## Twilio

Repo này ưu tiên luồng:

1. Twilio số hotline nhận cuộc gọi
2. Chuyển sang ElevenLabs agent
3. ElevenLabs gọi webhook về `apps/api`
4. API upsert `conversation`, `victim`, `location`, rồi emit realtime events

Endpoint hỗ trợ ngữ cảnh:

- `GET /twilio/personalize?phoneNumber=...`

Nếu chưa có khóa Twilio, toàn bộ dashboard và browser test vẫn chạy bình thường.

## Deploy

### Web

- Vercel hoặc Netlify đều phù hợp
- Nếu chỉ deploy frontend demo:
  - `VITE_USE_MOCK_DATA=true`
  - `VITE_API_URL=https://example.com`
  - `VITE_SOCKET_URL=https://example.com`
  - `VITE_AGENT_ID=` hoặc agent thật của ElevenLabs
- Nếu dùng backend thật, chuyển `VITE_USE_MOCK_DATA=false` và điền API URL/socket URL thực tế

### API

- Render, Railway, Fly.io hoặc VM Docker/Bun
- Set toàn bộ biến trong `apps/api/.env.example`
- Chạy migration trước khi nhận traffic

### Database

- PostgreSQL managed service hoặc container riêng
- Chỉ cần cập nhật `DATABASE_URL`

## Ghi chú triển khai

- Reverse geocode dùng Goong nếu có key, thiếu key thì vẫn cho nhập địa chỉ thủ công
- Summary case và mô tả kế hoạch dùng OpenAI khi có key, nếu thiếu sẽ fallback heuristic tiếng Việt
- Upload ảnh ưu tiên Cloudinary, nếu thiếu env thì form vẫn dùng URL thủ công / trạng thái graceful
- Không có auth phức tạp để giữ demo flow nhanh

## Known limitations

- Chưa có thuật toán routing khoa học; route confidence hiện là heuristic hỗ trợ điều phối
- Route report hiện hiển thị trong detail sheets, chưa tách thành page riêng
- Môi trường hiện tại cần có Bun/Docker/Postgres thật để verify end-to-end
