import { Database, tables } from "@repo/db";
import { and, asc, desc, eq, exists, ilike, or, SQL } from "drizzle-orm";
import type { WsServer } from "../../ws/ws-server";
import type {
  CreateLocationInputDto,
  FindManyLocationsWhereInputDto,
  UpdateLocationInputDto,
} from "./location.dto";
import type { MapClient } from "../../libs/map";
import {
  inferRouteConfidence,
  inferTransportMode,
  summarizeCase,
} from "../../libs/flood";

const emergencyScore = { critical: 3, high: 2, medium: 1 } as const;

export class LocationService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
    private readonly mapClient: MapClient,
  ) {}

  async findMany(input: FindManyLocationsWhereInputDto) {
    const whereClause: SQL[] = [];

    if (input.search?.trim()) {
      const searchTerm = `%${input.search.trim()}%`;
      whereClause.push(
        or(
          ilike(tables.location.address, searchTerm),
          ilike(tables.location.summary, searchTerm),
          exists(
            this.db
              .select({ id: tables.victim.id })
              .from(tables.victim)
              .where(
                and(
                  eq(tables.victim.locationId, tables.location.id),
                  or(
                    ilike(tables.victim.fullname, searchTerm),
                    ilike(tables.victim.phone, searchTerm),
                  ),
                ),
              ),
          ),
        )!,
      );
    }

    if (input.emergencyLevel) {
      whereClause.push(eq(tables.location.emergencyLevel, input.emergencyLevel));
    }
    if (input.resolved !== undefined) {
      whereClause.push(eq(tables.location.isResolved, input.resolved));
    }
    if (input.source) {
      whereClause.push(eq(tables.location.source, input.source));
    }
    if (input.transportMode) {
      whereClause.push(
        eq(tables.location.preferredTransportMode, input.transportMode),
      );
    }

    const orderBy =
      input.sort === "oldest"
        ? [asc(tables.location.createdAt)]
        : input.sort === "a-z"
          ? [asc(tables.location.address)]
          : input.sort === "z-a"
            ? [desc(tables.location.address)]
            : [desc(tables.location.createdAt)];

    const locations = await this.db.query.location.findMany({
      where: whereClause.length ? and(...whereClause) : undefined,
      orderBy,
      with: {
        victims: {
          with: {
            tags: true,
          },
        },
        label: true,
        routeReports: {
          with: {
            reporter: true,
          },
          orderBy: [desc(tables.routeReport.reportedAt)],
        },
        relatedConversations: {
          orderBy: [desc(tables.conversation.startedAt)],
        },
      },
    });

    const normalized = locations.map((location) => ({
      ...location,
      title:
        location.emergencyLevel === "critical"
          ? "Nguy kịch"
          : location.emergencyLevel === "high"
            ? "Khẩn cấp"
            : "Cần hỗ trợ",
      victims: location.victims.map((victim) => ({
        ...victim,
        tags: victim.tags,
      })),
    }));

    if (input.sort === "emergency") {
      return normalized.sort(
        (a, b) => emergencyScore[b.emergencyLevel] - emergencyScore[a.emergencyLevel],
      );
    }

    return normalized;
  }

  async findById(id: string) {
    const location = await this.db.query.location.findFirst({
      where: eq(tables.location.id, id),
      with: {
        victims: {
          with: {
            tags: true,
            relatedConversations: true,
          },
        },
        label: true,
        routeReports: {
          with: {
            reporter: true,
            marker: true,
          },
          orderBy: [desc(tables.routeReport.reportedAt)],
        },
        relatedConversations: {
          orderBy: [desc(tables.conversation.startedAt)],
        },
      },
    });

    if (!location) return null;

    return {
      ...location,
      victims: location.victims.map((victim) => ({
        ...victim,
        tags: victim.tags,
      })),
    };
  }

  private async recomputeRouteMeta(locationId: string) {
    const location = await this.db.query.location.findFirst({
      where: eq(tables.location.id, locationId),
      with: {
        victims: true,
        routeReports: {
          orderBy: [desc(tables.routeReport.reportedAt)],
        },
      },
    });

    if (!location) return null;

    const firstVictim = location.victims[0];
    const reports = location.routeReports.slice(0, 3);

    const routeConfidence = inferRouteConfidence({
      emergencyLevel: location.emergencyLevel,
      boatAccessible: firstVictim?.boatAccessible,
      waterDepthEstimate: firstVictim?.waterDepthEstimate,
      needTypes: firstVictim?.needTypes,
      needsMedical: firstVictim?.needsMedical,
      reports,
    });

    const preferredTransportMode = inferTransportMode({
      emergencyLevel: location.emergencyLevel,
      boatAccessible: firstVictim?.boatAccessible,
      waterDepthEstimate: firstVictim?.waterDepthEstimate,
      needTypes: firstVictim?.needTypes,
      needsMedical: firstVictim?.needsMedical,
      reports,
    });

    await this.db
      .update(tables.location)
      .set({
        routeConfidence,
        preferredTransportMode,
      })
      .where(eq(tables.location.id, locationId));

    return { routeConfidence, preferredTransportMode };
  }

  async generateSummary(locationId: string) {
    const location = await this.db.query.location.findFirst({
      where: eq(tables.location.id, locationId),
      with: {
        victims: true,
      },
    });

    if (!location) return null;

    const firstVictim = location.victims[0];
    const summary = await summarizeCase({
      address: location.address,
      emergencyLevel: location.emergencyLevel,
      householdSize:
        firstVictim?.householdSize ??
        location.victims.reduce(
          (count, victim) => count + (victim.householdSize ?? 1),
          0,
        ),
      needsMedical: firstVictim?.needsMedical,
      needTypes: Array.from(
        new Set(location.victims.flatMap((victim) => victim.needTypes)),
      ),
      waterDepthEstimate: firstVictim?.waterDepthEstimate,
      note: location.note,
      summary: location.summary,
    });

    await this.db
      .update(tables.location)
      .set({ summary })
      .where(eq(tables.location.id, locationId));

    await this.recomputeRouteMeta(locationId);
    this.wsServer.emitLocationModified();
    return summary;
  }

  async create(input: CreateLocationInputDto) {
    const reverseGeocoded = await this.mapClient.reverseGeocode(input.lat, input.lng);

    const address =
      input.address ||
      reverseGeocoded?.results?.[0]?.formatted_address ||
      `Tọa độ ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)}`;

    const createdLocation = await this.db.transaction(async (tx) => {
      const firstVictim = input.victims[0];
      const [location] = await tx
        .insert(tables.location)
        .values({
          summary: input.summary,
          note: input.note,
          lat: reverseGeocoded?.results?.[0]?.geometry.location.lat ?? input.lat,
          lng: reverseGeocoded?.results?.[0]?.geometry.location.lng ?? input.lng,
          address,
          emergencyLevel: input.emergencyLevel ?? "medium",
          tags: input.tags ?? [],
          source: input.source ?? "manual",
          routeConfidence:
            input.routeConfidence ??
            inferRouteConfidence({
              emergencyLevel: input.emergencyLevel,
              boatAccessible: firstVictim?.boatAccessible,
              waterDepthEstimate: firstVictim?.waterDepthEstimate,
              needTypes: firstVictim?.needTypes,
              needsMedical: firstVictim?.needsMedical,
            }),
          preferredTransportMode:
            input.preferredTransportMode ??
            inferTransportMode({
              emergencyLevel: input.emergencyLevel,
              boatAccessible: firstVictim?.boatAccessible,
              waterDepthEstimate: firstVictim?.waterDepthEstimate,
              needTypes: firstVictim?.needTypes,
              needsMedical: firstVictim?.needsMedical,
            }),
          lastVerifiedAt: new Date(),
        })
        .returning();

      await tx.insert(tables.victim).values(
        input.victims.map((victim) => ({
          ...victim,
          locationId: location.id,
          needTypes: victim.needTypes ?? [],
          medicineList: victim.medicineList ?? [],
          conversations: victim.conversations ?? [],
          addressText: victim.addressText ?? address,
        })),
      );

      return location;
    });

    this.wsServer.emitLocationModified();
    this.wsServer.emitVictimModified();
    void this.generateSummary(createdLocation.id);
    return this.findById(createdLocation.id);
  }

  async update(input: UpdateLocationInputDto) {
    await this.db.transaction(async (tx) => {
      const nextData = { ...input.data };

      if ((nextData.lat !== undefined || nextData.lng !== undefined) && !nextData.address) {
        const geocoded = await this.mapClient.reverseGeocode(
          nextData.lat ?? 0,
          nextData.lng ?? 0,
        );
        nextData.address = geocoded?.results?.[0]?.formatted_address;
      }

      const { victims, ...locationData } = nextData;

      if (Object.keys(locationData).length) {
        await tx
          .update(tables.location)
          .set(locationData)
          .where(eq(tables.location.id, input.id));
      }

      if (victims) {
        await tx.delete(tables.victim).where(eq(tables.victim.locationId, input.id));
        await tx.insert(tables.victim).values(
          victims.map((victim) => ({
            ...victim,
            locationId: input.id,
            needTypes: victim.needTypes ?? [],
            medicineList: victim.medicineList ?? [],
            conversations: victim.conversations ?? [],
          })),
        );
      }
    });

    await this.recomputeRouteMeta(input.id);
    this.wsServer.emitLocationModified();
    this.wsServer.emitVictimModified();
    if (input.data.summary === undefined) {
      void this.generateSummary(input.id);
    }
    return this.findById(input.id);
  }

  async delete(id: string) {
    const deleted = await this.db
      .delete(tables.location)
      .where(eq(tables.location.id, id))
      .returning({ id: tables.location.id });
    this.wsServer.emitLocationModified();
    this.wsServer.emitVictimModified();
    return deleted[0] ?? null;
  }
}
