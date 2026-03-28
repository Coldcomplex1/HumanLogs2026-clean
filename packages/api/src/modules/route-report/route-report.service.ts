import { Database, tables } from "@repo/db";
import { and, desc, eq, SQL } from "drizzle-orm";
import {
  inferRouteConfidence,
  inferTransportMode,
} from "../../libs/flood";
import type { WsServer } from "../../ws/ws-server";
import type {
  CreateRouteReportInputDto,
  FindRouteReportsInputDto,
  UpdateRouteReportInputDto,
} from "./route-report.dto";

export class RouteReportService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
  ) {}

  async findMany(input: FindRouteReportsInputDto) {
    const whereClause: SQL[] = [];
    if (input.locationId) {
      whereClause.push(eq(tables.routeReport.locationId, input.locationId));
    }
    if (input.markerId) {
      whereClause.push(eq(tables.routeReport.markerId, input.markerId));
    }
    if (input.transportMode) {
      whereClause.push(eq(tables.routeReport.transportMode, input.transportMode));
    }

    return this.db.query.routeReport.findMany({
      where: whereClause.length ? and(...whereClause) : undefined,
      orderBy: [desc(tables.routeReport.reportedAt)],
      with: {
        reporter: true,
        location: true,
        marker: true,
      },
    });
  }

  async findById(id: string) {
    return this.db.query.routeReport.findFirst({
      where: eq(tables.routeReport.id, id),
      with: {
        reporter: true,
        location: true,
        marker: true,
      },
    });
  }

  private async refreshLocation(locationId?: string | null) {
    if (!locationId) return;

    const location = await this.db.query.location.findFirst({
      where: eq(tables.location.id, locationId),
      with: {
        victims: true,
        routeReports: {
          orderBy: [desc(tables.routeReport.reportedAt)],
        },
      },
    });

    if (!location) return;

    const firstVictim = location.victims[0];
    const reports = location.routeReports.slice(0, 3);

    await this.db
      .update(tables.location)
      .set({
        routeConfidence: inferRouteConfidence({
          emergencyLevel: location.emergencyLevel,
          boatAccessible: firstVictim?.boatAccessible,
          waterDepthEstimate: firstVictim?.waterDepthEstimate,
          needTypes: firstVictim?.needTypes,
          needsMedical: firstVictim?.needsMedical,
          reports,
        }),
        preferredTransportMode: inferTransportMode({
          emergencyLevel: location.emergencyLevel,
          boatAccessible: firstVictim?.boatAccessible,
          waterDepthEstimate: firstVictim?.waterDepthEstimate,
          needTypes: firstVictim?.needTypes,
          needsMedical: firstVictim?.needsMedical,
          reports,
        }),
        lastVerifiedAt: new Date(),
      })
      .where(eq(tables.location.id, locationId));
  }

  async create(input: CreateRouteReportInputDto) {
    const [report] = await this.db
      .insert(tables.routeReport)
      .values({
        ...input,
        transportMode: input.transportMode ?? "road",
        confidence: input.confidence ?? "medium",
        isPassable: input.isPassable ?? true,
        reportedAt: input.reportedAt ?? new Date(),
      })
      .returning();

    await this.refreshLocation(report.locationId);
    this.wsServer.emitRouteReportModified();
    this.wsServer.emitLocationModified();
    return this.findById(report.id);
  }

  async update(input: UpdateRouteReportInputDto) {
    await this.db
      .update(tables.routeReport)
      .set(input.data)
      .where(eq(tables.routeReport.id, input.id));
    const report = await this.findById(input.id);
    await this.refreshLocation(report?.locationId);
    this.wsServer.emitRouteReportModified();
    this.wsServer.emitLocationModified();
    return report;
  }

  async delete(id: string) {
    const report = await this.findById(id);
    const deleted = await this.db
      .delete(tables.routeReport)
      .where(eq(tables.routeReport.id, id))
      .returning({ id: tables.routeReport.id });
    await this.refreshLocation(report?.locationId);
    this.wsServer.emitRouteReportModified();
    this.wsServer.emitLocationModified();
    return deleted[0] ?? null;
  }
}
