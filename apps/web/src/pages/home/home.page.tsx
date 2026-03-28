import { AppProvider } from "./app.context";
import { DashboardLayout } from "../dashboard.layout";
import { MapProvider } from "./map/map.context";
import { Map } from "./map/map";
import { Header } from "./header";
import { ToolbarProvider } from "./map/toolbar/toolbar.context";
import { CreateLocationModal } from "@/modals/location.modal";
import { LocationDetailModal } from "@/modals/location-details.modal";
import { MarkerModal } from "@/modals/marker.modal";
import { RescuePlanModal } from "@/modals/rescue-plan.modal";

export default function HomePage() {
  return (
    <AppProvider>
      <MapProvider>
        <ToolbarProvider>
          <DashboardLayout header={<Header />}>
            <Map />
            <CreateLocationModal />
            <LocationDetailModal />
            <MarkerModal />
            <RescuePlanModal />
          </DashboardLayout>
        </ToolbarProvider>
      </MapProvider>
    </AppProvider>
  );
}
