# Code Conventions

This document outlines the coding standards and conventions for the HumanLogs2026
project.

## General

### Formatting (Prettier)

All code is formatted with Prettier. Configuration in `.prettierrc`:

- Double quotes (`"`) for strings
- Trailing commas everywhere
- No parentheses around single arrow function parameters
- 2 spaces for indentation
- 80 characters print width

Run formatter:

```bash
bun run format
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | `kebab-case.tsx` | `user-profile.tsx` |
| Files (utilities) | `kebab-case.ts` | `format-date.ts` |
| Components | `PascalCase` | `UserProfile` |
| Functions | `camelCase` | `getUserById` |
| Variables | `camelCase` | `userName` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Types/Interfaces | `PascalCase` | `UserProfile` |
| Enums | `PascalCase` | `UserStatus` |

### TypeScript

- Always use TypeScript strict mode
- Prefer `type` over `interface` for object types
- Use `React.FC<Props>` for functional components
- Export types alongside their schemas

```typescript
// Good
export const userSchema = z.object({ name: z.string() });
export type User = z.infer<typeof userSchema>;

// Avoid
interface User {
  name: string;
}
```

---

## Frontend (`apps/web`)

### File Structure

```
src/
├── components/
│   ├── ui/           # Base UI components (shadcn)
│   └── form/         # Form field wrappers
├── context/          # React context providers
├── hooks/            # Custom hooks (use-*.ts)
├── lib/              # Utility functions
├── pages/            # Route-based pages
│   └── [feature]/    # Feature folder
│       ├── feature.tsx
│       ├── feature.context.tsx
│       └── [sub-feature]/
└── trpc/             # tRPC client setup
```

### Component Conventions

#### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Page component | `[name].tsx` | `home.tsx` |
| Context | `[name].context.tsx` | `app.context.tsx` |
| Modal/Dialog | `[name].modal.tsx` | `create-location.modal.tsx` |
| Tab content | `[name].tab.tsx` | `victims.tab.tsx` |
| Hook | `use-[name].ts` | `use-mobile.ts` |

#### Component Structure

```tsx
// 1. Imports (external → internal → relative)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "./app.context";

// 2. Types
type MyComponentProps = {
  title: string;
  onClose?: () => void;
};

// 3. Component
export const MyComponent: React.FC<MyComponentProps> = ({ title, onClose }) => {
  // Hooks first
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useAppContext();

  // Handlers
  const handleClick = () => {
    setIsOpen(true);
  };

  // Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Open</Button>
    </div>
  );
};
```

#### Export Style

- Use **named exports** for components
- One component per file (except small helper components)

```tsx
// Good
export const MyComponent: React.FC = () => { ... };

// Avoid
export default function MyComponent() { ... }
```

### Hooks

- Prefix with `use`
- Place in `src/hooks/` for shared hooks
- Place next to component for component-specific hooks

```typescript
// src/hooks/use-mobile.ts
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  // ...
  return isMobile;
}
```

### Context

- One context per feature/domain
- File naming: `[feature].context.tsx`
- Export both provider and hook

```tsx
// app.context.tsx
const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // ...
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
```

### Styling

- Use TailwindCSS utility classes
- Use `cn()` helper for conditional classes
- Follow existing color tokens (`primary`, `secondary`, `destructive`, `muted`)

```tsx
import { cn } from "@/lib/utils";

<div
  className={cn(
    "p-4 rounded-lg",
    isActive && "bg-primary text-white",
    className,
  )}
