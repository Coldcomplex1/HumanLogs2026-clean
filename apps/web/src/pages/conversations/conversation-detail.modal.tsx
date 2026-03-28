import type * as React from "react";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { api, RouterOutputs } from "@/trpc/react";
import { cn } from "@/lib/utils";
import EventEmitter from "events";
import { useEffect, useState } from "react";
import { BotIcon, Loader2Icon, UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTab } from "@/components/ui/tabs";
import { prettyDate } from "@/lib/dayjs";

type Conversation = RouterOutputs["conversation"]["findById"];

const events = new EventEmitter();

type Args = {
  conversationId: string;
};

const statusLabels: Record<string, string> = {
  initiated: "Khởi tạo",
  in_progress: "Đang xử lý",
  processing: "Đồng bộ",
  done: "Hoàn tất",
  failed: "Thất bại",
};

const transportRoleLabel = (role: string) =>
  role === "user" ? "Người dân" : "AI";

export const ConversationDetailModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<Args | null>(null);

  const conversationQuery = api.conversation.findById.useQuery(
    { id: args?.conversationId || "" },
    {
      enabled: !!args?.conversationId,
    },
  );

  const conversation = conversationQuery.data;

  useEffect(() => {
    const handler = (nextArgs: Args) => {
      setArgs(nextArgs);
      setOpen(true);
    };
    events.on("open", handler);
    return () => {
      events.off("open", handler);
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetPopup side="right" className="max-w-xl">
        <SheetHeader>
          <SheetTitle>Chi tiết cuộc gọi / nhắn tin</SheetTitle>
          {conversation && (
            <SheetDescription className="flex items-center gap-2">
              <span>{conversation.agentName || "Trợ lý mặc định"}</span>
              <Badge variant="outline">
                {statusLabels[conversation.status] ?? conversation.status}
              </Badge>
            </SheetDescription>
          )}
        </SheetHeader>
        <SheetPanel>
          {conversationQuery.isFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversation ? (
            <Tabs>
              <div className="border-b">
                <TabsList variant="underline">
                  <TabsTab value="summary">Tổng quan</TabsTab>
                  <TabsTab value="transcript">Nội dung</TabsTab>
                </TabsList>
              </div>
              <TabsContent value="summary">
                <SummaryTab conversation={conversation} />
              </TabsContent>
              <TabsContent value="transcript">
                <TranscriptTab conversation={conversation} />
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-sm text-muted-foreground">
              Không thể tải chi tiết cuộc gọi.
            </p>
          )}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
};

export const openConversationDetailModal = (args: Args) => {
  events.emit("open", args);
};

const SummaryTab = ({ conversation }: { conversation: Conversation }) => {
  const entries = Object.entries(
    (conversation?.dataCollectionResults as Record<string, unknown>) ?? {},
  );

  return (
    <div className="space-y-6 mt-6">
      <section>
        <h3 className="text-sm font-semibold">Tóm tắt</h3>
        <p className="text-sm mt-1">
          {conversation.summary || "Chưa có tóm tắt cho cuộc gọi này."}
        </p>
      </section>
      <hr className="my-4" />
      <section>
        <h3 className="text-sm font-semibold">Kết quả thu thập dữ liệu</h3>
        <div className="w-full gap-2 p-2 border rounded-md mt-1 divide-y bg-muted/20">
          {entries.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              Chưa có trường dữ liệu nào được trích xuất.
            </div>
          ) : (
            entries.map(([key, value]) => (
              <div key={key} className="p-2 flex items-start gap-3">
                <div className="text-sm text-muted-foreground min-w-36">
                  {key}
                </div>
                <div className="text-sm font-semibold">
                  {Array.isArray(value)
                    ? value.join(", ")
                    : typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      <hr className="my-4" />
      <section className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold">Thời gian</h3>
          <p className="text-sm mt-1">
            {conversation.startedAt
              ? prettyDate(new Date(conversation.startedAt))
              : "Chưa rõ"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Thời lượng</h3>
          <p className="text-sm mt-1">{conversation.durationSeconds} giây</p>
        </div>
      </section>
    </div>
  );
};

const TranscriptTab = ({ conversation }: { conversation: Conversation }) => {
  const transcript = Array.isArray(conversation.transcript)
    ? conversation.transcript
    : [];

  return (
    <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto py-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Nội dung hội thoại
      </h3>
      <div className="space-y-3">
        {transcript.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có tin nhắn nào trong bản ghi này.
          </p>
        ) : (
          transcript.map((entry, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                entry.role === "user" && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  entry.role === "user"
                    ? "border border-cyan-200 bg-cyan-50"
                    : "bg-muted",
                )}
              >
                {entry.role === "user" ? (
                  <UserIcon className="h-4 w-4" />
                ) : (
                  <BotIcon className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "flex-1 max-w-sm rounded-2xl px-3 py-2 text-sm",
                  entry.role === "user"
                    ? "border border-cyan-200 bg-cyan-50"
                    : "bg-muted",
                )}
              >
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1">
                  {transportRoleLabel(entry.role)}
                </div>
                {entry.message || (
                  <span className="italic text-muted-foreground">
                    Không có nội dung
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
