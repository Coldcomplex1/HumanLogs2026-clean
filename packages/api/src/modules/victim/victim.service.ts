import { Database, tables } from "@repo/db";
import { and, desc, eq, exists, ilike, or, SQL } from "drizzle-orm";
import type {
  CreateVictimInputDto,
  FindManyVictimsWhereInputDto,
  UpdateVictimInputDto,
} from "./victim.dto";
import type { WsServer } from "../../ws/ws-server";

export class VictimService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
  ) {}

  async findMany(input: FindManyVictimsWhereInputDto) {
    const whereClause: SQL[] = [];

    if (input.search?.trim()) {
      const searchTerm = `%${input.search.trim()}%`;
      whereClause.push(
        or(
          ilike(tables.victim.fullname, searchTerm),
          ilike(tables.victim.phone, searchTerm),
          ilike(tables.victim.addressText, searchTerm),
          exists(
            this.db
              .select({ id: tables.location.id })
              .from(tables.location)
              .where(
                and(
                  eq(tables.location.id, tables.victim.locationId),
                  ilike(tables.location.address, searchTerm),
                ),
              ),
          ),
        )!,
      );
    }

    const victims = await this.db.query.victim.findMany({
      where: whereClause.length ? and(...whereClause) : undefined,
      orderBy: [desc(tables.victim.createdAt)],
      with: {
        tags: true,
        location: true,
        relatedConversations: true,
      },
    });

    const filtered = victims.filter((victim) => {
      if (input.needType && !victim.needTypes.includes(input.needType)) {
        return false;
      }
      if (input.emergencyLevel && victim.location?.emergencyLevel !== input.emergencyLevel) {
        return false;
      }
      if (input.status && victim.location?.status !== input.status) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (input.sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (input.sort === "a-z") {
        return a.fullname.localeCompare(b.fullname, "vi");
      }
      if (input.sort === "priority") {
        const score = { critical: 3, high: 2, medium: 1 } as const;
        return (
          score[b.location?.emergencyLevel ?? "medium"] -
          score[a.location?.emergencyLevel ?? "medium"]
        );
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }

  async findById(id: string) {
    return this.db.query.victim.findFirst({
      where: eq(tables.victim.id, id),
      with: {
        tags: true,
        location: true,
        relatedConversations: {
          orderBy: [desc(tables.conversation.startedAt)],
        },
      },
    });
  }

  async create(input: CreateVictimInputDto) {
    const { tags, ...victimData } = input;

    const victim = await this.db.transaction(async (tx) => {
      const [createdVictim] = await tx
        .insert(tables.victim)
        .values({
          ...victimData,
          needTypes: input.needTypes ?? [],
          medicineList: input.medicineList ?? [],
          conversations: input.conversations ?? [],
        })
        .returning();

      if (tags?.length) {
        await tx.insert(tables.victimTag).values(
          tags.map((tag) => ({
            victimId: createdVictim.id,
            ...tag,
          })),
        );
      }

      return createdVictim;
    });

    this.wsServer.emitVictimModified();
    if (input.locationId) {
      this.wsServer.emitLocationModified();
    }
    return this.findById(victim.id);
  }

  async update(input: UpdateVictimInputDto) {
    const { tags, ...victimData } = input.data;

    await this.db.transaction(async (tx) => {
      if (Object.keys(victimData).length) {
        await tx
          .update(tables.victim)
          .set(victimData)
          .where(eq(tables.victim.id, input.id));
      }

      if (tags) {
        await tx.delete(tables.victimTag).where(eq(tables.victimTag.victimId, input.id));
        if (tags.length) {
          await tx.insert(tables.victimTag).values(
            tags.map((tag) => ({
              victimId: input.id,
              ...tag,
            })),
          );
        }
      }
    });

    this.wsServer.emitVictimModified();
    if (input.data.locationId !== undefined) {
      this.wsServer.emitLocationModified();
    }
    return this.findById(input.id);
  }

  async delete(id: string) {
    const deleted = await this.db
      .delete(tables.victim)
      .where(eq(tables.victim.id, id))
      .returning({ id: tables.victim.id });
    this.wsServer.emitVictimModified();
    this.wsServer.emitLocationModified();
    return deleted[0] ?? null;
  }
}
