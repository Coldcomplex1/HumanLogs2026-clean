import type * as React from "react";
import { createContext, useContext, useEffect } from "react";
import { useSocket } from "@/context/socket.context";
import { toastManager } from "@/components/ui/toast";
import { api, RouterOutputs } from "@/trpc/react";

export type Location = RouterOutputs["location"]["findMany"][number];
export type Marker = RouterOutputs["marker"]["findMany"][number];
export type Vehicle = RouterOutputs["vehicle"]["findMany"][number];

const AppContext = createContext<{
  locations: Location[];
  markers: Marker[];
  vehicles: Vehicle[];
}>(null as any);

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket();

  const locationQuery = api.location.findMany.useQuery(
    {},
    {
      placeholderData: prev => prev || [],
    },
  );

  const markerQuery = api.marker.findMany.useQuery(
    {},
    {
      placeholderData: prev => prev || [],
    },
  );

  const vehicleQuery = api.vehicle.findMany.useQuery(
    {},
    {
      placeholderData: prev => prev || [],
    },
  );

  useEffect(() => {
    if (!socket) return;

    const onLocationModified = () => {
      locationQuery.refetch();
    };
    const onMarkerModified = () => {
      markerQuery.refetch();
    };
    const onVehicleModified = () => {
      vehicleQuery.refetch();
    };

    socket.on("location:modified", onLocationModified);
    socket.on("marker:modified", onMarkerModified);
    socket.on("vehicle:modified", onVehicleModified);

    return () => {
      socket.off("location:modified", onLocationModified);
      socket.off("marker:modified", onMarkerModified);
      socket.off("vehicle:modified", onVehicleModified);
    };
  }, [socket, locationQuery, markerQuery, vehicleQuery]);

  return (
    <AppContext.Provider
      value={{
        locations: locationQuery.data || [],
        markers: markerQuery.data || [],
        vehicles: vehicleQuery.data || [],
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
