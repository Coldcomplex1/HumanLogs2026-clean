import { Database, tables } from "@repo/db";
import { and, desc, eq, ilike, SQL } from "drizzle-orm";
import type {
  CreateVehicleInputDto,
  FindVehiclesWhereInputDto,
  UpdateVehicleInputDto,
} from "./vehicle.dto";
import type { WsServer } from "../../ws/ws-server";

export class VehicleService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
  ) {}

  async findMany(input: FindVehiclesWhereInputDto) {
    const whereClause: SQL[] = [];

    if (input.search?.trim()) {
      whereClause.push(ilike(tables.vehicle.name, `%${input.search.trim()}%`));
    }
    if (input.vehicleType) {
      whereClause.push(eq(tables.vehicle.vehicleType, input.vehicleType));
    }
    if (input.status) {
      whereClause.push(eq(tables.vehicle.status, input.status));
    }

    return this.db.query.vehicle.findMany({
      where: whereClause.length ? and(...whereClause) : undefined,
      orderBy: [desc(tables.vehicle.createdAt)],
      with: {
        rescuePlanLinks: {
          with: {
            plan: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.db.query.vehicle.findFirst({
      where: eq(tables.vehicle.id, id),
      with: {
        rescuePlanLinks: {
          with: {
            plan: true,
          },
        },
      },
    });
  }

  async create(input: CreateVehicleInputDto) {
    const [vehicle] = await this.db
      .insert(tables.vehicle)
      .values({
        ...input,
        vehicleType: input.vehicleType ?? "boat",
        status: input.status ?? "available",
        tags: input.tags ?? [],
      })
      .returning();
    this.wsServer.emitVehicleModified();
    return vehicle;
  }

  async update(input: UpdateVehicleInputDto) {
    await this.db
      .update(tables.vehicle)
      .set(input.data)
      .where(eq(tables.vehicle.id, input.id));
    this.wsServer.emitVehicleModified();
    return this.findById(input.id);
  }

  async delete(id: string) {
    const deleted = await this.db
      .delete(tables.vehicle)
      .where(eq(tables.vehicle.id, id))
      .returning({ id: tables.vehicle.id });
    this.wsServer.emitVehicleModified();
    this.wsServer.emitRescuePlanModified();
    return deleted[0] ?? null;
  }
}
