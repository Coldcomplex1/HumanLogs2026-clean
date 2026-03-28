import { Database, tables } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import type {
  CreateRescuePlanInputDto,
  FindRescuePlansInputDto,
  GenerateDescriptionInputDto,
  UpdateRescuePlanInputDto,
} from "./rescue-plan.dto";
import type { WsServer } from "../../ws/ws-server";
import {
  generateMissionDescription,
  suggestMissionGroups,
} from "../../libs/flood";

export class RescuePlanService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
  ) {}

  async findMany(input: FindRescuePlansInputDto) {
    return this.db.query.rescuePlan.findMany({
      where: input.status
        ? eq(tables.rescuePlan.status, input.status)
        : undefined,
      orderBy: [desc(tables.rescuePlan.createdAt)],
      with: {
        locations: { with: { location: true } },
        rescuers: { with: { rescuer: true } },
        vehicles: { with: { vehicle: true } },
      },
    });
  }

  async findById(id: string) {
    return this.db.query.rescuePlan.findFirst({
      where: eq(tables.rescuePlan.id, id),
      with: {
        locations: { with: { location: true } },
        rescuers: { with: { rescuer: true } },
        vehicles: { with: { vehicle: true } },
      },
    });
  }

  private async generateTitle(locationIds?: string[]) {
    if (!locationIds?.length) {
      return "Kế hoạch điều phối mới";
    }

    const locations = await this.db.query.location.findMany({
      where: inArray(tables.location.id, locationIds),
      columns: {
        address: true,
      },
      limit: 3,
    });

    const first = locations[0]?.address ?? "điểm chưa rõ";
    if (locationIds.length === 1) {
      return `Tiếp cận ${first}`;
    }
    return `Điều phối ${first} và ${locationIds.length - 1} điểm khác`;
  }

  private async syncRescuerStatuses(rescuerIds: string[]) {
    if (!rescuerIds.length) return;

    const activePlans = await this.db.query.rescuePlan.findMany({
      where: eq(tables.rescuePlan.status, "active"),
      with: {
        rescuers: true,
      },
    });

    const onMissionIds = new Set(
      activePlans.flatMap((plan) => plan.rescuers.map((link) => link.rescuerId)),
    );

    for (const rescuerId of rescuerIds) {
      if (onMissionIds.has(rescuerId)) {
        await this.db
          .update(tables.rescuer)
          .set({ status: "on_mission" })
          .where(eq(tables.rescuer.id, rescuerId));
      } else {
        await this.db
          .update(tables.rescuer)
          .set({ status: "available" })
          .where(
            and(
              eq(tables.rescuer.id, rescuerId),
              eq(tables.rescuer.status, "on_mission"),
            ),
          );
      }
    }

    this.wsServer.emitRescuerModified();
  }

  private async syncVehicleStatuses(vehicleIds: string[]) {
    if (!vehicleIds.length) return;

    const activePlans = await this.db.query.rescuePlan.findMany({
      where: eq(tables.rescuePlan.status, "active"),
      with: {
        vehicles: true,
      },
    });

    const onMissionIds = new Set(
      activePlans.flatMap((plan) => plan.vehicles.map((link) => link.vehicleId)),
    );

    for (const vehicleId of vehicleIds) {
      if (onMissionIds.has(vehicleId)) {
        await this.db
          .update(tables.vehicle)
          .set({ status: "on_mission" })
          .where(eq(tables.vehicle.id, vehicleId));
      } else {
        await this.db
          .update(tables.vehicle)
          .set({ status: "available" })
          .where(
            and(
              eq(tables.vehicle.id, vehicleId),
              eq(tables.vehicle.status, "on_mission"),
            ),
          );
      }
    }

    this.wsServer.emitVehicleModified();
  }

  private async resolveLocations(planId: string) {
    const locationRows = await this.db.query.rescuePlanLocation.findMany({
      where: eq(tables.rescuePlanLocation.planId, planId),
    });
    const locationIds = locationRows.map((row) => row.locationId);

    if (!locationIds.length) return;

    await this.db
      .update(tables.location)
      .set({
        status: "safe",
        isResolved: true,
        lastVerifiedAt: new Date(),
      })
      .where(inArray(tables.location.id, locationIds));

    this.wsServer.emitLocationModified();
  }

  async create(input: CreateRescuePlanInputDto) {
    const title = input.title || (await this.generateTitle(input.locationIds));

    const plan = await this.db.transaction(async (tx) => {
      const [createdPlan] = await tx
        .insert(tables.rescuePlan)
        .values({
          title,
          description: input.description,
          priority: input.priority ?? "medium",
          status: input.status ?? "draft",
        })
        .returning();

      if (input.locationIds?.length) {
        await tx.insert(tables.rescuePlanLocation).values(
          input.locationIds.map((locationId) => ({
            planId: createdPlan.id,
            locationId,
          })),
        );
      }

      if (input.rescuerIds?.length) {
        await tx.insert(tables.rescuePlanRescuer).values(
          input.rescuerIds.map((rescuerId) => ({
            planId: createdPlan.id,
            rescuerId,
          })),
        );
      }

      if (input.vehicleIds?.length) {
        await tx.insert(tables.rescuePlanVehicle).values(
          input.vehicleIds.map((vehicleId) => ({
            planId: createdPlan.id,
            vehicleId,
          })),
        );
      }

      return createdPlan;
    });

    await this.syncRescuerStatuses(input.rescuerIds ?? []);
    await this.syncVehicleStatuses(input.vehicleIds ?? []);
    this.wsServer.emitRescuePlanModified();
    return this.findById(plan.id);
  }

  async update(input: UpdateRescuePlanInputDto) {
    const { locationIds, rescuerIds, vehicleIds, ...planData } = input.data;

    const existing = await this.db.query.rescuePlan.findFirst({
      where: eq(tables.rescuePlan.id, input.id),
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Không tìm thấy kế hoạch điều phối.",
      });
    }

    if (existing.status !== "draft") {
      const isStatusOnlyChange =
        Object.keys(planData).length === 1 &&
        "status" in planData &&
        locationIds === undefined &&
        rescuerIds === undefined &&
        vehicleIds === undefined;

      if (!isStatusOnlyChange) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kế hoạch không còn ở trạng thái nháp chỉ được phép đổi trạng thái.",
        });
      }
    }

    const previousRescuers = await this.db.query.rescuePlanRescuer.findMany({
      where: eq(tables.rescuePlanRescuer.planId, input.id),
    });
    const previousVehicles = await this.db.query.rescuePlanVehicle.findMany({
      where: eq(tables.rescuePlanVehicle.planId, input.id),
    });

    await this.db.transaction(async (tx) => {
      if (Object.keys(planData).length) {
        await tx
          .update(tables.rescuePlan)
          .set(planData)
          .where(eq(tables.rescuePlan.id, input.id));
      }

      if (locationIds !== undefined) {
        await tx
          .delete(tables.rescuePlanLocation)
          .where(eq(tables.rescuePlanLocation.planId, input.id));
        if (locationIds.length) {
          await tx.insert(tables.rescuePlanLocation).values(
            locationIds.map((locationId) => ({
              planId: input.id,
              locationId,
            })),
          );
        }
      }

      if (rescuerIds !== undefined) {
        await tx
          .delete(tables.rescuePlanRescuer)
          .where(eq(tables.rescuePlanRescuer.planId, input.id));
        if (rescuerIds.length) {
          await tx.insert(tables.rescuePlanRescuer).values(
            rescuerIds.map((rescuerId) => ({
              planId: input.id,
              rescuerId,
            })),
          );
        }
      }

      if (vehicleIds !== undefined) {
        await tx
          .delete(tables.rescuePlanVehicle)
          .where(eq(tables.rescuePlanVehicle.planId, input.id));
        if (vehicleIds.length) {
          await tx.insert(tables.rescuePlanVehicle).values(
            vehicleIds.map((vehicleId) => ({
              planId: input.id,
              vehicleId,
            })),
          );
        }
      }
    });

    await this.syncRescuerStatuses(
      Array.from(
        new Set([
          ...previousRescuers.map((item) => item.rescuerId),
          ...(rescuerIds ?? []),
        ]),
      ),
    );
    await this.syncVehicleStatuses(
      Array.from(
        new Set([
          ...previousVehicles.map((item) => item.vehicleId),
          ...(vehicleIds ?? []),
        ]),
      ),
    );

    if (planData.status === "completed") {
      await this.resolveLocations(input.id);
    }

    this.wsServer.emitRescuePlanModified();
    return this.findById(input.id);
  }

  async delete(id: string) {
    const plan = await this.db.query.rescuePlan.findFirst({
      where: eq(tables.rescuePlan.id, id),
    });

    if (!plan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Không tìm thấy kế hoạch điều phối.",
      });
    }

    if (plan.status !== "draft") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Chỉ có thể xóa kế hoạch ở trạng thái nháp.",
      });
    }

    const previousRescuers = await this.db.query.rescuePlanRescuer.findMany({
      where: eq(tables.rescuePlanRescuer.planId, id),
    });
    const previousVehicles = await this.db.query.rescuePlanVehicle.findMany({
      where: eq(tables.rescuePlanVehicle.planId, id),
    });

    const deleted = await this.db
      .delete(tables.rescuePlan)
      .where(eq(tables.rescuePlan.id, id))
      .returning({ id: tables.rescuePlan.id });

    await this.syncRescuerStatuses(previousRescuers.map((item) => item.rescuerId));
    await this.syncVehicleStatuses(previousVehicles.map((item) => item.vehicleId));
    this.wsServer.emitRescuePlanModified();
    return deleted[0] ?? null;
  }

  async suggestVictimGroups() {
    const locations = await this.db.query.location.findMany({
      where: eq(tables.location.isResolved, false),
      columns: {
        id: true,
        lat: true,
        lng: true,
        emergencyLevel: true,
        preferredTransportMode: true,
      },
    });

    return {
      groups: suggestMissionGroups(locations),
    };
  }

  async generateDescription(input: GenerateDescriptionInputDto) {
    const locations = await this.db.query.location.findMany({
      where: inArray(tables.location.id, input.locationIds),
      columns: {
        address: true,
        emergencyLevel: true,
        preferredTransportMode: true,
        summary: true,
      },
    });

    return {
      content: await generateMissionDescription({
        title: input.title,
        locations,
      }),
    };
  }
}
