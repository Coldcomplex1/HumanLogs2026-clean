import { Database, tables } from "@repo/db";
import { desc, eq, or } from "drizzle-orm";

export class ConversationService {
  constructor(private readonly db: Database) {}

  async findMany() {
    return this.db.query.conversation.findMany({
      orderBy: [desc(tables.conversation.startedAt)],
      with: {
        victim: true,
        location: true,
      },
    });
  }

  async findById(id: string) {
    return this.db.query.conversation.findFirst({
      where: or(
        eq(tables.conversation.id, id),
        eq(tables.conversation.providerConversationId, id),
      ),
      with: {
        victim: true,
        location: true,
      },
    });
  }
}
