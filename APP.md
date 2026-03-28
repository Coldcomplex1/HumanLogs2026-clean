# HumanLogs2026

HumanLogs2026 là bộ điều phối cứu trợ mùa lũ dành cho đội vận hành nội bộ và lực lượng cứu trợ:

- tiếp nhận cuộc gọi / chat AI
- tạo và cập nhật case tự động qua webhook
- hiển thị điểm hỗ trợ, vùng nguy hiểm và tuyến đường trên bản đồ
- điều phối đội cứu trợ, phương tiện và kế hoạch triển khai
- đồng bộ realtime qua Socket.IO

## Module chính

- Dashboard bản đồ `/`
- Hộ dân / người cần hỗ trợ `/victims`
- Đội cứu trợ `/rescuers`
- Phương tiện cứu trợ `/vehicles`
- Kế hoạch điều phối `/rescue-plans`
- Gọi điện AI `/call`
- Nhắn tin AI `/chat`
- Nhật ký cuộc gọi & chat `/conversations`

## Flow nghiệp vụ

1. Người dân gọi điện hoặc chat với AI
2. ElevenLabs trả transcript + data collection về webhook
3. API upsert `conversation`, `victim`, `location`
4. Dashboard nhận socket events và tự làm mới danh sách / bản đồ
5. Điều phối viên gom điểm thành rescue plan, gán người và phương tiện

## Hạ tầng

- Bun monorepo + Turbo
- React/Vite/Tailwind
- tRPC + Socket.IO
- Drizzle + PostgreSQL
- MapLibre GL
