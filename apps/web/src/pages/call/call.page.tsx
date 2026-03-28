import type * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Link } from "react-router-dom";
import { MessageCircle, PhoneIcon, PhoneOffIcon, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const generatePhoneNumber = () => `09${Math.floor(100000000 + Math.random() * 900000000)}`;

export const CallPage: React.FC = () => {
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>(generatePhoneNumber());

  const conversation = useConversation({
    onError: (error) => {
      console.error("Conversation error:", error);
      setAgentState("disconnected");
      setErrorMessage("Không thể kết nối với trợ lý thoại vào lúc này.");
    },
  });

  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      setErrorMessage("Chưa cấu hình `VITE_AGENT_ID`, trang vẫn sẵn sàng để demo UI.");
      return;
    }

    try {
      setErrorMessage(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
        onStatusChange: (status) => setAgentState(status.status),
        dynamicVariables: {
          phone_number: phoneNumber,
        },
      });
    } catch (error) {
      setAgentState("disconnected");
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Trình duyệt chưa được cấp quyền microphone.");
      } else {
        setErrorMessage("Không thể bắt đầu phiên gọi thử.");
      }
    }
  }, [conversation, phoneNumber]);

  const handleCallToggle = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting");
      void startConversation();
    } else if (agentState === "connected") {
      void conversation.endSession();
      setAgentState("disconnected");
    }
  }, [agentState, conversation, startConversation]);

  const isCallActive = agentState === "connected";
  const isTransitioning =
    agentState === "connecting" || agentState === "disconnecting";

  const isValidPhoneNumber = useMemo(() => {
    return (
      (phoneNumber.length === 10 || phoneNumber.length === 11) &&
      phoneNumber.startsWith("0") &&
      /^[0-9]+$/.test(phoneNumber)
    );
  }, [phoneNumber]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#38bdf81a,transparent_28%),linear-gradient(180deg,#091a2a_0%,#0f3a5f_100%)] text-white">
      <div className="mx-auto max-w-3xl px-6 py-8 min-h-screen flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/80 font-semibold">
              Thử nghiệm thoại trên trình duyệt
            </div>
            <h1 className="text-3xl font-bold mt-2">Gọi điện AI</h1>
          </div>
          <Link to={paths.chat()}>
            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/14">
              <MessageCircle className="size-4" />
              Chuyển sang nhắn tin
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr] flex-1">
          <div className="rounded-[28px] border border-white/10 bg-white/8 backdrop-blur-xl p-8 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-cyan-400/18 flex items-center justify-center">
                <Waves className="size-6 text-cyan-200" />
              </div>
              <div>
                <div className="font-semibold text-lg">Trợ lý thoại cứu trợ</div>
                <div className="text-sm text-cyan-50/70">
                  Thu thập nhu cầu hỗ trợ, địa chỉ và mức độ khẩn cấp.
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="text-sm text-cyan-50/70">Số điện thoại dùng cho phiên test</div>
              <input
                placeholder="Nhập số điện thoại"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-white/15 bg-slate-950/30 px-5 py-4 text-3xl font-semibold outline-none"
              />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/20 p-4">
              {errorMessage ? (
                <p className="text-sm text-amber-200">{errorMessage}</p>
              ) : AGENT_ID ? (
                <p className="text-sm text-cyan-50/80">
                  Biến gửi kèm: <span className="font-semibold">phone_number</span>
                </p>
              ) : (
                <p className="text-sm text-cyan-50/80">
                  Chưa có `VITE_AGENT_ID`. UI vẫn render để demo, nhưng sẽ không tạo phiên gọi thật.
                </p>
              )}
            </div>

            <div className="mt-auto pt-10 flex justify-center">
              <div className="relative w-fit">
                {isTransitioning && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-cyan-300/25" />
                )}
                <Button
                  onClick={handleCallToggle}
                  disabled={isTransitioning || !isValidPhoneNumber}
                  size="icon-xl"
                  variant={isCallActive ? "destructive" : "default"}
                  className="size-24! rounded-full shadow-[0_18px_50px_rgba(14,165,233,0.25)]"
                >
                  {isTransitioning ? (
                    <Spinner className="size-9" />
                  ) : isCallActive ? (
                    <PhoneOffIcon className="size-10" />
                  ) : (
                    <PhoneIcon className="size-10" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/8 backdrop-blur-xl p-6">
            <div className="text-sm uppercase tracking-[0.18em] text-cyan-200/75 font-semibold">
              Trạng thái
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div
                className={cn(
                  "size-3 rounded-full",
                  isCallActive && "bg-emerald-400",
                  isTransitioning && "bg-amber-400 animate-pulse",
                  !isCallActive && !isTransitioning && "bg-slate-300",
                )}
              />
              <div className="text-lg font-semibold">
                {isCallActive
                  ? "Đang kết nối trợ lý AI"
                  : isTransitioning
                    ? "Đang chuyển trạng thái"
                    : "Sẵn sàng gọi thử"}
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-cyan-50/75">
              <p>1. Cho phép microphone khi trình duyệt hỏi quyền.</p>
              <p>2. Nhấn nút gọi để bắt đầu phiên thoại với trợ lý AI.</p>
              <p>3. Sau cuộc gọi, webhook ElevenLabs sẽ tự đồng bộ dữ liệu vào dashboard nếu backend đã cấu hình.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallPage;