/>
```

### Forms

- Use React Hook Form + Zod
- Define schema and type together
- Use `Controller` with form field components

```tsx
const schema = z.object({
  name: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

### API Calls (tRPC)

```tsx
import { api } from "@/trpc/react";

// Query
const { data, isLoading } = api.victim.findMany.useQuery({ search: "" });

// Mutation
const createMutation = api.victim.create.useMutation({
  onSuccess: () => { /* handle success */ },
});
```

---

## Backend (`packages/api`)

### Module Structure

Each feature/domain follows this structure:

```
src/modules/[module]/
├── [module].controller.ts   # tRPC router procedures
├── [module].service.ts      # Business logic class
└── [module].dto.ts          # Zod schemas & types
```

### Controller (tRPC Router)

- File: `[module].controller.ts`
- Define tRPC procedures (queries/mutations)
- Delegate logic to service

```typescript
// victim.controller.ts
import { publicProcedure, t } from "../../trpc";
import { createVictimInputDto, findVictimsWhereInputDto } from "./victim.dto";

export const victimController = t.router({
  findMany: publicProcedure
    .input(findVictimsWhereInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.victim.findMany(input);
    }),

  create: publicProcedure
    .input(createVictimInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.victim.create(input);
    }),
});
```

### Service

- File: `[module].service.ts`
- Class-based with dependency injection
- Contains all business logic and database operations

```typescript
// victim.service.ts
export class VictimService {
  constructor(
    private readonly db: Database,
    private readonly wsServer: WsServer,
  ) {}

  async findMany(input: FindManyVictimsWhereInputDto) {
    return this.db.query.victim.findMany({
      where: /* ... */,
      orderBy: [desc(tables.victim.createdAt)],
    });
  }

  async create(input: CreateVictimInputDto) {
    const result = await this.db
      .insert(tables.victim)
      .values(input)
      .returning();
    this.wsServer.emitVictimModified();
    return result;
  }
}
```

### DTO (Data Transfer Objects)

- File: `[module].dto.ts`
- Define Zod schemas for input validation
- Export both schema and inferred type

```typescript
// victim.dto.ts
import { z } from "zod";

// Schema (camelCase + InputDto suffix)
export const createVictimInputDto = z.object({
  fullname: z.string(),
  phone: z.string(),
  email: z.string().optional(),
});

// Type (PascalCase + InputDto suffix)
export type CreateVictimInputDto = z.infer<typeof createVictimInputDto>;

// For queries with filters
export const findVictimsWhereInputDto = z.object({
  search: z.string().optional(),
});

export type FindManyVictimsWhereInputDto = z.infer<
  typeof findVictimsWhereInputDto
>;
```

### Registering New Modules

1. Create module folder in `packages/api/src/modules/`
2. Create controller, service, and dto files
3. Register service in `packages/api/src/services.ts`
4. Register controller in `packages/api/src/root.ts`

```typescript
// root.ts
import { newModuleController } from "./modules/new-module/new-module.controller";

export const appRouter = t.router({
  // ... existing
  newModule: newModuleController,
});
```

---

## Database (`packages/db`)

### Schema Files

- Location: `packages/db/schemas/[table].schema.ts`
- Use Drizzle ORM conventions

```typescript
// victim.schema.ts
import { pgTable, uuid, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { timestamps } from "./share";

// Enum definition
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// Table definition
export const victim = pgTable("victim", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullname: text("fullname").notNull(),
  phone: text("phone").unique(),
  email: text("email"),
  age: integer("age"),
  gender: genderEnum("gender"),
  ...timestamps,
});

// Relations
export const victimRelations = relations(victim, ({ many, one }) => ({
  location: one(location),
  tags: many(victimTag),
}));
```

### Column Naming

- Use `camelCase` in code
- Drizzle converts to `snake_case` in database

```typescript
// Code: facebookURL → Database: facebook_url
facebookURL: text("facebook_url"),
```

### Migrations

```bash
# Generate migration
bun run db:generate

# Run migration
bun run db:migrate

# Open Drizzle Studio
bun run db:studio
```

---

## Git Conventions

### Branch Naming

```
feature/[ticket-id]-short-description
bugfix/[ticket-id]-short-description
hotfix/[ticket-id]-short-description
```

### Commit Messages

Use conventional commits:

```
feat: add victim search functionality
fix: resolve map marker clustering issue
refactor: extract form validation logic
docs: update README setup instructions
chore: upgrade dependencies
```

---

## Quick Reference

### Adding a New Feature (Full Stack)

1. **Database**: Create schema in `packages/db/schemas/`
2. **Backend**:
   - Create module folder `packages/api/src/modules/[feature]/`
   - Add `[feature].dto.ts` - Zod schemas
   - Add `[feature].service.ts` - Business logic
   - Add `[feature].controller.ts` - tRPC procedures
   - Register in `root.ts` and `services.ts`
3. **Frontend**:
   - Create page in `apps/web/src/pages/[feature]/`
   - Use `api.[feature].[procedure].useQuery/useMutation`

### Adding a New UI Component

```bash
cd apps/web
bunx shadcn@latest add [component-name]
```

### Adding a New Form Field

Create in `apps/web/src/components/form/[field-name]-field.tsx` following the
`TextField` pattern.
