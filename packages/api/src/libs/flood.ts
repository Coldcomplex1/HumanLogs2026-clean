import type {
  EmergencyLevelEnum,
  RouteConfidenceEnum,
  TransportModeEnum,
} from "@repo/db";
import { env } from "../env";
import { openai } from "./openai";

type SummaryInput = {
  address?: string | null;
  householdSize?: number | null;
  needsMedical?: boolean | null;
  needTypes?: string[] | null;
  waterDepthEstimate?: string | null;
  summary?: string | null;
  note?: string | null;
  emergencyLevel?: EmergencyLevelEnum | null;
};

type RouteHintInput = {
  emergencyLevel?: EmergencyLevelEnum | null;
  needsMedical?: boolean | null;
  boatAccessible?: boolean | null;
  waterDepthEstimate?: string | null;
  needTypes?: string[] | null;
  reports?: Array<{
    confidence?: RouteConfidenceEnum | null;
    isPassable?: boolean | null;
    transportMode?: TransportModeEnum | null;
  }>;
};

const hasWaterSignal = (waterDepthEstimate?: string | null) => {
  if (!waterDepthEstimate) return false;
  const normalized = waterDepthEstimate.toLowerCase();
  return (
    normalized.includes("1") ||
    normalized.includes("m") ||
    normalized.includes("sâu") ||
    normalized.includes("ngập")
  );
};

export function inferTransportMode(input: RouteHintInput): TransportModeEnum {
  const latestReport = input.reports?.[0];

  if (latestReport?.transportMode) {
    return latestReport.transportMode;
  }

  if (input.boatAccessible || hasWaterSignal(input.waterDepthEstimate)) {
    return "boat";
  }

  if (input.needsMedical && input.emergencyLevel === "critical") {
    return "ambulance";
  }

  if (input.needTypes?.includes("thuoc")) {
    return "drone";
  }

  if (input.needTypes?.includes("luong_thuc")) {
    return "hand_off";
  }

  return "road";
}

export function inferRouteConfidence(input: RouteHintInput): RouteConfidenceEnum {
  const latestReport = input.reports?.[0];

  if (latestReport?.confidence) {
    return latestReport.confidence;
  }

  if (latestReport?.isPassable === false) {
    return "dangerous";
  }

  if (input.boatAccessible || hasWaterSignal(input.waterDepthEstimate)) {
    return "medium";
  }

  if (!input.needTypes?.length && !input.waterDepthEstimate) {
    return "unverified";
  }

  return "high";
}

export function summarizeCaseHeuristic(input: SummaryInput) {
  const household = input.householdSize ? `Hộ ${input.householdSize} người` : "Hộ dân";
  const medical = input.needsMedical ? "có nhu cầu thuốc men" : null;
  const needs = input.needTypes?.slice(0, 2).join(", ");
  const water = input.waterDepthEstimate ? `mực nước khoảng ${input.waterDepthEstimate}` : null;
  const urgency =
    input.emergencyLevel === "critical"
      ? "cần xử lý ngay"
      : input.emergencyLevel === "high"
        ? "đang cần hỗ trợ sớm"
        : "đang chờ tiếp tế";

  return [household, input.address ? `tại ${input.address}` : null, medical, needs ? `thiếu ${needs}` : null, water, urgency]
    .filter(Boolean)
    .join(", ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function summarizeCase(input: SummaryInput) {
  if (!openai) {
    return summarizeCaseHeuristic(input);
  }

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: `Viết đúng 1 câu tóm tắt tiếng Việt, ngắn gọn, tác nghiệp được, không hoa mỹ.
Dữ liệu:
${JSON.stringify(input)}

Chỉ trả ra 1 câu hoàn chỉnh.`,
        },
      ],
    });

    return response.choices[0]?.message.content?.trim() || summarizeCaseHeuristic(input);
  } catch {
    return summarizeCaseHeuristic(input);
  }
}

export function buildMissionDescriptionHeuristic(input: {
  title?: string;
  locations: Array<{
    address?: string | null;
    emergencyLevel?: EmergencyLevelEnum | null;
    preferredTransportMode?: TransportModeEnum | null;
    summary?: string | null;
  }>;
}) {
  const locationLine = input.locations
    .slice(0, 3)
    .map((location) => location.address || location.summary || "điểm chưa rõ địa chỉ")
    .join("; ");

  const transportModes = Array.from(
    new Set(input.locations.map((location) => location.preferredTransportMode).filter(Boolean)),
  ).join(", ");

  return `## Tình huống
${input.title || "Chiến dịch hỗ trợ lũ lụt"} đang xử lý ${input.locations.length} điểm cần hỗ trợ.

## Mục tiêu
Tiếp cận nhanh, xác minh an toàn và cung cấp hỗ trợ thiết yếu cho các điểm: ${locationLine}.

## Hành động
Phân chia tổ tiếp cận theo cụm gần nhau, ưu tiên điểm khẩn cấp trước và cập nhật realtime sau mỗi lượt xác minh.

## Nhân lực & phương tiện
Ưu tiên bố trí theo phương thức tiếp cận: ${transportModes || "đường bộ hoặc trung chuyển"}.

## Rủi ro an toàn
Theo dõi mực nước, điện hở, dòng chảy mạnh và vật cản nổi trước khi áp sát mục tiêu.

## Phương án tiếp cận
Luôn giữ một điểm bàn giao an toàn để trung chuyển người và hàng cứu trợ khi tuyến cuối khó vào.`;
}

export async function generateMissionDescription(input: Parameters<typeof buildMissionDescriptionHeuristic>[0]) {
  if (!openai) {
    return buildMissionDescriptionHeuristic(input);
  }

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: `Viết mô tả markdown tiếng Việt ngắn, rõ, usable cho kế hoạch điều phối cứu trợ lũ lụt.
Yêu cầu có các mục: Tình huống, Mục tiêu, Hành động, Nhân lực & phương tiện, Rủi ro an toàn, Phương án tiếp cận.

Dữ liệu:
${JSON.stringify(input)}`,
        },
      ],
    });

    return response.choices[0]?.message.content?.trim() || buildMissionDescriptionHeuristic(input);
  } catch {
    return buildMissionDescriptionHeuristic(input);
  }
}

export function suggestMissionGroups<T extends { lat: number; lng: number; emergencyLevel?: EmergencyLevelEnum | null; preferredTransportMode?: TransportModeEnum | null; id: string }>(locations: T[]) {
  const ranked = [...locations].sort((a, b) => {
    const emergencyScore = { critical: 3, high: 2, medium: 1 } as const;
    const aScore = emergencyScore[a.emergencyLevel ?? "medium"];
    const bScore = emergencyScore[b.emergencyLevel ?? "medium"];
    return bScore - aScore;
  });

  const groups: Array<{
    transportMode: TransportModeEnum;
    locationIds: string[];
  }> = [];

  for (const location of ranked) {
    const transportMode = location.preferredTransportMode ?? "road";
    const group = groups.find((entry) => entry.transportMode === transportMode && entry.locationIds.length < 4);
    if (group) {
      group.locationIds.push(location.id);
    } else {
      groups.push({ transportMode, locationIds: [location.id] });
    }
  }

  return groups;
}
