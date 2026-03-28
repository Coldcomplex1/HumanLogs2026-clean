import type * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Link } from "react-router-dom";
import { Phone, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import { paths } from "@/paths";
import { cn } from "@/lib/utils";

const AGENT_ID = env.VITE_AGENT_ID;

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null;

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

const generatePhoneNumber = () => `09${Math.floor(100000000 + Math.random() * 900000000)}`;

const getMessageText = (message: unknown) => {
  if (!message || typeof message !== "object") return null;
  const record = message as { message?: unknown; text?: unknown };
  return typeof record.message === "string"
    ? record.message
    : typeof record.text === "string"
      ? record.text
      : null;
};

export const ChatPage: React.FC = () => {
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>(generatePhoneNumber());
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState("");
  const [hasEnteredPhoneNumber, setHasEnteredPhoneNumber] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const conversation = useConversation({
    onMessage: (message) => {
      const text = getMessageText(message);
      if (!text) return;
      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-ai-${previous.length}`,
          role: "ai",
          text,
        },
      ]);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setAgentState("disconnected");
      setErrorMessage("Không thể kết nối trợ lý nhắn tin vào lúc này.");
    },
  });

  const startConversation = useCallback(
    async (phone: string) => {
      if (!AGENT_ID) {
        setSubmittedPhoneNumber(phone);
        setHasEnteredPhoneNumber(true);
        setMessages([
          {
            id: "system",
            role: "ai",
            text: "Chưa có VITE_AGENT_ID nên đây là bề mặt demo. Khi cấu hình xong, trợ lý AI sẽ phản hồi trực tiếp tại đây.",
          },
        ]);
        setAgentState("disconnected");
        return;
      }

      try {
        setErrorMessage(null);
        await conversation.startSession({
          agentId: AGENT_ID,
          connectionType: "websocket",
          textOnly: true,
          onStatusChange: (status) => setAgentState(status.status),
          dynamicVariables: {
            phone_number: phone,
          },
        });
        setSubmittedPhoneNumber(phone);
        setHasEnteredPhoneNumber(true);
        setMessages([
          {
            id: "welcome",
            role: "ai",
            text: "Xin chào, tôi là trợ lý HumanLogs2026. Bạn đang cần hỗ trợ gì tại khu vực bị ngập?",
          },
        ]);
      } catch {
        setAgentState("disconnected");
        setErrorMessage("Không thể bắt đầu phiên nhắn tin với trợ lý AI.");
      }
    },
    [conversation],
  );

  const isValidPhoneNumber = useMemo(() => {
    return (
      (phoneNumber.length === 10 || phoneNumber.length === 11) &&
      phoneNumber.startsWith("0") &&
      /^[0-9]+$/.test(phoneNumber)
    );
  }, [phoneNumber]);

  const handlePhoneSubmit = useCallback(() => {
    if (!isValidPhoneNumber || agentState === "connecting") return;
    setAgentState("connecting");
    void startConversation(phoneNumber);
  }, [agentState, isValidPhoneNumber, phoneNumber, startConversation]);

  const handleSendMessage = useCallback(() => {
    const nextMessage = chatInput.trim();
    if (!nextMessage) return;

    if (agentState === "connected") {
      conversation.sendUserMessage(nextMessage);
    }

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-user-${previous.length}`,
        role: "user",
        text: nextMessage,
      },
    ]);
    setChatInput("");
  }, [agentState, chatInput, conversation]);

  const handleEndChat = useCallback(async () => {
    await conversation.endSession();
    setAgentState("disconnected");
  }, [conversation]);

  const isTransitioning =
    agentState === "connecting" || agentState === "disconnecting";
  const isConnected = agentState === "connected";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#38bdf81a,transparent_28%),linear-gradient(180deg,#eff8ff_0%,#f4f8fb_100%)]">
      <div className="mx-auto max-w-4xl min-h-screen px-6 py-8 flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-700 font-semibold">
              Bề mặt nhắn tin thử nghiệm
            </div>
            <h1 className="text-3xl font-bold mt-2">Nhắn tin AI</h1>
          </div>
          <Link to={paths.call()}>
            <Button variant="outline">
              <Phone className="size-4" />
              Chuyển sang gọi điện
            </Button>
          </Link>
        </div>

        {!hasEnteredPhoneNumber ? (
          <div className="mt-10 max-w-lg rounded-[28px] border border-white/70 bg-white/90 backdrop-blur-xl p-8 shadow-[0_30px_60px_rgba(15,58,95,0.08)]">
            <div className="text-sm text-muted-foreground">
              Nhập số điện thoại trước khi bắt đầu phiên nhắn tin thử với trợ lý AI.
            </div>
            <Input
              nativeInput
              placeholder="09xxxxxxxx"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-4"
            />
            <Button
              onClick={handlePhoneSubmit}
              disabled={!isValidPhoneNumber || isTransitioning}
              className="w-full mt-4"
            >
              {isTransitioning ? <Spinner className="size-5" /> : "Bắt đầu nhắn tin"}
            </Button>
            {errorMessage && (
              <div className="mt-4 text-sm text-amber-700">{errorMessage}</div>
            )}
          </div>
        ) : (
          <div className="mt-8 flex-1 min-h-0 rounded-[28px] border border-white/70 bg-white/92 backdrop-blur-xl shadow-[0_30px_60px_rgba(15,58,95,0.08)] overflow-hidden flex flex-col">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">
                  Phiên nhắn tin với số: {submittedPhoneNumber}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {AGENT_ID
                    ? "Biến gửi kèm: phone_number"
                    : "Chưa cấu hình mã trợ lý AI, đang ở chế độ demo giao diện."}
                </div>
              </div>
              <div
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  isConnected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {isConnected ? "Đã kết nối" : "Chờ trợ lý AI"}
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 flex flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[82%] rounded-3xl px-4 py-3 text-sm shadow-sm",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto bg-slate-100 text-slate-900",
                    )}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form
              className="border-t px-4 py-4 flex gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                nativeInput
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Nhập nội dung cần hỗ trợ..."
                disabled={isTransitioning}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!chatInput.trim() || isTransitioning}
              >
                <SendIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleEndChat()}
                disabled={isTransitioning}
              >
                Kết thúc
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
