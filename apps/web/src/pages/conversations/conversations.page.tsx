import { Badge } from "@/components/ui/badge";
import { Frame } from "@/components/ui/frame";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import dayjs from "dayjs";
import { DashboardLayout } from "../dashboard.layout";
import { ConversationDetailModal, openConversationDetailModal } from "./conversation-detail.modal";

const statusLabels: Record<string, string> = {
  initiated: "Khởi tạo",
  in_progress: "Đang xử lý",
  processing: "Đồng bộ",
  done: "Hoàn tất",
  failed: "Thất bại",
};

const statusVariant = (
  status?: string,
): "error" | "success" | "warning" | "info" | "outline" => {
  switch (status) {
    case "failed":
      return "error";
    case "done":
      return "success";
    case "in_progress":
      return "warning";
    case "initiated":
      return "info";
    default:
      return "outline";
  }
};

export default function ConversationsPage() {
  const conversationsQuery = api.conversation.findMany.useQuery();
  const conversations = conversationsQuery.data || [];

  return (
    <DashboardLayout>
      <div className="p-5 space-y-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-cyan-700 font-semibold">
                Liên lạc AI
              </div>
              <h1 className="text-2xl font-bold">Nhật ký cuộc gọi & nhắn tin</h1>
            </div>
        </div>

        <Frame className="bg-white/90 backdrop-blur-xl border-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Kênh</TableHead>
                <TableHead>Trợ lý AI</TableHead>
                <TableHead className="text-right">Thời lượng</TableHead>
                <TableHead className="text-right">Số tin nhắn</TableHead>
                <TableHead className="text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversationsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="w-full relative h-40">
                    <div className="flex items-center gap-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Spinner />
                      Đang tải...
                    </div>
                  </TableCell>
                </TableRow>
              ) : conversations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Chưa có cuộc gọi hoặc phiên nhắn tin nào được lưu.
                  </TableCell>
                </TableRow>
              ) : (
                conversations.map((conversation) => (
                  <TableRow
                    key={conversation.id}
                    onClick={() => {
                      openConversationDetailModal({
                        conversationId:
                          conversation.providerConversationId ?? conversation.id,
                      });
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div>
                          {dayjs(conversation.startedAt).format(
                            "DD/MM/YYYY HH:mm",
                          )}
                        </div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {conversation.providerConversationId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase text-xs font-semibold">
                      {conversation.channel === "call" ? "Gọi điện" : "Nhắn tin"}
                    </TableCell>
                    <TableCell>{conversation.agentName || "Trợ lý mặc định"}</TableCell>
                    <TableCell className="text-right">
                      {conversation.durationSeconds}s
                    </TableCell>
                    <TableCell className="text-right">
                      {conversation.messageCount}
                    </TableCell>
                    <TableCell className="capitalize text-right">
                      <Badge variant={statusVariant(conversation.status)}>
                        {statusLabels[conversation.status] ?? conversation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Frame>
      </div>
      <ConversationDetailModal />
    </DashboardLayout>
  );
}
