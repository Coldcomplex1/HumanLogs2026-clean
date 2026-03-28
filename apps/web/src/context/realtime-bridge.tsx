import { useEffect } from "react";
import { useSocket } from "./socket.context";
import { api } from "@/trpc/react";

export const RealtimeBridge = () => {
  const { socket } = useSocket();
  const utils = api.useUtils();

  useEffect(() => {
    if (!socket) return;

    const locationHandler = () => {
      utils.location.findMany.invalidate();
      utils.location.findById.invalidate();
    };
    const victimHandler = () => {
      utils.victim.findMany.invalidate();
      utils.victim.findById.invalidate();
    };
    const markerHandler = () => {
      utils.marker.findMany.invalidate();
      utils.marker.findById.invalidate();
    };
    const vehicleHandler = () => {
      utils.vehicle.findMany.invalidate();
      utils.vehicle.findById.invalidate();
    };
    const rescuerHandler = () => {
      utils.rescuer.findMany.invalidate();
      utils.rescuer.findById.invalidate();
    };
    const rescuePlanHandler = () => {
      utils.rescuePlan.findMany.invalidate();
      utils.rescuePlan.findById.invalidate();
    };
    const routeReportHandler = () => {
      utils.routeReport.findMany.invalidate();
      utils.routeReport.findById.invalidate();
      utils.location.findMany.invalidate();
      utils.location.findById.invalidate();
    };

    socket.on("location:modified", locationHandler);
    socket.on("victim:modified", victimHandler);
    socket.on("marker:modified", markerHandler);
    socket.on("vehicle:modified", vehicleHandler);
    socket.on("rescuer:modified", rescuerHandler);
    socket.on("rescuePlan:modified", rescuePlanHandler);
    socket.on("routeReport:modified", routeReportHandler);

    return () => {
      socket.off("location:modified", locationHandler);
      socket.off("victim:modified", victimHandler);
      socket.off("marker:modified", markerHandler);
      socket.off("vehicle:modified", vehicleHandler);
      socket.off("rescuer:modified", rescuerHandler);
      socket.off("rescuePlan:modified", rescuePlanHandler);
      socket.off("routeReport:modified", routeReportHandler);
    };
  }, [socket, utils]);

  return null;
};
