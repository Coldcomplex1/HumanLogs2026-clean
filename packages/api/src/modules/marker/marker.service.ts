import { Database, tables } from "@repo/db";
import { and, desc, eq, ilike, SQL } from "drizzle-orm";
import type { WsServer } from "../../ws/ws-server";
import type {
  CreateMarkerInputDto,
  FindManyMarkersWhereInputDto,
  UpdateMarkerInputDto,
} from "./marker.dto";

export class MarkerService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
  ) {}

  async findMany(input: FindManyMarkersWhereInputDto) {
    const whereClause: SQL[] = [];

    if (input.search?.trim()) {
      const searchTerm = `%${input.search.trim()}%`;
      whereClause.push(ilike(tables.marker.name, searchTerm));
    }
    if (input.type) {
      whereClause.push(eq(tables.marker.type, input.type));
    }
    if (input.markType) {
      whereClause.push(eq(tables.marker.markType, input.markType));
    }

    return this.db.query.marker.findMany({
      where: whereClause.length ? and(...whereClause) : undefined,
      orderBy: [desc(tables.marker.updatedAt)],
      with: {
        routeReports: true,
      },
    });
  }

  async findById(id: string) {
    return this.db.query.marker.findFirst({
      where: eq(tables.marker.id, id),
      with: {
        routeReports: true,
      },
    });
  }

  async create(input: CreateMarkerInputDto) {
    const [marker] = await this.db
      .insert(tables.marker)
      .values({
        ...input,
        paths: input.paths ?? null,
      })
      .returning();
    this.wsServer.emitMarkerModified();
    return marker;
  }

  async update(input: UpdateMarkerInputDto) {
    await this.db
      .update(tables.marker)
      .set(input.data)
      .where(eq(tables.marker.id, input.id));
    this.wsServer.emitMarkerModified();
    return this.findById(input.id);
  }

  async delete(id: string) {
    const deleted = await this.db
      .delete(tables.marker)
      .where(eq(tables.marker.id, id))
      .returning({ id: tables.marker.id });
    this.wsServer.emitMarkerModified();
    this.wsServer.emitRouteReportModified();
    return deleted[0] ?? null;
  }
}
