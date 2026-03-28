export interface ClientToServerEvents {}

export interface ServerToClientEvents {
  "location:modified": () => void;
  "victim:modified": () => void;
  "marker:modified": () => void;
  "vehicle:modified": () => void;
  "rescuer:modified": () => void;
  "rescuePlan:modified": () => void;
  "routeReport:modified": () => void;
}
