import { createRoot } from "react-dom/client";
import "./index.css";
import HomePage from "./pages/home/home.page.tsx";
import { SocketProvider } from "./context/socket.context.tsx";
import {
  AnchoredToastProvider,
  ToastProvider,
} from "./components/ui/toast.tsx";
import { TRPCReactProvider } from "./trpc/react.tsx";
import { NuqsAdapter } from "nuqs/adapters/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { paths } from "./paths.ts";
import VictimsPage from "./pages/victims/victims.page.tsx";
import RescuersPage from "./pages/rescuers/rescuers.page.tsx";
import CallPage from "./pages/call/call.page.tsx";
import ChatPage from "./pages/chat/chat.page.tsx";
import ConversationsPage from "./pages/conversations/conversations.page.tsx";
import VehiclesPage from "./pages/vehicles/vehicles.page.tsx";
import RescuePlansPage from "./pages/rescue-plans/rescue-plans.page.tsx";
import { RealtimeBridge } from "./context/realtime-bridge.tsx";

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <TRPCReactProvider>
      <RealtimeBridge />
      <ToastProvider>
        <AnchoredToastProvider>
          <NuqsAdapter>
            <BrowserRouter>
              <Routes>
                <Route path={paths.home()} element={<HomePage />} />
                <Route path={paths.victims()} element={<VictimsPage />} />
                <Route path={paths.vehicles()} element={<VehiclesPage />} />
                <Route path={paths.rescuers()} element={<RescuersPage />} />
                <Route path={paths.rescuePlans()} element={<RescuePlansPage />} />
                <Route path={paths.call()} element={<CallPage />} />
                <Route path={paths.chat()} element={<ChatPage />} />
                <Route
                  path={paths.conversations()}
                  element={<ConversationsPage />}
                />
              </Routes>
            </BrowserRouter>
          </NuqsAdapter>
        </AnchoredToastProvider>
      </ToastProvider>
    </TRPCReactProvider>
  </SocketProvider>,
);
