import { Database, tables } from "@repo/db";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import type { WsServer } from "../../ws/ws-server";
import type {
  CreateRescuerInputDto,
  FindRescuersWhereInputDto,
  UpdateRescuerInputDto,
} from "./rescuer.dto";

export class RescuerService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
  ) {}

  async findMany(input: FindRescuersWhereInputDto) {
    const whereClause: SQL[] = [];

    if (input.search?.trim()) {
      const searchTerm = `%${input.search.trim()}%`;
      whereClause.push(
        or(
          ilike(tables.rescuer.fullName, searchTerm),
          ilike(tables.rescuer.phone, searchTerm),
        )!,
      );
    }
    if (input.status) {
      whereClause.push(eq(tables.rescuer.status, input.status));
    }
    if (input.role) {
      whereClause.push(eq(tables.rescuer.role, input.role));
    }
    if (input.region?.trim()) {
      whereClause.push(ilike(tables.rescuer.region, `%${input.region.trim()}%`));
    }

    const rescuers = await this.db.query.rescuer.findMany({
      where: whereClause.length ? and(...whereClause) : undefined,
      orderBy: [desc(tables.rescuer.createdAt)],
      with: {
        rescuePlanLinks: {
          with: {
            plan: true,
          },
        },
        routeReports: {
          orderBy: [desc(tables.routeReport.reportedAt)],
        },
      },
    });

    return rescuers.map((rescuer) => {
      const currentPlan = rescuer.rescuePlanLinks.find(
        (link) => link.plan.status === "active",
      )?.plan;

      return {
        ...rescuer,
        currentPlan,
      };
    });
  }

  async findById(id: string) {
    const rescuer = await this.db.query.rescuer.findFirst({
      where: eq(tables.rescuer.id, id),
      with: {
        rescuePlanLinks: {
          with: {
            plan: true,
          },
        },
        routeReports: {
          with: {
            location: true,
            marker: true,
          },
          orderBy: [desc(tables.routeReport.reportedAt)],
        },
      },
    });

    if (!rescuer) return null;

    return {
      ...rescuer,
      currentPlan: rescuer.rescuePlanLinks.find(
        (link) => link.plan.status === "active",
      )?.plan,
    };
  }

  async create(input: CreateRescuerInputDto) {
    const [rescuer] = await this.db
      .insert(tables.rescuer)
      .values({
        ...input,
        role: input.role ?? "volunteer",
        status: input.status ?? "available",
        experienceLevel: input.experienceLevel ?? "intermediate",
        certifications: input.certifications ?? [],
      })
      .returning();
    this.wsServer.emitRescuerModified();
    return rescuer;
  }

  async update(input: UpdateRescuerInputDto) {
    await this.db
      .update(tables.rescuer)
      .set(input.data)
      .where(eq(tables.rescuer.id, input.id));
    this.wsServer.emitRescuerModified();
    return this.findById(input.id);
  }

  async delete(id: string) {
    const deleted = await this.db
      .delete(tables.rescuer)
      .where(eq(tables.rescuer.id, id))
      .returning({ id: tables.rescuer.id });
    this.wsServer.emitRescuerModified();
    this.wsServer.emitRescuePlanModified();
    return deleted[0] ?? null;
  }
}
