import {
  Database,
  needTypeEnumValues,
  tables,
  type EmergencyLevelEnum,
} from "@repo/db";
import { eq } from "drizzle-orm";
import type { ElevenLabsClient } from "../../libs/elevenlabs";
import type { MapClient } from "../../libs/map";
import {
  inferRouteConfidence,
  inferTransportMode,
  summarizeCase,
} from "../../libs/flood";
import type { WsServer } from "../../ws/ws-server";

const DEFAULT_FALLBACK_COORDS = {
  lat: 16.047079,
  lng: 108.20623,
};

type FlexibleWebhookPayload = Record<string, unknown>;

export class WebhookService {
  constructor(
    private readonly db: Database,
    private readonly elevenLabsClient: ElevenLabsClient | null,
    private readonly mapClient: MapClient,
    private readonly wsServer: WsServer,
  ) {}

  private toBoolean(value: unknown) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return ["yes", "true", "1", "co", "có"].includes(value.toLowerCase());
    }
    return false;
  }

  private toStringArray(value: unknown) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/[,\n;]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  private getCollectionValue(
    collectionResults: Record<string, unknown>,
    key: string,
  ) {
    const value = collectionResults?.[key];
    if (value && typeof value === "object" && "value" in value) {
      return (value as { value?: unknown }).value;
    }
    return value;
  }

  private mapEmergencyLevel(emergencyLevel: unknown): EmergencyLevelEnum {
    if (!emergencyLevel) return "medium";
    const normalized = String(emergencyLevel).toLowerCase();
    if (
      normalized.includes("critical") ||
      normalized.includes("cực kỳ") ||
      normalized.includes("nguy kịch")
    ) {
      return "critical";
    }
    if (
      normalized.includes("high") ||
      normalized.includes("cao") ||
      normalized.includes("khẩn")
    ) {
      return "high";
    }
    return "medium";
  }

  private normalizeTranscript(transcript: unknown) {
    if (!Array.isArray(transcript)) return [];

    return transcript
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        return {
          role: String(record.role ?? record.source ?? "unknown"),
          message: String(record.message ?? record.text ?? ""),
          timeInCallSecs:
            typeof record.time_in_call_secs === "number"
              ? record.time_in_call_secs
              : typeof record.timeInCallSecs === "number"
                ? record.timeInCallSecs
                : null,
        };
      })
      .filter((item): item is { role: string; message: string; timeInCallSecs: number | null } =>
        Boolean(item?.message),
      );
  }

  private async fetchConversationIfNeeded(payload: FlexibleWebhookPayload) {
    const eventData = payload.data ?? payload;
    if (
      (eventData.analysis || payload.analysis) ||
      !eventData.conversation_id ||
      !this.elevenLabsClient
    ) {
      return payload;
    }

    try {
      return await this.elevenLabsClient.conversationalAi.conversations.get(
        eventData.conversation_id,
      );
    } catch {
      return payload;
    }
  }

  async handleElevenLabsWebhook(payload: FlexibleWebhookPayload) {
    const resolvedPayload = await this.fetchConversationIfNeeded(payload);
    const eventData = resolvedPayload.data ?? resolvedPayload;
    const analysis = eventData.analysis ?? resolvedPayload.analysis ?? {};
    const metadata = eventData.metadata ?? {};
    const dynamicVariables =
      eventData.conversation_initiation_client_data?.dynamic_variables ??
      resolvedPayload.conversation_initiation_client_data?.dynamic_variables ??
      {};

    const collectionResults =
      analysis.data_collection_results ??
      analysis.dataCollectionResults ??
      analysis.data_collection_results_list ??
      {};

    const providerConversationId =
      eventData.conversation_id ?? resolvedPayload.conversation_id;

    if (!providerConversationId) {
      return { ok: false, reason: "missing_conversation_id" };
    }

    const phoneNumber =
      dynamicVariables.phone_number ??
      this.getCollectionValue(collectionResults, "phone_number") ??
      metadata.phone_call?.from_number ??
      null;

    const name =
      this.getCollectionValue(collectionResults, "name") || "Người dân chưa rõ tên";
    const fullAddress = this.getCollectionValue(collectionResults, "full_address");
    const needTypes = this.toStringArray(
      this.getCollectionValue(collectionResults, "need_types"),
    );
    const normalizedNeedTypes = needTypes.filter(
      (item): item is (typeof needTypeEnumValues)[number] =>
        needTypeEnumValues.includes(item as (typeof needTypeEnumValues)[number]),
    );
    const medicineList = this.toStringArray(
      this.getCollectionValue(collectionResults, "medicine_list"),
    );
    const emergencyLevel = this.mapEmergencyLevel(
      this.getCollectionValue(collectionResults, "emergency_level"),
    );
    const needsMedical = this.toBoolean(
      this.getCollectionValue(collectionResults, "needs_medical"),
    );
    const hasChildren = this.toBoolean(
      this.getCollectionValue(collectionResults, "has_children"),
    );
    const hasElderly = this.toBoolean(
      this.getCollectionValue(collectionResults, "has_elderly"),
    );
    const hasDisability = this.toBoolean(
      this.getCollectionValue(collectionResults, "has_disability"),
    );
    const isPregnant = this.toBoolean(
      this.getCollectionValue(collectionResults, "is_pregnant"),
    );
    const boatAccessible = this.toBoolean(
      this.getCollectionValue(collectionResults, "boat_accessible"),
    );
    const householdSizeRaw = this.getCollectionValue(
      collectionResults,
      "household_size",
    );
    const householdSize =
      typeof householdSizeRaw === "number"
        ? householdSizeRaw
        : Number.parseInt(String(householdSizeRaw || ""), 10) || undefined;
    const waterDepth =
      this.getCollectionValue(collectionResults, "water_depth") || undefined;
    const additionalNotes =
      this.getCollectionValue(collectionResults, "additional_notes") || undefined;

    const geocode = fullAddress
      ? await this.mapClient.geocode(String(fullAddress))
      : null;
    const geoResult = geocode?.results?.[0];
    const address =
      geoResult?.formatted_address || fullAddress || "Địa chỉ chưa xác minh";
    const lat = geoResult?.geometry.location.lat ?? DEFAULT_FALLBACK_COORDS.lat;
    const lng = geoResult?.geometry.location.lng ?? DEFAULT_FALLBACK_COORDS.lng;

    const summary =
      analysis.transcript_summary ||
      (await summarizeCase({
        address,
        emergencyLevel,
        householdSize,
        needsMedical,
        needTypes: normalizedNeedTypes,
        waterDepthEstimate: String(waterDepth || ""),
        note: String(additionalNotes || ""),
      }));

    const transcript = this.normalizeTranscript(
      eventData.transcript ?? resolvedPayload.transcript,
    );

    const existingVictim = phoneNumber
      ? await this.db.query.victim.findFirst({
          where: eq(tables.victim.phone, String(phoneNumber)),
        })
      : null;

    const existingConversation = await this.db.query.conversation.findFirst({
      where: eq(tables.conversation.providerConversationId, String(providerConversationId)),
    });

    const result = await this.db.transaction(async (tx) => {
      let locationId = existingVictim?.locationId ?? existingConversation?.locationId ?? null;

      if (!locationId) {
        const [createdLocation] = await tx
          .insert(tables.location)
          .values({
            summary,
            note: additionalNotes,
            lat,
            lng,
            address,
            emergencyLevel,
            routeConfidence: inferRouteConfidence({
              emergencyLevel,
              boatAccessible,
              waterDepthEstimate: String(waterDepth || ""),
              needTypes: normalizedNeedTypes,
              needsMedical,
            }),
            preferredTransportMode: inferTransportMode({
              emergencyLevel,
              boatAccessible,
              waterDepthEstimate: String(waterDepth || ""),
              needTypes: normalizedNeedTypes,
              needsMedical,
            }),
            source:
              eventData.metadata?.text_only ||
              resolvedPayload.metadata?.text_only
                ? "chat"
                : "call",
            lastVerifiedAt: new Date(),
            tags: normalizedNeedTypes,
          })
          .returning();

        locationId = createdLocation.id;
      } else {
        await tx
          .update(tables.location)
          .set({
            summary,
            note: additionalNotes,
            address,
            emergencyLevel,
            routeConfidence: inferRouteConfidence({
              emergencyLevel,
              boatAccessible,
              waterDepthEstimate: String(waterDepth || ""),
              needTypes: normalizedNeedTypes,
              needsMedical,
            }),
            preferredTransportMode: inferTransportMode({
              emergencyLevel,
              boatAccessible,
              waterDepthEstimate: String(waterDepth || ""),
              needTypes: normalizedNeedTypes,
              needsMedical,
            }),
            source:
              eventData.metadata?.text_only ||
              resolvedPayload.metadata?.text_only
                ? "chat"
                : "call",
            lastVerifiedAt: new Date(),
            tags: normalizedNeedTypes,
          })
          .where(eq(tables.location.id, locationId));
      }

      let victimId = existingVictim?.id ?? existingConversation?.victimId ?? null;

      if (!victimId) {
        const [victim] = await tx
          .insert(tables.victim)
          .values({
            fullname: String(name),
            phone: phoneNumber ? String(phoneNumber) : undefined,
            gender:
              this.getCollectionValue(collectionResults, "gender") === "female"
                ? "female"
                : this.getCollectionValue(collectionResults, "gender") === "male"
                  ? "male"
                  : undefined,
            addressText: address,
            note: additionalNotes,
            locationId,
            conversations: [String(providerConversationId)],
            householdSize,
            hasChildren,
            hasElderly,
            hasDisability,
            isPregnant,
            needsMedical,
            needTypes: normalizedNeedTypes,
            medicineList,
            waterDepthEstimate: String(waterDepth || ""),
            boatAccessible,
          })
          .returning();
        victimId = victim.id;
      } else {
        const currentVictim = await tx.query.victim.findFirst({
          where: eq(tables.victim.id, victimId),
        });

        await tx
          .update(tables.victim)
          .set({
            fullname: String(name),
            phone: phoneNumber ? String(phoneNumber) : currentVictim?.phone,
            addressText: address,
            note: additionalNotes,
            locationId,
            conversations: Array.from(
              new Set([
                ...(currentVictim?.conversations ?? []),
                String(providerConversationId),
              ]),
            ),
            householdSize,
            hasChildren,
            hasElderly,
            hasDisability,
            isPregnant,
            needsMedical,
            needTypes: normalizedNeedTypes,
            medicineList,
            waterDepthEstimate: String(waterDepth || ""),
            boatAccessible,
          })
          .where(eq(tables.victim.id, victimId));
      }

      if (existingConversation) {
        await tx
          .update(tables.conversation)
          .set({
            channel:
              eventData.metadata?.text_only ||
              resolvedPayload.metadata?.text_only
                ? "chat"
                : "call",
            agentName:
              eventData.agent_name ??
              resolvedPayload.agent_name ??
              existingConversation.agentName,
            status:
              eventData.status ??
              resolvedPayload.status ??
              existingConversation.status,
            startedAt:
              metadata.start_time_unix_secs
                ? new Date(metadata.start_time_unix_secs * 1000)
                : existingConversation.startedAt,
            durationSeconds:
              metadata.call_duration_secs ?? existingConversation.durationSeconds,
            messageCount:
              transcript.length || existingConversation.messageCount,
            phoneNumber: phoneNumber ? String(phoneNumber) : existingConversation.phoneNumber,
            summary,
            dataCollectionResults: collectionResults,
            transcript,
            rawPayload: resolvedPayload,
            victimId,
            locationId,
          })
          .where(eq(tables.conversation.id, existingConversation.id));
      } else {
        await tx.insert(tables.conversation).values({
          providerConversationId: String(providerConversationId),
          channel:
            eventData.metadata?.text_only || resolvedPayload.metadata?.text_only
              ? "chat"
              : "call",
          agentName: eventData.agent_name ?? resolvedPayload.agent_name ?? null,
          status: eventData.status ?? resolvedPayload.status ?? "done",
          startedAt: metadata.start_time_unix_secs
            ? new Date(metadata.start_time_unix_secs * 1000)
            : new Date(),
          durationSeconds: metadata.call_duration_secs ?? 0,
          messageCount: transcript.length,
          phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
          summary,
          dataCollectionResults: collectionResults,
          transcript,
          rawPayload: resolvedPayload,
          victimId,
          locationId,
        });
      }

      return { victimId, locationId };
    });

    this.wsServer.emitVictimModified();
    this.wsServer.emitLocationModified();

    return {
      ok: true,
      providerConversationId,
      ...result,
    };
  }

  async getPersonalization(phoneNumber?: string | null) {
    if (!phoneNumber) {
      return {
        known_caller: false,
      };
    }

    const victim = await this.db.query.victim.findFirst({
      where: eq(tables.victim.phone, phoneNumber),
      with: {
        location: true,
      },
    });

    if (!victim) {
      return {
        known_caller: false,
      };
    }

    return {
      known_caller: true,
      full_name: victim.fullname,
      previous_address: victim.addressText ?? victim.location?.address ?? null,
      latest_need_types: victim.needTypes,
      needs_medical: victim.needsMedical,
    };
  }
}
