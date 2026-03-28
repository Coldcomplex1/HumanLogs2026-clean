import type * as React from "react";
import { useAppContext } from "../../app.context";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { useState } from "react";
import { LocationsTab } from "./locations.tab";
import { MarkerTab } from "./markers.tab";

export const Sidebar: React.FC = () => {
  const { locations, markers, vehicles } = useAppContext();
  const [tab, setTab] = useState<"victims" | "markers" | "vehicles">("victims");

  return (
    <div className="w-full border-r border-slate-200/70 bg-white/88 backdrop-blur-xl flex flex-col h-[calc(100vh-var(--height-header))] z-10 shadow-[18px_0_40px_rgba(15,58,95,0.06)]">
      <div className="px-4 pt-3 pb-1">
        <div className="text-xs uppercase tracking-[0.18em] text-cyan-700 font-semibold mb-2">
          Điều phối hiện trường
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="border-b">
            <TabsList variant="underline">
              <TabsTab value="victims">Hộ dân ({locations.length})</TabsTab>
              <TabsTab value="markers">
                Cảnh báo ({markers.length})
              </TabsTab>
              {/* <TabsTab value="vehicles">Phương tiện ({vehicles.length})</TabsTab> */}
            </TabsList>
          </div>
        </Tabs>
      </div>
      {tab === "victims" && <LocationsTab />}
      {tab === "markers" && <MarkerTab />}
      {/* {tab === "vehicles" && <VehicleTab />} */}
    </div>
  );
};
