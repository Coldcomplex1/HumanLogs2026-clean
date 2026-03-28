import type { RouterInputs, RouterOutputs } from "@repo/api/root";

type Gender = "male" | "female" | "other";
type NeedType =
  | "thuoc"
  | "nuoc"
  | "luong_thuc"
  | "sua_em_be"
  | "so_tan"
  | "sac_dien"
  | "ao_phao"
  | "ve_sinh"
  | "lien_lac";
type EmergencyLevel = "critical" | "high" | "medium";
type LocationStatus = "active" | "in_progress" | "safe";
type RouteConfidence = "high" | "medium" | "low" | "unverified" | "dangerous";
type TransportMode =
  | "road"
  | "boat"
  | "walk"
  | "ambulance"
  | "drone"
  | "hand_off";
type LocationSource = "call" | "chat" | "manual" | "web";
type MarkerType = "mark" | "area" | "route";
type MarkerMarkType =
  | "flood_area"
  | "strong_current"
  | "blocked_road"
  | "electric_hazard"
  | "debris"
  | "dangerous"
  | "safe_pickup"
  | "shelter"
  | "medical_point"
  | "supply_drop";
type VehicleType = "boat" | "truck" | "ambulance" | "motorbike" | "drone";
type VehicleStatus = "available" | "on_mission" | "maintenance" | "offline";
type RescuerRole =
  | "medic"
  | "boat_operator"
  | "driver"
  | "logistics"
  | "coordinator"
  | "diver"
  | "volunteer";
type RescuerStatus = "available" | "on_mission" | "off_duty" | "injured";
type ExperienceLevel = "junior" | "intermediate" | "senior" | "lead";
type RescuePlanStatus = "draft" | "active" | "completed" | "cancelled";
type RescuePlanPriority = "low" | "medium" | "high" | "critical";
type ConversationChannel = "call" | "chat";
type ConversationStatus =
  | "initiated"
  | "in_progress"
  | "processing"
  | "done"
  | "failed";

type TranscriptEntry = {
  role: "user" | "assistant";
  message: string;
  timeInCallSecs?: number;
};

type LabelRecord = {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
};

type VictimTagRecord = {
  id: string;
  victimId: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
};

type VictimRecord = {
  id: string;
  fullname: string;
  phone?: string;
  phone2?: string;
  email?: string;
  age?: number;
  gender?: Gender;
  note?: string;
  facebookURL?: string;
  addressText?: string;
  locationId?: string;
  conversations: string[];
  householdSize?: number;
  hasChildren?: boolean;
  hasElderly?: boolean;
  hasDisability?: boolean;
  isPregnant?: boolean;
  needsMedical?: boolean;
  needTypes: NeedType[];
  medicineList: string[];
  daysWithoutAid?: number;
  waterDepthEstimate?: string;
  boatAccessible?: boolean;
  createdAt: string;
  updatedAt: string;
};

type LocationRecord = {
  id: string;
  summary?: string;
  note?: string;
  lat: number;
  lng: number;
  address?: string;
  emergencyLevel: EmergencyLevel;
  status: LocationStatus;
  isResolved: boolean;
  tags: string[];
  labelId?: string;
  routeConfidence: RouteConfidence;
  preferredTransportMode: TransportMode;
  source: LocationSource;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type MarkerRecord = {
  id: string;
  lat: number;
  lng: number;
  note?: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
  isClosedPath?: boolean;
  paths?: Array<[number, number]>;
  type: MarkerType;
  markType?: MarkerMarkType;
  createdAt: string;
  updatedAt: string;
};

type VehicleRecord = {
  id: string;
  image?: string;
  name: string;
  vehicleType?: VehicleType;
  capacity?: number;
  status?: VehicleStatus;
  note?: string;
  baseLocation?: string;
  fuelLevel?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type RescuerRecord = {
  id: string;
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  role?: RescuerRole;
  status?: RescuerStatus;
  experienceLevel?: ExperienceLevel;
  certifications: string[];
  region?: string;
  avatarUrl?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

type RescuePlanRecord = {
  id: string;
  title: string;
  description?: string;
  status: RescuePlanStatus;
  priority: RescuePlanPriority;
  locationIds: string[];
  rescuerIds: string[];
  vehicleIds: string[];
  createdAt: string;
  updatedAt: string;
};

type RouteReportRecord = {
  id: string;
  locationId?: string;
  markerId?: string;
  reporterId?: string;
  transportMode: TransportMode;
  confidence: RouteConfidence;
  isPassable: boolean;
  waterDepthText?: string;
  currentStrengthText?: string;
  note?: string;
  path?: Array<[number, number]>;
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
};

type ConversationRecord = {
  id: string;
  providerConversationId: string;
  channel: ConversationChannel;
  agentName?: string;
  status: ConversationStatus;
  startedAt: string;
  durationSeconds: number;
  messageCount: number;
  phoneNumber?: string;
  summary?: string;
  dataCollectionResults: Record<string, unknown>;
  transcript: TranscriptEntry[];
  rawPayload?: Record<string, unknown>;
  victimId?: string;
  locationId?: string;
};

type MockStore = {
  labels: LabelRecord[];
  locations: LocationRecord[];
  victims: VictimRecord[];
  victimTags: VictimTagRecord[];
  markers: MarkerRecord[];
  vehicles: VehicleRecord[];
  rescuers: RescuerRecord[];
  rescuePlans: RescuePlanRecord[];
  routeReports: RouteReportRecord[];
  conversations: ConversationRecord[];
};

const STORAGE_KEY = "humanlogs2026:mock-store:v5";

let storeCache: MockStore | null = null;

const rescuePriorityOrder: Record<RescuePlanPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const emergencyOrder: Record<EmergencyLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
};

const locationSeeds = [
  {
    id: "loc-001",
    address: "Thôn Mỹ Chánh, xã Hải Chánh, Quảng Trị",
    lat: 16.7582,
    lng: 107.1184,
    emergencyLevel: "critical" as EmergencyLevel,
    routeConfidence: "dangerous" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary:
      "Hộ 5 người mắc kẹt trên gác, có người cao tuổi cần thuốc tim mạch.",
    note: "Nước ngập gần 1,8m, đường liên thôn bị chia cắt hoàn toàn.",
    source: "call" as LocationSource,
    victims: [
      {
        id: "vic-001",
        fullname: "Nguyễn Thị Hương",
        phone: "0911000001",
        age: 42,
        gender: "female" as Gender,
        householdSize: 5,
        hasChildren: true,
        hasElderly: true,
        needsMedical: true,
        needTypes: ["thuoc", "nuoc", "luong_thuc"] as NeedType[],
        medicineList: ["Thuốc tim", "Thuốc huyết áp"],
        waterDepthEstimate: "1,8m",
        boatAccessible: true,
      },
      {
        id: "vic-002",
        fullname: "Nguyễn Minh Khôi",
        phone: "0911000002",
        age: 12,
        gender: "male" as Gender,
        householdSize: 5,
        hasChildren: true,
        needTypes: ["nuoc", "luong_thuc", "ao_phao"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,8m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-002",
    address: "Khối 4, phường Hòa Hiệp Nam, Đà Nẵng",
    lat: 16.1248,
    lng: 108.1501,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "medium" as RouteConfidence,
    preferredTransportMode: "ambulance" as TransportMode,
    summary: "Gia đình 3 người cần sơ tán, có thai phụ gần đến ngày sinh.",
    note: "Xe cứu thương có thể tiếp cận từ trục chính, hẻm cuối phải đi bộ.",
    source: "chat" as LocationSource,
    victims: [
      {
        id: "vic-003",
        fullname: "Trần Thị Yến",
        phone: "0911000003",
        age: 29,
        gender: "female" as Gender,
        householdSize: 3,
        isPregnant: true,
        needTypes: ["so_tan", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,7m",
        boatAccessible: false,
      },
      {
        id: "vic-004",
        fullname: "Trần Văn Hải",
        phone: "0911000004",
        age: 33,
        gender: "male" as Gender,
        householdSize: 3,
        needTypes: ["luong_thuc", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,7m",
        boatAccessible: false,
      },
    ],
  },
  {
    id: "loc-003",
    address: "Ấp Phú Lợi, xã Tân Phước Hưng, Hậu Giang",
    lat: 9.8015,
    lng: 105.6712,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "high" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Điểm tiếp tế cho 2 hộ liền kề, thiếu nước sạch và sữa em bé.",
    note: "Xuồng nhỏ có thể áp sát mép hiên sau nhà.",
    source: "manual" as LocationSource,
    victims: [
      {
        id: "vic-005",
        fullname: "Lê Thị Ngọc",
        phone: "0911000005",
        age: 26,
        gender: "female" as Gender,
        householdSize: 4,
        hasChildren: true,
        needTypes: ["nuoc", "sua_em_be", "luong_thuc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,2m",
        boatAccessible: true,
      },
      {
        id: "vic-006",
        fullname: "Lê Bảo Trâm",
        phone: "0911000006",
        age: 2,
        gender: "female" as Gender,
        householdSize: 4,
        hasChildren: true,
        needTypes: ["sua_em_be"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,2m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-004",
    address: "Tổ 8, thị trấn Nam Phước, Quảng Nam",
    lat: 15.7742,
    lng: 108.1249,
    emergencyLevel: "medium" as EmergencyLevel,
    routeConfidence: "unverified" as RouteConfidence,
    preferredTransportMode: "hand_off" as TransportMode,
    summary: "Cần sạc điện và bổ sung lương thực cho hộ có 6 người.",
    note: "Đường chính có xe tải vào được, đoạn cuối phải trung chuyển bằng xe máy.",
    source: "web" as LocationSource,
    victims: [
      {
        id: "vic-007",
        fullname: "Phạm Văn Dũng",
        phone: "0911000007",
        age: 51,
        gender: "male" as Gender,
        householdSize: 6,
        needTypes: ["luong_thuc", "sac_dien"] as NeedType[],
        medicineList: [],
        daysWithoutAid: 2,
        waterDepthEstimate: "0,4m",
        boatAccessible: false,
      },
      {
        id: "vic-008",
        fullname: "Phạm Thị Mỹ",
        phone: "0911000008",
        age: 47,
        gender: "female" as Gender,
        householdSize: 6,
        needTypes: ["luong_thuc", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,4m",
        boatAccessible: false,
      },
    ],
  },
  {
    id: "loc-005",
    address: "Xóm Cồn Tàu, xã Triệu Độ, Quảng Trị",
    lat: 16.7944,
    lng: 107.0386,
    emergencyLevel: "critical" as EmergencyLevel,
    routeConfidence: "dangerous" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary:
      "Có người khuyết tật và trẻ nhỏ, cần sơ tán gấp trước khi triều dâng.",
    note: "Dòng chảy mạnh, chỉ nên dùng xuồng máy có lái kinh nghiệm.",
    source: "call" as LocationSource,
    victims: [
      {
        id: "vic-009",
        fullname: "Hồ Văn Thuận",
        phone: "0911000009",
        age: 38,
        gender: "male" as Gender,
        householdSize: 4,
        hasChildren: true,
        hasDisability: true,
        needTypes: ["so_tan", "ao_phao", "thuoc"] as NeedType[],
        needsMedical: true,
        medicineList: ["Thuốc đau cơ", "Dung dịch sát khuẩn"],
        waterDepthEstimate: "2,1m",
        boatAccessible: true,
      },
      {
        id: "vic-010",
        fullname: "Hồ Thị Lan",
        phone: "0911000010",
        age: 9,
        gender: "female" as Gender,
        householdSize: 4,
        hasChildren: true,
        needTypes: ["so_tan", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "2,1m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-006",
    address: "Khu phố 3, phường 5, thành phố Cà Mau",
    lat: 9.1766,
    lng: 105.1524,
    emergencyLevel: "medium" as EmergencyLevel,
    routeConfidence: "high" as RouteConfidence,
    preferredTransportMode: "road" as TransportMode,
    summary:
      "Hộ dân cần nước sạch và chăn màn sau khi ngập kéo dài hai ngày.",
    note: "Xe tải 1,5 tấn vào được vào ban ngày.",
    source: "manual" as LocationSource,
    victims: [
      {
        id: "vic-011",
        fullname: "Ngô Kim Oanh",
        phone: "0911000011",
        age: 35,
        gender: "female" as Gender,
        householdSize: 5,
        needTypes: ["nuoc", "ve_sinh", "lien_lac"] as NeedType[],
        medicineList: [],
        daysWithoutAid: 2,
      },
      {
        id: "vic-012",
        fullname: "Ngô Quốc Nam",
        phone: "0911000012",
        age: 63,
        gender: "male" as Gender,
        householdSize: 5,
        hasElderly: true,
        needTypes: ["nuoc", "luong_thuc"] as NeedType[],
        medicineList: [],
      },
    ],
  },
  {
    id: "loc-007",
    address: "Ấp Đông Thuận, huyện Cái Bè, Tiền Giang",
    lat: 10.3698,
    lng: 106.0863,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "low" as RouteConfidence,
    preferredTransportMode: "drone" as TransportMode,
    summary: "Cần chuyển thuốc insulin khẩn cho bệnh nhân tiểu đường.",
    note: "Đường bộ bị đứt đoạn tạm thời, xuồng lớn khó tiếp cận.",
    source: "chat" as LocationSource,
    victims: [
      {
        id: "vic-013",
        fullname: "Đoàn Văn Lộc",
        phone: "0911000013",
        age: 58,
        gender: "male" as Gender,
        householdSize: 2,
        needsMedical: true,
        needTypes: ["thuoc", "nuoc"] as NeedType[],
        medicineList: ["Insulin", "Kim tiêm"],
        waterDepthEstimate: "0,9m",
      },
    ],
  },
  {
    id: "loc-008",
    address: "Xã Phước Sơn, Tuy Phước, Bình Định",
    lat: 13.8049,
    lng: 109.1378,
    emergencyLevel: "critical" as EmergencyLevel,
    routeConfidence: "low" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary:
      "Một cụ ông đang sốt cao, gia đình cần sơ tán và hỗ trợ y tế gấp.",
    note:
      "Đường bê tông ngập xiết, phải dùng xuồng máy rồi bàn giao xe cứu thương.",
    source: "call" as LocationSource,
    victims: [
      {
        id: "vic-014",
        fullname: "Đinh Văn Nhân",
        phone: "0911000021",
        age: 74,
        gender: "male" as Gender,
        householdSize: 3,
        hasElderly: true,
        needsMedical: true,
        needTypes: ["so_tan", "thuoc", "nuoc"] as NeedType[],
        medicineList: ["Hạ sốt", "Kháng sinh"],
        waterDepthEstimate: "1,4m",
        boatAccessible: true,
      },
      {
        id: "vic-015",
        fullname: "Đinh Thị Thương",
        phone: "0911000022",
        age: 45,
        gender: "female" as Gender,
        householdSize: 3,
        needTypes: ["nuoc", "luong_thuc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,4m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-009",
    address: "Thôn Phú Hòa, Đại Lộc, Quảng Nam",
    lat: 15.9081,
    lng: 108.0892,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "medium" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Cụm 3 hộ cần nước sạch, pin sạc và áo phao cho trẻ em.",
    note: "Xuồng nhỏ vào được theo nhánh kênh sau trường tiểu học.",
    source: "manual" as LocationSource,
    victims: [
      {
        id: "vic-016",
        fullname: "Nguyễn Thị Thủy",
        phone: "0911000023",
        age: 37,
        gender: "female" as Gender,
        householdSize: 4,
        hasChildren: true,
        needTypes: ["nuoc", "ao_phao", "sac_dien"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,1m",
        boatAccessible: true,
      },
      {
        id: "vic-017",
        fullname: "Nguyễn Văn Bửu",
        phone: "0911000024",
        age: 65,
        gender: "male" as Gender,
        householdSize: 4,
        hasElderly: true,
        needTypes: ["luong_thuc", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,1m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-010",
    address: "Thôn Quan Nam 4, Hòa Liên, Hòa Vang, Đà Nẵng",
    lat: 16.1088,
    lng: 108.0212,
    emergencyLevel: "medium" as EmergencyLevel,
    routeConfidence: "low" as RouteConfidence,
    preferredTransportMode: "hand_off" as TransportMode,
    summary: "Tổ dân cư cần mì, nước và đèn pin do ngập cô lập về đêm.",
    note: "Xe tải dừng ở đầu cầu, xe máy chở hàng đoạn cuối.",
    source: "web" as LocationSource,
    victims: [
      {
        id: "vic-018",
        fullname: "Lương Văn Hạnh",
        phone: "0911000025",
        age: 44,
        gender: "male" as Gender,
        householdSize: 5,
        needTypes: ["luong_thuc", "nuoc", "sac_dien"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,6m",
        boatAccessible: false,
      },
      {
        id: "vic-019",
        fullname: "Lương Thị Hà",
        phone: "0911000026",
        age: 14,
        gender: "female" as Gender,
        householdSize: 5,
        hasChildren: true,
        needTypes: ["ao_phao", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,6m",
        boatAccessible: false,
      },
    ],
  },
  {
    id: "loc-011",
    address: "Xã Hải Lâm, huyện Hải Lăng, Quảng Trị",
    lat: 16.6551,
    lng: 107.2438,
    emergencyLevel: "critical" as EmergencyLevel,
    routeConfidence: "dangerous" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Hai hộ có trẻ nhỏ mắc kẹt, cần sơ tán trước đỉnh lũ chiều nay.",
    note: "Dòng chảy ngang mạnh, cần áo phao cỡ trẻ em và xuồng máy.",
    source: "call" as LocationSource,
    victims: [
      {
        id: "vic-020",
        fullname: "Võ Thị Hiền",
        phone: "0911000027",
        age: 31,
        gender: "female" as Gender,
        householdSize: 5,
        hasChildren: true,
        needTypes: ["so_tan", "ao_phao", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,9m",
        boatAccessible: true,
      },
      {
        id: "vic-021",
        fullname: "Võ Minh Tân",
        phone: "0911000028",
        age: 7,
        gender: "male" as Gender,
        householdSize: 5,
        hasChildren: true,
        needTypes: ["so_tan", "ao_phao"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,9m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-012",
    address: "Thị trấn Kiến Giang, Lệ Thủy, Quảng Bình",
    lat: 17.0455,
    lng: 106.7087,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "medium" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Điểm trường tạm trú cần thêm sữa em bé, nước sạch và thuốc cảm.",
    note: "Có bến thả hàng phía sau nhà văn hóa, đi xuồng 12 phút từ bến chính.",
    source: "manual" as LocationSource,
    victims: [
      {
        id: "vic-022",
        fullname: "Bùi Thị Diễm",
        phone: "0911000029",
        age: 28,
        gender: "female" as Gender,
        householdSize: 6,
        hasChildren: true,
        needTypes: ["sua_em_be", "nuoc", "thuoc"] as NeedType[],
        medicineList: ["Thuốc cảm", "ORESOL"],
        waterDepthEstimate: "1,0m",
        boatAccessible: true,
      },
      {
        id: "vic-023",
        fullname: "Bùi Gia Hân",
        phone: "0911000030",
        age: 1,
        gender: "female" as Gender,
        householdSize: 6,
        hasChildren: true,
        needTypes: ["sua_em_be"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,0m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-013",
    address: "Ấp Tân Long, huyện Tam Nông, Đồng Tháp",
    lat: 10.7194,
    lng: 105.5237,
    emergencyLevel: "medium" as EmergencyLevel,
    routeConfidence: "high" as RouteConfidence,
    preferredTransportMode: "road" as TransportMode,
    summary: "Hộ dân cần vật tư vệ sinh, nước đóng chai và hỗ trợ liên lạc.",
    note: "Đường huyện còn đi được vào buổi sáng, xe bán tải có thể vào tận sân.",
    source: "manual" as LocationSource,
    victims: [
      {
        id: "vic-024",
        fullname: "Trịnh Văn Lâm",
        phone: "0911000031",
        age: 46,
        gender: "male" as Gender,
        householdSize: 4,
        needTypes: ["ve_sinh", "nuoc", "lien_lac"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,3m",
        boatAccessible: false,
      },
      {
        id: "vic-025",
        fullname: "Trịnh Thị Kiều",
        phone: "0911000032",
        age: 68,
        gender: "female" as Gender,
        householdSize: 4,
        hasElderly: true,
        needTypes: ["nuoc", "luong_thuc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,3m",
        boatAccessible: false,
      },
    ],
  },
  {
    id: "loc-014",
    address: "Xã Long Thạnh, huyện Phụng Hiệp, Hậu Giang",
    lat: 9.8278,
    lng: 105.7533,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "low" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Cụm nhà ven kênh thiếu lương thực 3 ngày, có sản phụ cần khám.",
    note: "Đi xuồng theo kênh nội đồng rồi bộ hành 50m để vào sâu trong xóm.",
    source: "chat" as LocationSource,
    victims: [
      {
        id: "vic-026",
        fullname: "Phan Ngọc Ánh",
        phone: "0911000033",
        age: 27,
        gender: "female" as Gender,
        householdSize: 3,
        isPregnant: true,
        needTypes: ["thuoc", "so_tan", "nuoc"] as NeedType[],
        medicineList: ["Vitamin bầu", "Thuốc co bóp"],
        waterDepthEstimate: "1,3m",
        boatAccessible: true,
      },
      {
        id: "vic-027",
        fullname: "Phan Văn Kha",
        phone: "0911000034",
        age: 32,
        gender: "male" as Gender,
        householdSize: 3,
        needTypes: ["luong_thuc", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,3m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-015",
    address: "Xã An Minh Bắc, U Minh Thượng, Kiên Giang",
    lat: 9.6503,
    lng: 105.1221,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "medium" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Khu dân cư ven rừng cần nước sạch và áo phao dự phòng.",
    note: "Tuyến vào ổn khi triều xuống, tránh di chuyển sau 18h.",
    source: "manual" as LocationSource,
    victims: [
      {
        id: "vic-028",
        fullname: "Đặng Hải Yến",
        phone: "0911000035",
        age: 34,
        gender: "female" as Gender,
        householdSize: 6,
        hasChildren: true,
        needTypes: ["nuoc", "ao_phao", "luong_thuc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,0m",
        boatAccessible: true,
      },
      {
        id: "vic-029",
        fullname: "Đặng Quốc Phúc",
        phone: "0911000036",
        age: 10,
        gender: "male" as Gender,
        householdSize: 6,
        hasChildren: true,
        needTypes: ["ao_phao", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,0m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-016",
    address: "Phường Nhơn Bình, thành phố Quy Nhơn, Bình Định",
    lat: 13.7908,
    lng: 109.2142,
    emergencyLevel: "medium" as EmergencyLevel,
    routeConfidence: "high" as RouteConfidence,
    preferredTransportMode: "road" as TransportMode,
    summary: "Điểm tiếp tế đô thị cần nước, chăn mỏng và pin dự phòng.",
    note: "Xe bán tải vào được, ưu tiên bốc dỡ nhanh trước 17h.",
    source: "web" as LocationSource,
    victims: [
      {
        id: "vic-030",
        fullname: "Trần Thu Hà",
        phone: "0911000037",
        age: 39,
        gender: "female" as Gender,
        householdSize: 5,
        needTypes: ["nuoc", "luong_thuc", "sac_dien"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,2m",
        boatAccessible: false,
      },
      {
        id: "vic-031",
        fullname: "Trần Gia Bảo",
        phone: "0911000038",
        age: 6,
        gender: "male" as Gender,
        householdSize: 5,
        hasChildren: true,
        needTypes: ["luong_thuc", "ao_phao"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,2m",
        boatAccessible: false,
      },
    ],
  },
  {
    id: "loc-017",
    address: "Thôn Chánh Trạch 2, huyện Phù Cát, Bình Định",
    lat: 14.0576,
    lng: 109.0015,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "low" as RouteConfidence,
    preferredTransportMode: "hand_off" as TransportMode,
    summary: "Nhà có người bệnh thận cần chuyển thuốc và bình nước gấp.",
    note: "Đường vào bị cắt đoạn, nên trung chuyển bằng xe máy vào cuối thôn.",
    source: "call" as LocationSource,
    victims: [
      {
        id: "vic-032",
        fullname: "Lý Văn Phát",
        phone: "0911000039",
        age: 61,
        gender: "male" as Gender,
        householdSize: 2,
        needsMedical: true,
        needTypes: ["thuoc", "nuoc"] as NeedType[],
        medicineList: ["Thuốc thận", "Thuốc huyết áp"],
        waterDepthEstimate: "0,8m",
        boatAccessible: false,
      },
    ],
  },
  {
    id: "loc-018",
    address: "Khóm 6, thị trấn Năm Căn, Cà Mau",
    lat: 8.7453,
    lng: 104.9901,
    emergencyLevel: "medium" as EmergencyLevel,
    routeConfidence: "medium" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Khu ven sông cần bổ sung nước uống, gạo và đèn sạc.",
    note: "Đi bằng vỏ lãi thuận lợi vào buổi sáng, gió lớn sau 15h.",
    source: "manual" as LocationSource,
    victims: [
      {
        id: "vic-033",
        fullname: "Huỳnh Văn Sử",
        phone: "0911000040",
        age: 49,
        gender: "male" as Gender,
        householdSize: 4,
        needTypes: ["nuoc", "luong_thuc", "sac_dien"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,9m",
        boatAccessible: true,
      },
      {
        id: "vic-034",
        fullname: "Huỳnh Mỹ Duyên",
        phone: "0911000041",
        age: 17,
        gender: "female" as Gender,
        householdSize: 4,
        needTypes: ["nuoc", "ve_sinh"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "0,9m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-019",
    address: "Xã Phú Mậu, huyện Phú Vang, Huế",
    lat: 16.5007,
    lng: 107.6353,
    emergencyLevel: "critical" as EmergencyLevel,
    routeConfidence: "dangerous" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Người già mắc kẹt tầng lửng, cần thuốc và sơ tán bằng xuồng.",
    note: "Nước dâng nhanh theo triều phá Tam Giang, tránh đi lúc gió mạnh.",
    source: "call" as LocationSource,
    victims: [
      {
        id: "vic-035",
        fullname: "Tôn Thị Sen",
        phone: "0911000042",
        age: 70,
        gender: "female" as Gender,
        householdSize: 3,
        hasElderly: true,
        needsMedical: true,
        needTypes: ["so_tan", "thuoc", "nuoc"] as NeedType[],
        medicineList: ["Thuốc tim", "Thuốc huyết áp"],
        waterDepthEstimate: "1,7m",
        boatAccessible: true,
      },
      {
        id: "vic-036",
        fullname: "Tôn Minh Đức",
        phone: "0911000043",
        age: 36,
        gender: "male" as Gender,
        householdSize: 3,
        needTypes: ["so_tan", "ao_phao"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,7m",
        boatAccessible: true,
      },
    ],
  },
  {
    id: "loc-020",
    address: "Xã Cẩm Kim, thành phố Hội An, Quảng Nam",
    lat: 15.8956,
    lng: 108.3175,
    emergencyLevel: "high" as EmergencyLevel,
    routeConfidence: "medium" as RouteConfidence,
    preferredTransportMode: "boat" as TransportMode,
    summary: "Cụm ven sông cần tiếp tế gạo, nước và thuốc sát khuẩn.",
    note: "Có thể tiếp cận bằng thuyền từ bến Cẩm Nam trong khoảng 20 phút.",
    source: "chat" as LocationSource,
    victims: [
      {
        id: "vic-037",
        fullname: "Nguyễn Thành An",
        phone: "0911000044",
        age: 41,
        gender: "male" as Gender,
        householdSize: 5,
        needTypes: ["nuoc", "luong_thuc", "ve_sinh"] as NeedType[],
        medicineList: ["Dung dịch sát khuẩn"],
        waterDepthEstimate: "1,0m",
        boatAccessible: true,
      },
      {
        id: "vic-038",
        fullname: "Nguyễn Khánh Vy",
        phone: "0911000045",
        age: 11,
        gender: "female" as Gender,
        householdSize: 5,
        hasChildren: true,
        needTypes: ["ao_phao", "nuoc"] as NeedType[],
        medicineList: [],
        waterDepthEstimate: "1,0m",
        boatAccessible: true,
      },
    ],
  },
] as const;

const markerSeeds = [
  {
    id: "mrk-001",
    name: "Vùng ngập sâu Hải Chánh",
    type: "area" as MarkerType,
    markType: "flood_area" as MarkerMarkType,
    lat: 16.7582,
    lng: 107.1184,
    color: "#0ea5e9",
    fillOpacity: 0.28,
    isClosedPath: true,
    paths: [
      [16.756, 107.114],
      [16.756, 107.123],
      [16.761, 107.124],
      [16.762, 107.115],
    ] as Array<[number, number]>,
    note: "Chỉ tiếp cận bằng xuồng máy.",
  },
  {
    id: "mrk-002",
    name: "Đường bị chặn Nam Phước",
    type: "mark" as MarkerType,
    markType: "blocked_road" as MarkerMarkType,
    lat: 15.7758,
    lng: 108.1265,
    color: "#f97316",
    note: "Xe tải không qua được do sụt lề.",
  },
  {
    id: "mrk-003",
    name: "Nước chảy xiết Triệu Độ",
    type: "mark" as MarkerType,
    markType: "strong_current" as MarkerMarkType,
    lat: 16.7956,
    lng: 107.0371,
    color: "#ef4444",
    note: "Không cho xuồng chèo tay đi vào.",
  },
  {
    id: "mrk-004",
    name: "Điểm tập kết phường 5 Cà Mau",
    type: "mark" as MarkerType,
    markType: "safe_pickup" as MarkerMarkType,
    lat: 9.1778,
    lng: 105.151,
    color: "#22c55e",
    note: "Tập kết hàng khô và nước uống.",
  },
  {
    id: "mrk-005",
    name: "Điểm y tế lưu động Bình Định",
    type: "mark" as MarkerType,
    markType: "medical_point" as MarkerMarkType,
    lat: 13.8061,
    lng: 109.1394,
    color: "#dc2626",
    note: "Có 1 bác sĩ và 2 điều dưỡng trực.",
  },
  {
    id: "mrk-006",
    name: "Tuyến xuồng tiếp cận Phú Mỹ",
    type: "route" as MarkerType,
    markType: "safe_pickup" as MarkerMarkType,
    lat: 12.2125,
    lng: 109.2267,
    color: "#38bdf8",
    fillOpacity: 0.85,
    isClosedPath: false,
    paths: [
      [12.2102, 109.2251],
      [12.2111, 109.2261],
      [12.2121, 109.2272],
      [12.2134, 109.2287],
    ] as Array<[number, number]>,
    note: "Đường thủy khuyến nghị trong 6 giờ tới.",
  },
  {
    id: "mrk-007",
    name: "Vùng ngập Phú Mậu",
    type: "area" as MarkerType,
    markType: "flood_area" as MarkerMarkType,
    lat: 16.5007,
    lng: 107.6353,
    color: "#2563eb",
    fillOpacity: 0.22,
    isClosedPath: true,
    paths: [
      [16.4959, 107.6282],
      [16.4982, 107.6409],
      [16.5037, 107.6421],
      [16.5054, 107.6316],
    ] as Array<[number, number]>,
    note: "Ngập trũng kéo dài, chỉ nên vào bằng xuồng máy nhỏ.",
  },
  {
    id: "mrk-008",
    name: "Hành lang xuồng Tam Giang",
    type: "route" as MarkerType,
    markType: "safe_pickup" as MarkerMarkType,
    lat: 16.4998,
    lng: 107.6368,
    color: "#06b6d4",
    fillOpacity: 0.85,
    isClosedPath: false,
    paths: [
      [16.4949, 107.6268],
      [16.4976, 107.6311],
      [16.5002, 107.6364],
      [16.5038, 107.6408],
      [16.5061, 107.6442],
    ] as Array<[number, number]>,
    note: "Luồng thủy nội địa đang an toàn tương đối trong khung sáng.",
  },
  {
    id: "mrk-009",
    name: "Điểm trú tạm Hòa Liên",
    type: "mark" as MarkerType,
    markType: "shelter" as MarkerMarkType,
    lat: 16.1105,
    lng: 108.0196,
    color: "#22c55e",
    note: "Nhà văn hóa thôn, còn sức chứa khoảng 25 người.",
  },
  {
    id: "mrk-010",
    name: "Cột điện ngập Đại Lộc",
    type: "mark" as MarkerType,
    markType: "electric_hazard" as MarkerMarkType,
    lat: 15.9094,
    lng: 108.0873,
    color: "#f59e0b",
    note: "Khoanh vùng nguy hiểm bán kính 30m.",
  },
  {
    id: "mrk-011",
    name: "Tuyến trung chuyển Hòa Vang",
    type: "route" as MarkerType,
    markType: "safe_pickup" as MarkerMarkType,
    lat: 16.1099,
    lng: 108.0281,
    color: "#38bdf8",
    fillOpacity: 0.8,
    isClosedPath: false,
    paths: [
      [16.1012, 108.0083],
      [16.1057, 108.0164],
      [16.1098, 108.0267],
      [16.1134, 108.0342],
    ] as Array<[number, number]>,
    note: "Chặng xe tải tới cầu, sau đó chuyển xe máy và bộ hành.",
  },
  {
    id: "mrk-012",
    name: "Bãi vật cản Lệ Thủy",
    type: "mark" as MarkerType,
    markType: "debris" as MarkerMarkType,
    lat: 17.0431,
    lng: 106.7049,
    color: "#f97316",
    note: "Có cây gãy và mái tôn trôi chắn nửa luồng đi.",
  },
  {
    id: "mrk-013",
    name: "Vùng ngập nội đồng Phụng Hiệp",
    type: "area" as MarkerType,
    markType: "flood_area" as MarkerMarkType,
    lat: 9.8278,
    lng: 105.7533,
    color: "#0ea5e9",
    fillOpacity: 0.18,
    isClosedPath: true,
    paths: [
      [9.8231, 105.7482],
      [9.8256, 105.7601],
      [9.8314, 105.7615],
      [9.8331, 105.7507],
    ] as Array<[number, number]>,
    note: "Ngập đồng đều, xuồng nhỏ và ghe máy đều tiếp cận được.",
  },
  {
    id: "mrk-014",
    name: "Điểm thả hàng Tam Nông",
    type: "mark" as MarkerType,
    markType: "supply_drop" as MarkerMarkType,
    lat: 10.7209,
    lng: 105.5269,
    color: "#a855f7",
    note: "Drone thả thuốc và radio thành công 2 chuyến gần nhất.",
  },
  {
    id: "mrk-015",
    name: "Tuyến cứu trợ Năm Căn",
    type: "route" as MarkerType,
    markType: "safe_pickup" as MarkerMarkType,
    lat: 8.7443,
    lng: 104.9927,
    color: "#14b8a6",
    fillOpacity: 0.85,
    isClosedPath: false,
    paths: [
      [8.7391, 104.9786],
      [8.7417, 104.9842],
      [8.7442, 104.9907],
      [8.7471, 104.9966],
      [8.7505, 105.0021],
    ] as Array<[number, number]>,
    note: "Luồng vỏ lãi khuyến nghị cho tiếp tế buổi sáng.",
  },
  {
    id: "mrk-016",
    name: "Cầu tạm Phù Cát sạt lở",
    type: "mark" as MarkerType,
    markType: "blocked_road" as MarkerMarkType,
    lat: 14.0548,
    lng: 108.9982,
    color: "#ef4444",
    note: "Xe bốn bánh không qua được, chỉ xe máy hoặc bộ hành.",
  },
  {
    id: "mrk-017",
    name: "Khu trú tạm Cẩm Kim",
    type: "mark" as MarkerType,
    markType: "shelter" as MarkerMarkType,
    lat: 15.8968,
    lng: 108.3207,
    color: "#22c55e",
    note: "Có điện dự phòng và nước lọc cho khoảng 40 người.",
  },
  {
    id: "mrk-018",
    name: "Hành lang bàn giao y tế Quy Nhơn",
    type: "route" as MarkerType,
    markType: "medical_point" as MarkerMarkType,
    lat: 13.7982,
    lng: 109.2193,
    color: "#fb7185",
    fillOpacity: 0.88,
    isClosedPath: false,
    paths: [
      [13.7872, 109.2031],
      [13.7913, 109.2098],
      [13.7951, 109.2142],
      [13.7994, 109.2195],
      [13.8031, 109.2246],
    ] as Array<[number, number]>,
    note: "Tuyến ưu tiên để bàn giao bệnh nhân sang xe cứu thương.",
  },
  {
    id: "mrk-019",
    name: "Vùng nước dâng Hải Lăng - Huế",
    type: "area" as MarkerType,
    markType: "flood_area" as MarkerMarkType,
    lat: 16.6021,
    lng: 107.5012,
    color: "#f59e0b",
    fillOpacity: 0.16,
    isClosedPath: true,
    paths: [
      [16.6648, 107.3281],
      [16.5751, 107.7642],
      [16.4542, 107.5461],
      [16.5344, 107.2785],
    ] as Array<[number, number]>,
    note: "Vành đai ưu tiên giám sát do nước dâng và triều cường đồng thời.",
  },
  {
    id: "mrk-020",
    name: "Vùng ngập Hòa Vang",
    type: "area" as MarkerType,
    markType: "flood_area" as MarkerMarkType,
    lat: 16.0631,
    lng: 108.0931,
    color: "#ef4444",
    fillOpacity: 0.14,
    isClosedPath: true,
    paths: [
      [16.1512, 107.9965],
      [16.0963, 108.1768],
      [15.9597, 108.1481],
      [15.9902, 108.0104],
    ] as Array<[number, number]>,
    note: "Khu vực nhiều điểm dân cư thấp trũng, cần theo dõi sơ tán theo giờ.",
  },
  {
    id: "mrk-021",
    name: "Vành đai cảnh báo Cẩm Kim",
    type: "area" as MarkerType,
    markType: "dangerous" as MarkerMarkType,
    lat: 15.8898,
    lng: 108.3132,
    color: "#fb7185",
    fillOpacity: 0.12,
    isClosedPath: true,
    paths: [
      [15.9251, 108.2748],
      [15.9287, 108.3392],
      [15.8638, 108.3541],
      [15.8532, 108.2927],
    ] as Array<[number, number]>,
    note: "Dòng xoáy sát bờ sông, không neo đậu lâu quanh mép nước.",
  },
  {
    id: "mrk-022",
    name: "Hành lang cứu trợ Hải Lăng - Huế",
    type: "route" as MarkerType,
    markType: "safe_pickup" as MarkerMarkType,
    lat: 16.5888,
    lng: 107.4796,
    color: "#f59e0b",
    fillOpacity: 0.82,
    isClosedPath: false,
    paths: [
      [16.6641, 107.3105],
      [16.6217, 107.3924],
      [16.5788, 107.4921],
      [16.5314, 107.6033],
      [16.4862, 107.6987],
    ] as Array<[number, number]>,
    note: "Tuyến bàn giao hàng xuồng máy dọc vùng giáp phá Tam Giang.",
  },
  {
    id: "mrk-023",
    name: "Tuyến tiếp vận Đà Nẵng - Hội An",
    type: "route" as MarkerType,
    markType: "safe_pickup" as MarkerMarkType,
    lat: 15.9897,
    lng: 108.1992,
    color: "#10b981",
    fillOpacity: 0.86,
    isClosedPath: false,
    paths: [
      [16.0865, 108.1188],
      [16.0473, 108.1672],
      [15.9986, 108.2179],
      [15.9442, 108.2651],
      [15.8934, 108.3158],
    ] as Array<[number, number]>,
    note: "Hành lang tiếp vận hỗn hợp giữa xe tải, xe máy và xuồng nhẹ.",
  },
] as const;

const nowIso = (hoursAgo = 0) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

const buildInitialStore = (): MockStore => {
  const labels: LabelRecord[] = [
    {
      id: "lbl-001",
      name: "Điểm cần sơ tán",
      color: "#ef4444",
      icon: "lifebuoy",
      description: "Ưu tiên rút người khỏi khu vực nguy hiểm ngay.",
    },
    {
      id: "lbl-002",
      name: "Điểm tiếp tế",
      color: "#0ea5e9",
      icon: "package",
      description: "Ưu tiên giao nước, lương thực và vật tư thiết yếu.",
    },
    {
      id: "lbl-003",
      name: "Điểm y tế",
      color: "#dc2626",
      icon: "cross",
      description: "Có nhu cầu hỗ trợ thuốc men hoặc sơ cứu khẩn cấp.",
    },
  ];

  const rescuers: RescuerRecord[] = [
    ["res-001", "Nguyễn Văn Tâm", "0912000001", "boat_operator", "available", "senior", "Quảng Trị"],
    ["res-002", "Lê Hoàng Minh", "0912000002", "driver", "available", "intermediate", "Đà Nẵng"],
    ["res-003", "Phạm Thảo Nhi", "0912000003", "medic", "available", "senior", "Quảng Nam"],
    ["res-004", "Đỗ Công Hậu", "0912000004", "logistics", "available", "lead", "Cần Thơ"],
    ["res-005", "Trần Khánh Linh", "0912000005", "coordinator", "available", "lead", "Đồng Tháp"],
    ["res-006", "Hồ Quốc Việt", "0912000006", "diver", "available", "intermediate", "Khánh Hòa"],
    ["res-007", "Ngô Phương Anh", "0912000007", "volunteer", "off_duty", "junior", "Cà Mau"],
    ["res-008", "Mai Thanh Sơn", "0912000008", "boat_operator", "available", "intermediate", "Bình Định"],
  ].map(([id, fullName, phone, role, status, experienceLevel, region], index) => ({
    id,
    fullName,
    phone,
    role: role as RescuerRole,
    status: status as RescuerStatus,
    experienceLevel: experienceLevel as ExperienceLevel,
    region,
    certifications:
      role === "medic"
        ? ["Sơ cấp cứu", "Phân luồng y tế"]
        : role === "boat_operator"
          ? ["Lái xuồng máy", "An toàn đường thủy"]
          : ["Điều phối hiện trường"],
    note: `Tổ phản ứng nhanh số ${index + 1}.`,
    avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(fullName)}`,
    createdAt: nowIso(72 - index * 2),
    updatedAt: nowIso(12 - index),
  }));

  const vehicles: VehicleRecord[] = [
    ["veh-001", "Xuồng máy ST-01", "boat", 8, "available", "Bến Hải Chánh", 85],
    ["veh-002", "Xuồng composite CT-02", "boat", 6, "available", "Bến Long Thuận", 70],
    ["veh-003", "Xe tải cứu trợ 2.5T", "truck", 1200, "available", "Kho Nam Phước", 92],
    ["veh-004", "Xe cứu thương HL-115", "ambulance", 3, "available", "Bệnh viện dã chiến Bình Định", 88],
    ["veh-005", "Xe máy trung chuyển AN-09", "motorbike", 2, "available", "Phường Hòa Hiệp Nam", 64],
    ["veh-006", "Drone thả hàng DR-03", "drone", 15, "maintenance", "Điểm tập kết Cà Mau", 100],
  ].map(([id, name, vehicleType, capacity, status, baseLocation, fuelLevel], index) => ({
    id,
    name,
    vehicleType: vehicleType as VehicleType,
    capacity,
    status: status as VehicleStatus,
    baseLocation,
    fuelLevel,
    note:
      vehicleType === "boat"
        ? "Ưu tiên tiếp cận khu vực ngập sâu."
        : vehicleType === "drone"
          ? "Dùng cho đơn hàng nhẹ, thuốc và radio."
          : "Sẵn sàng điều phối theo lệnh trung tâm.",
    image:
      vehicleType === "ambulance"
        ? "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80"
        : vehicleType === "truck"
          ? "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80"
          : vehicleType === "drone"
            ? "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80"
            : "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=800&q=80",
    tags:
      vehicleType === "boat"
        ? ["đường thủy", "ưu tiên sơ tán"]
        : vehicleType === "truck"
          ? ["hậu cần", "hàng nặng"]
          : vehicleType === "drone"
            ? ["chuyển nhanh", "hàng nhẹ"]
            : ["cơ động"],
    createdAt: nowIso(96 - index * 3),
    updatedAt: nowIso(10 - index),
  }));

  const locations: LocationRecord[] = [];
  const victims: VictimRecord[] = [];
  const victimTags: VictimTagRecord[] = [];

  locationSeeds.forEach((seed, index) => {
    const createdAt = nowIso(24 + index * 4);
    const status: LocationStatus =
      seed.emergencyLevel === "critical"
        ? "active"
        : seed.id === "loc-004"
          ? "safe"
          : "in_progress";

    locations.push({
      id: seed.id,
      address: seed.address,
      lat: seed.lat,
      lng: seed.lng,
      emergencyLevel: seed.emergencyLevel,
      routeConfidence: seed.routeConfidence,
      preferredTransportMode: seed.preferredTransportMode,
      summary: seed.summary,
      note: seed.note,
      status,
      isResolved: status === "safe",
      source: seed.source,
      tags: seed.victims.flatMap((victim) => victim.needTypes).slice(0, 3),
      labelId:
        seed.emergencyLevel === "critical"
          ? "lbl-001"
          : seed.summary.includes("thuốc") || seed.summary.includes("y tế")
            ? "lbl-003"
            : "lbl-002",
      lastVerifiedAt: nowIso(index + 2),
      createdAt,
      updatedAt: nowIso(index),
    });

    seed.victims.forEach((victim, victimIndex) => {
      victims.push({
        id: victim.id,
        fullname: victim.fullname,
        phone: victim.phone,
        age: victim.age,
        gender: victim.gender,
        householdSize: victim.householdSize,
        hasChildren: victim.hasChildren,
        hasElderly: victim.hasElderly,
        hasDisability: victim.hasDisability,
        isPregnant: victim.isPregnant,
        needsMedical: victim.needsMedical,
        needTypes: [...victim.needTypes],
        medicineList: [...victim.medicineList],
        waterDepthEstimate: victim.waterDepthEstimate,
        boatAccessible: victim.boatAccessible,
        daysWithoutAid: victim.daysWithoutAid ?? (seed.emergencyLevel === "critical" ? 2 : 1),
        addressText: seed.address,
        note:
          victim.needsMedical
            ? "Cần nhân viên y tế kiểm tra ngay khi tiếp cận."
            : "Đã xác minh qua hotline hoặc tình nguyện viên địa bàn.",
        locationId: seed.id,
        conversations: [],
        createdAt: nowIso(30 + index * 2 + victimIndex),
        updatedAt: nowIso(index + victimIndex),
      });

      if (index < 6) {
        victimTags.push({
          id: `vtg-${victim.id}`,
          victimId: victim.id,
          name: index % 3 === 0 ? "Cần sơ tán" : "Đã xác minh",
          color: index % 3 === 0 ? "#ef4444" : "#0ea5e9",
          icon: index % 3 === 0 ? "lifebuoy" : "badge-check",
          description:
            index % 3 === 0
              ? "Ưu tiên rút người khỏi vùng ngập sâu."
              : "Thông tin đã được xác minh trong 6 giờ gần nhất.",
        });
      }
    });
  });

  const markers: MarkerRecord[] = markerSeeds.map((marker, index) => ({
    ...marker,
    createdAt: nowIso(48 - index * 2),
    updatedAt: nowIso(index + 1),
  }));

  const rescuePlans: RescuePlanRecord[] = [
    {
      id: "pln-001",
      title: "Chiến dịch sơ tán Triệu Độ - Hải Chánh",
      description:
        "## Tình huống\nNhiều hộ mắc kẹt tại vùng nước chảy xiết.\n\n## Mục tiêu\nSơ tán người già, trẻ nhỏ và chuyển thuốc khẩn cấp.\n\n## Hành động\nTiếp cận bằng xuồng máy, chia 2 mũi vào nhà dân.\n\n## Rủi ro\nDòng chảy mạnh và vật cản nổi.",
      status: "active",
      priority: "critical",
      locationIds: ["loc-001", "loc-005"],
      rescuerIds: ["res-001", "res-003"],
      vehicleIds: ["veh-001"],
      createdAt: nowIso(18),
      updatedAt: nowIso(2),
    },
    {
      id: "pln-002",
      title: "Tiếp tế nước sạch cụm Hậu Giang",
      description:
        "## Tình huống\nKhu vực dân cư ngập kéo dài, thiếu nước sạch và sữa em bé.\n\n## Mục tiêu\nPhát nước uống, sữa và lương thực khô trong ngày.\n\n## Phương án tiếp cận\nXuồng composite kết hợp bốc xếp nhanh tại bến tạm.",
      status: "draft",
      priority: "high",
      locationIds: ["loc-003", "loc-006"],
      rescuerIds: ["res-004", "res-005"],
      vehicleIds: ["veh-002", "veh-003"],
      createdAt: nowIso(14),
      updatedAt: nowIso(5),
    },
    {
      id: "pln-003",
      title: "Hành lang y tế Bình Định",
      description:
        "## Tình huống\nCó ca sốt cao cần sơ tán khẩn.\n\n## Mục tiêu\nĐưa bệnh nhân ra điểm bàn giao xe cứu thương an toàn.\n\n## Nhân lực & phương tiện\n1 y tế, 1 lái xuồng, 1 điều phối.",
      status: "active",
      priority: "critical",
      locationIds: ["loc-008"],
      rescuerIds: ["res-003", "res-008"],
      vehicleIds: ["veh-004"],
      createdAt: nowIso(10),
      updatedAt: nowIso(1),
    },
    {
      id: "pln-004",
      title: "Khảo sát và xác minh Nam Phước",
      description:
        "## Tình huống\nThông tin chia cắt giao thông còn chưa đồng nhất.\n\n## Mục tiêu\nXác minh luồng tiếp cận và cập nhật báo cáo tuyến đường.\n\n## Hành động\nKhảo sát bằng xe máy và bộ hành.",
      status: "completed",
      priority: "medium",
      locationIds: ["loc-004"],
      rescuerIds: ["res-002"],
      vehicleIds: ["veh-005"],
      createdAt: nowIso(30),
      updatedAt: nowIso(8),
    },
  ];

  const routeReports: RouteReportRecord[] = [
    {
      id: "rpt-001",
      locationId: "loc-001",
      markerId: "mrk-001",
      reporterId: "res-001",
      transportMode: "boat",
      confidence: "dangerous",
      isPassable: false,
      waterDepthText: "Nước xoáy mạnh, sâu hơn 1,8m",
      currentStrengthText: "Chảy xiết theo hướng nam",
      note: "Không nên cho xuồng chèo tay tiếp cận.",
      path: [
        [16.756, 107.114],
        [16.758, 107.119],
      ],
      reportedAt: nowIso(5),
      createdAt: nowIso(5),
      updatedAt: nowIso(5),
    },
    {
      id: "rpt-002",
      locationId: "loc-002",
      reporterId: "res-002",
      transportMode: "ambulance",
      confidence: "medium",
      isPassable: true,
      waterDepthText: "Ngập bánh xe, đi chậm",
      currentStrengthText: "Ổn định",
      note: "Đoạn cuối cần đi bộ khoảng 80m.",
      reportedAt: nowIso(4),
      createdAt: nowIso(4),
      updatedAt: nowIso(4),
    },
    {
      id: "rpt-003",
      locationId: "loc-007",
      reporterId: "res-003",
      transportMode: "drone",
      confidence: "high",
      isPassable: true,
      note: "Có thể thả thuốc tại mái tôn phía trước nhà.",
      reportedAt: nowIso(3),
      createdAt: nowIso(3),
      updatedAt: nowIso(3),
    },
    {
      id: "rpt-004",
      locationId: "loc-019",
      markerId: "mrk-008",
      reporterId: "res-001",
      transportMode: "boat",
      confidence: "medium",
      isPassable: true,
      waterDepthText: "Mực nước 1,4m đến 1,7m",
      currentStrengthText: "Gió ngang mạnh sau 14h",
      note: "Tuyến xuồng Tam Giang đi được buổi sáng, cần 2 áo phao dự phòng.",
      path: [
        [16.4949, 107.6268],
        [16.5002, 107.6364],
        [16.5061, 107.6442],
      ],
      reportedAt: nowIso(2),
      createdAt: nowIso(2),
      updatedAt: nowIso(2),
    },
    {
      id: "rpt-005",
      locationId: "loc-014",
      markerId: "mrk-013",
      reporterId: "res-004",
      transportMode: "boat",
      confidence: "low",
      isPassable: true,
      waterDepthText: "Ngập đồng đều 1,2m đến 1,4m",
      currentStrengthText: "Ổn định theo mặt kênh",
      note: "Xuồng lớn vào được đầu xóm, đoạn cuối phải kéo hàng tay.",
      path: [
        [9.8231, 105.7482],
        [9.8278, 105.7533],
        [9.8331, 105.7507],
      ],
      reportedAt: nowIso(2),
      createdAt: nowIso(2),
      updatedAt: nowIso(2),
    },
    {
      id: "rpt-006",
      locationId: "loc-018",
      markerId: "mrk-015",
      reporterId: "res-006",
      transportMode: "boat",
      confidence: "high",
      isPassable: true,
      waterDepthText: "Ngập sâu 0,8m tới 1,0m theo bờ sông",
      currentStrengthText: "Êm, có thể đi liên tục 2 chiều",
      note: "Luồng cứu trợ Năm Căn phù hợp cho vỏ lãi và xuồng máy nhỏ.",
      path: [
        [8.7391, 104.9786],
        [8.7442, 104.9907],
        [8.7505, 105.0021],
      ],
      reportedAt: nowIso(1),
      createdAt: nowIso(1),
      updatedAt: nowIso(1),
    },
    {
      id: "rpt-007",
      locationId: "loc-017",
      markerId: "mrk-016",
      reporterId: "res-008",
      transportMode: "hand_off",
      confidence: "low",
      isPassable: false,
      waterDepthText: "Ngập cục bộ 0,6m ở chân cầu tạm",
      currentStrengthText: "Nước đứng",
      note: "Cầu tạm sạt lở, cần bàn giao hàng sang xe máy ở điểm chờ.",
      reportedAt: nowIso(1),
      createdAt: nowIso(1),
      updatedAt: nowIso(1),
    },
  ];

  const conversations: ConversationRecord[] = [
    {
      id: "cnv-001",
      providerConversationId: "hl2026-conv-001",
      channel: "call",
      agentName: "Trợ lý thoại HumanLogs",
      status: "done",
      startedAt: nowIso(6),
      durationSeconds: 145,
      messageCount: 8,
      phoneNumber: "0911000001",
      summary:
        "Hộ 5 người tại Hải Chánh đang mắc kẹt trên gác, có người lớn tuổi cần thuốc tim trong ngày.",
      dataCollectionResults: {
        emergency_level: "critical",
        need_types: ["nuoc", "luong_thuc", "thuoc"],
        household_size: 5,
        boat_accessible: true,
      },
      transcript: [
        { role: "user", message: "Nhà tôi ngập sâu, đang thiếu nước uống." },
        { role: "assistant", message: "Cho tôi xin địa chỉ và số người trong nhà." },
        { role: "user", message: "Có 5 người, một người lớn tuổi cần thuốc tim." },
        { role: "assistant", message: "Tôi đã ghi nhận và chuyển ưu tiên cho đội điều phối." },
      ],
      rawPayload: { source: "mock" },
      victimId: "vic-001",
      locationId: "loc-001",
    },
    {
      id: "cnv-002",
      providerConversationId: "hl2026-conv-002",
      channel: "chat",
      agentName: "Trợ lý chat HumanLogs",
      status: "done",
      startedAt: nowIso(8),
      durationSeconds: 196,
      messageCount: 11,
      phoneNumber: "0911000003",
      summary:
        "Gia đình tại Hòa Hiệp Nam đề nghị sơ tán thai phụ và hỗ trợ nước sạch trong hôm nay.",
      dataCollectionResults: {
        emergency_level: "high",
        need_types: ["so_tan", "nuoc"],
        household_size: 3,
        is_pregnant: true,
      },
      transcript: [
        { role: "user", message: "Nhà tôi có thai phụ, cần hỗ trợ sơ tán." },
        { role: "assistant", message: "Xin cho biết địa chỉ và tình trạng ngập hiện tại." },
        { role: "user", message: "Ngập khoảng 70cm, xe cứu thương có thể vào đầu hẻm." },
        { role: "assistant", message: "Đã ghi nhận, điều phối viên sẽ ưu tiên phương án tiếp cận." },
      ],
      rawPayload: { source: "mock" },
      victimId: "vic-003",
      locationId: "loc-002",
    },
    {
      id: "cnv-003",
      providerConversationId: "hl2026-conv-003",
      channel: "call",
      agentName: "Trợ lý thoại HumanLogs",
      status: "processing",
      startedAt: nowIso(2),
      durationSeconds: 121,
      messageCount: 7,
      phoneNumber: "0911000013",
      summary:
        "Người dân tại Cái Bè cần insulin khẩn, hệ thống đang chờ xác minh tuyến thả hàng.",
      dataCollectionResults: {
        emergency_level: "high",
        need_types: ["thuoc", "nuoc"],
        household_size: 2,
        needs_medical: true,
      },
      transcript: [
        { role: "user", message: "Tôi cần insulin gấp, nước đang lên." },
        { role: "assistant", message: "Tôi đã ghi nhận nhu cầu y tế khẩn và địa chỉ giao." },
      ],
      rawPayload: { source: "mock" },
      victimId: "vic-013",
      locationId: "loc-007",
    },
  ];

  victims.forEach((victim) => {
    victim.conversations = conversations
      .filter(
        (conversation) =>
          conversation.victimId === victim.id ||
          (conversation.phoneNumber && conversation.phoneNumber === victim.phone),
      )
      .map((conversation) => conversation.providerConversationId);
  });

  const store: MockStore = {
    labels,
    locations,
    victims,
    victimTags,
    markers,
    vehicles,
    rescuers,
    rescuePlans,
    routeReports,
    conversations,
  };

  recomputeDerivedState(store);
  return store;
};

const clone = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const loadStore = (): MockStore => {
  if (storeCache) return storeCache;

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        storeCache = JSON.parse(raw) as MockStore;
        recomputeDerivedState(storeCache);
        return storeCache;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  storeCache = buildInitialStore();
  return storeCache;
};

const persistStore = (nextStore: MockStore) => {
  storeCache = nextStore;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  }
};

const mutateStore = <T,>(updater: (draft: MockStore) => T): T => {
  const draft = clone(loadStore());
  const result = updater(draft);
  persistStore(draft);
  return result;
};

const touch = () => new Date().toISOString();

const getLocationById = (store: MockStore, locationId?: string) =>
  store.locations.find((location) => location.id === locationId);

const getVictimTags = (store: MockStore, victimId: string) =>
  store.victimTags.filter((tag) => tag.victimId === victimId);

const getCurrentPlanForRescuer = (store: MockStore, rescuerId: string) =>
  [...store.rescuePlans]
    .filter((plan) => plan.rescuerIds.includes(rescuerId))
    .sort((a, b) => {
      const statusOrder: Record<RescuePlanStatus, number> = {
        active: 0,
        draft: 1,
        completed: 2,
        cancelled: 3,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    })[0];

const getConversationsForVictim = (store: MockStore, victim: VictimRecord) =>
  store.conversations.filter(
    (conversation) =>
      conversation.victimId === victim.id ||
      victim.conversations.includes(conversation.providerConversationId),
  );

const getConversationsForLocation = (store: MockStore, locationId: string) =>
  store.conversations.filter((conversation) => conversation.locationId === locationId);

const buildLocationListItem = (store: MockStore, location: LocationRecord) =>
  ({
    ...location,
    title: location.summary || location.address || "Điểm hỗ trợ",
    victims: store.victims
      .filter((victim) => victim.locationId === location.id)
      .map((victim) => ({
        id: victim.id,
        fullname: victim.fullname,
        phone: victim.phone,
        age: victim.age,
        tags: getVictimTags(store, victim.id),
      })),
  }) as RouterOutputs["location"]["findMany"][number];

const buildLocationDetail = (store: MockStore, location: LocationRecord) =>
  ({
    ...buildLocationListItem(store, location),
    victims: store.victims
      .filter((victim) => victim.locationId === location.id)
      .map((victim) => ({
        ...victim,
        tags: getVictimTags(store, victim.id),
      })),
    label: store.labels.find((label) => label.id === location.labelId) ?? null,
    routeReports: store.routeReports
      .filter((report) => report.locationId === location.id)
      .map((report) => ({
        ...report,
        reporter: report.reporterId
          ? store.rescuers.find((rescuer) => rescuer.id === report.reporterId) ?? null
          : null,
      })),
    relatedConversations: getConversationsForLocation(store, location.id),
  }) as RouterOutputs["location"]["findById"];

const buildVictimListItem = (store: MockStore, victim: VictimRecord) =>
  ({
    ...victim,
    tags: getVictimTags(store, victim.id),
    location: victim.locationId ? getLocationById(store, victim.locationId) ?? null : null,
  }) as RouterOutputs["victim"]["findMany"][number];

const buildVictimDetail = (store: MockStore, victim: VictimRecord) =>
  ({
    ...buildVictimListItem(store, victim),
    relatedConversations: getConversationsForVictim(store, victim),
  }) as RouterOutputs["victim"]["findById"];

const buildRescuerListItem = (rescuer: RescuerRecord) =>
  ({
    ...rescuer,
  }) as RouterOutputs["rescuer"]["findMany"][number];

const buildRescuerDetail = (store: MockStore, rescuer: RescuerRecord) =>
  ({
    ...rescuer,
    currentPlan: (() => {
      const plan = getCurrentPlanForRescuer(store, rescuer.id);
      if (!plan) return null;
      return {
        id: plan.id,
        title: plan.title,
        status: plan.status,
      };
    })(),
  }) as RouterOutputs["rescuer"]["findById"];

const buildVehicleDetail = (vehicle: VehicleRecord) =>
  ({
    ...vehicle,
  }) as RouterOutputs["vehicle"]["findById"];

const buildPlan = (store: MockStore, plan: RescuePlanRecord) =>
  ({
    ...plan,
    locations: plan.locationIds
      .map((locationId) => store.locations.find((location) => location.id === locationId))
      .filter(Boolean)
      .map((location) => ({
        location: {
          id: location!.id,
          address: location!.address ?? null,
        },
      })),
    rescuers: plan.rescuerIds
      .map((rescuerId) => store.rescuers.find((rescuer) => rescuer.id === rescuerId))
      .filter(Boolean)
      .map((rescuer) => ({
        rescuer: {
          id: rescuer!.id,
          fullName: rescuer!.fullName,
        },
      })),
    vehicles: plan.vehicleIds
      .map((vehicleId) => store.vehicles.find((vehicle) => vehicle.id === vehicleId))
      .filter(Boolean)
      .map((vehicle) => ({
        vehicle: {
          id: vehicle!.id,
          name: vehicle!.name,
        },
      })),
  }) as RouterOutputs["rescuePlan"]["findMany"][number];

const buildRouteReport = (store: MockStore, report: RouteReportRecord) =>
  ({
    ...report,
    reporter: report.reporterId
      ? store.rescuers.find((rescuer) => rescuer.id === report.reporterId) ?? null
      : null,
  }) as RouterOutputs["routeReport"]["findMany"][number];

const generateId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeSearch = (value?: string) => value?.trim().toLowerCase() ?? "";

const inferTransportMode = (victims: Array<Partial<VictimRecord>>, address?: string) => {
  if (victims.some((victim) => victim.boatAccessible || victim.waterDepthEstimate?.includes("1,"))) {
    return "boat" as TransportMode;
  }
  if (victims.some((victim) => victim.needsMedical)) {
    return "ambulance" as TransportMode;
  }
  if (victims.some((victim) => victim.needTypes?.includes("thuoc"))) {
    return "drone" as TransportMode;
  }
  if (address?.toLowerCase().includes("hẻm")) {
    return "hand_off" as TransportMode;
  }
  return "road" as TransportMode;
};

const inferRouteConfidence = (victims: Array<Partial<VictimRecord>>) => {
  if (victims.some((victim) => victim.boatAccessible && victim.waterDepthEstimate?.includes("2"))) {
    return "dangerous" as RouteConfidence;
  }
  if (victims.some((victim) => victim.boatAccessible)) {
    return "medium" as RouteConfidence;
  }
  if (victims.some((victim) => victim.needsMedical)) {
    return "low" as RouteConfidence;
  }
  return "unverified" as RouteConfidence;
};

const buildLocationSummary = (location: LocationRecord, victims: VictimRecord[]) => {
  if (location.summary) return location.summary;
  const householdSize =
    victims.reduce((total, victim) => total + (victim.householdSize ?? 1), 0) || victims.length;
  const needList = [...new Set(victims.flatMap((victim) => victim.needTypes ?? []))];
  const needText = needList.length ? needList.slice(0, 2).join(", ") : "hỗ trợ khẩn";
  return `Hộ ${householdSize} người tại ${location.address ?? "điểm chưa rõ"} đang cần ${needText}.`;
};

const recomputeDerivedState = (store: MockStore) => {
  const activeRescuerIds = new Set(
    store.rescuePlans
      .filter((plan) => plan.status === "active")
      .flatMap((plan) => plan.rescuerIds),
  );

  const activeVehicleIds = new Set(
    store.rescuePlans
      .filter((plan) => plan.status === "active")
      .flatMap((plan) => plan.vehicleIds),
  );

  const completedLocationIds = new Set(
    store.rescuePlans
      .filter((plan) => plan.status === "completed")
      .flatMap((plan) => plan.locationIds),
  );

  const activeLocationIds = new Set(
    store.rescuePlans
      .filter((plan) => plan.status === "active")
      .flatMap((plan) => plan.locationIds),
  );

  store.rescuers = store.rescuers.map((rescuer) => {
    if (rescuer.status === "injured" || rescuer.status === "off_duty") {
      return rescuer;
    }

    return {
      ...rescuer,
      status: activeRescuerIds.has(rescuer.id) ? "on_mission" : rescuer.status === "on_mission" ? "available" : rescuer.status ?? "available",
    };
  });

  store.vehicles = store.vehicles.map((vehicle) => ({
    ...vehicle,
    status:
      vehicle.status === "maintenance" || vehicle.status === "offline"
        ? vehicle.status
        : activeVehicleIds.has(vehicle.id)
          ? "on_mission"
          : vehicle.status === "on_mission"
            ? "available"
            : vehicle.status ?? "available",
  }));

  store.locations = store.locations.map((location) => {
    const victims = store.victims.filter((victim) => victim.locationId === location.id);
    const nextStatus: LocationStatus =
      completedLocationIds.has(location.id)
        ? "safe"
        : activeLocationIds.has(location.id)
          ? "in_progress"
          : location.status === "safe"
            ? "safe"
            : location.status;

    return {
      ...location,
      isResolved: nextStatus === "safe",
      status: nextStatus,
      summary: buildLocationSummary(location, victims),
    };
  });
};

const sortLocations = (
  locations: Array<RouterOutputs["location"]["findMany"][number]>,
  sort?: RouterInputs["location"]["findMany"]["sort"],
) => {
  switch (sort) {
    case "oldest":
      return [...locations].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "emergency":
      return [...locations].sort(
        (a, b) =>
          emergencyOrder[a.emergencyLevel] - emergencyOrder[b.emergencyLevel] ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "a-z":
      return [...locations].sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "vi"));
    case "z-a":
      return [...locations].sort((a, b) => (b.title ?? "").localeCompare(a.title ?? "", "vi"));
    case "newest":
    default:
      return [...locations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
};

export const mockStoreApi = {
  reset() {
    const initialStore = buildInitialStore();
    persistStore(initialStore);
    return initialStore;
  },

  victim: {
    findMany(input?: RouterInputs["victim"]["findMany"]) {
      const store = loadStore();
      const search = normalizeSearch(input?.search);
      const victims = store.victims
        .map((victim) => buildVictimListItem(store, victim))
        .filter((victim) => {
          if (!search) return true;
          const haystack = [
            victim.fullname,
            victim.phone,
            victim.addressText,
            victim.location?.address,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(search);
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

      return victims as RouterOutputs["victim"]["findMany"];
    },

    findById(input: RouterInputs["victim"]["findById"]) {
      const store = loadStore();
      const victim = store.victims.find((item) => item.id === input.id);
      if (!victim) return null as RouterOutputs["victim"]["findById"];
      return buildVictimDetail(store, victim);
    },

    create(input: RouterInputs["victim"]["create"]) {
      return mutateStore((store) => {
        const now = touch();
        const victim: VictimRecord = {
          id: generateId("vic"),
          fullname: input.fullname,
          phone: input.phone,
          phone2: input.phone2,
          email: input.email,
          age: input.age ?? undefined,
          gender: input.gender ?? undefined,
          note: input.note,
          facebookURL: input.facebookURL,
          addressText: input.addressText,
          locationId: input.locationId ?? undefined,
          conversations: [],
          householdSize: input.householdSize ?? undefined,
          hasChildren: input.hasChildren ?? false,
          hasElderly: input.hasElderly ?? false,
          hasDisability: input.hasDisability ?? false,
          isPregnant: input.isPregnant ?? false,
          needsMedical: input.needsMedical ?? false,
          needTypes: (input.needTypes ?? []) as NeedType[],
          medicineList: input.medicineList ?? [],
          daysWithoutAid: input.daysWithoutAid ?? undefined,
          waterDepthEstimate: input.waterDepthEstimate ?? undefined,
          boatAccessible: input.boatAccessible ?? false,
          createdAt: now,
          updatedAt: now,
        };

        store.victims.unshift(victim);
        return buildVictimDetail(store, victim);
      });
    },

    update(input: RouterInputs["victim"]["update"]) {
      return mutateStore((store) => {
        const victim = store.victims.find((item) => item.id === input.id);
        if (!victim) throw new Error("Không tìm thấy hộ dân cần cập nhật.");

        Object.assign(victim, {
          ...input.data,
          needTypes: input.data.needTypes ?? victim.needTypes,
          medicineList: input.data.medicineList ?? victim.medicineList,
          updatedAt: touch(),
        });

        return buildVictimDetail(store, victim);
      });
    },

    delete(input: RouterInputs["victim"]["delete"]) {
      return mutateStore((store) => {
        store.victimTags = store.victimTags.filter((tag) => tag.victimId !== input.id);
        store.conversations = store.conversations.filter((conversation) => conversation.victimId !== input.id);
        const nextVictims = store.victims.filter((victim) => victim.id !== input.id);
        if (nextVictims.length === store.victims.length) {
          throw new Error("Không tìm thấy hộ dân để xóa.");
        }
        store.victims = nextVictims;
        recomputeDerivedState(store);
        return { success: true } as RouterOutputs["victim"]["delete"];
      });
    },
  },

  location: {
    findMany(input?: RouterInputs["location"]["findMany"]) {
      const store = loadStore();
      const search = normalizeSearch(input?.search);
      const items = store.locations
        .map((location) => buildLocationListItem(store, location))
        .filter((location) => {
          if (!search) return true;
          const haystack = [
            location.address,
            location.summary,
            ...location.victims.flatMap((victim) => [victim.fullname, victim.phone]),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(search);
        });

      return sortLocations(items, input?.sort) as RouterOutputs["location"]["findMany"];
    },

    findById(input: RouterInputs["location"]["findById"]) {
      const store = loadStore();
      const location = store.locations.find((item) => item.id === input.id);
      if (!location) return null as RouterOutputs["location"]["findById"];
      return buildLocationDetail(store, location);
    },

    create(input: RouterInputs["location"]["create"]) {
      return mutateStore((store) => {
        const now = touch();
        const locationId = generateId("loc");
        const victimsPreview = (input.victims ?? []).map((victim) => ({
          needTypes: victim.needTypes ?? [],
          boatAccessible: victim.boatAccessible,
          needsMedical: victim.needsMedical,
          waterDepthEstimate: victim.waterDepthEstimate,
        }));

        const location: LocationRecord = {
          id: locationId,
          lat: input.lat,
          lng: input.lng,
          address: input.address ?? "Điểm hỗ trợ mới",
          summary: input.summary,
          note: input.note,
          emergencyLevel: input.emergencyLevel ?? "medium",
          status: "active",
          isResolved: false,
          tags: input.tags ?? [],
          routeConfidence: inferRouteConfidence(victimsPreview),
          preferredTransportMode: inferTransportMode(victimsPreview, input.address),
          source: "manual",
          lastVerifiedAt: now,
          labelId:
            input.emergencyLevel === "critical"
              ? "lbl-001"
              : victimsPreview.some((victim) => victim.needsMedical)
                ? "lbl-003"
                : "lbl-002",
          createdAt: now,
          updatedAt: now,
        };

        store.locations.unshift(location);

        (input.victims ?? []).forEach((victimInput) => {
          const victim: VictimRecord = {
            id: generateId("vic"),
            fullname: victimInput.fullname,
            phone: victimInput.phone,
            phone2: victimInput.phone2,
            age: victimInput.age ?? undefined,
            gender: victimInput.gender ?? undefined,
            householdSize: victimInput.householdSize ?? undefined,
            needTypes: (victimInput.needTypes ?? []) as NeedType[],
            needsMedical: victimInput.needsMedical ?? false,
            medicineList: victimInput.medicineList ?? [],
            waterDepthEstimate: victimInput.waterDepthEstimate ?? undefined,
            boatAccessible: victimInput.boatAccessible ?? false,
            hasChildren: victimInput.hasChildren ?? false,
            hasElderly: victimInput.hasElderly ?? false,
            hasDisability: victimInput.hasDisability ?? false,
            isPregnant: victimInput.isPregnant ?? false,
            daysWithoutAid: victimInput.daysWithoutAid ?? undefined,
            note: victimInput.note ?? undefined,
            addressText: input.address ?? undefined,
            locationId,
            conversations: [],
            createdAt: now,
            updatedAt: now,
          };

          store.victims.unshift(victim);
        });

        recomputeDerivedState(store);
        const createdLocation = store.locations.find((item) => item.id === locationId)!;
        return buildLocationDetail(store, createdLocation);
      });
    },

    delete(input: RouterInputs["location"]["delete"]) {
      return mutateStore((store) => {
        const location = store.locations.find((item) => item.id === input.id);
        if (!location) throw new Error("Không tìm thấy điểm hỗ trợ để xóa.");

        const victimIds = store.victims
          .filter((victim) => victim.locationId === input.id)
          .map((victim) => victim.id);

        store.locations = store.locations.filter((item) => item.id !== input.id);
        store.victims = store.victims.filter((victim) => victim.locationId !== input.id);
        store.victimTags = store.victimTags.filter((tag) => !victimIds.includes(tag.victimId));
        store.routeReports = store.routeReports.filter((report) => report.locationId !== input.id);
        store.conversations = store.conversations.filter((conversation) => conversation.locationId !== input.id);
        store.rescuePlans = store.rescuePlans.map((plan) => ({
          ...plan,
          locationIds: plan.locationIds.filter((locationId) => locationId !== input.id),
          updatedAt: touch(),
        }));

        recomputeDerivedState(store);
        return { success: true } as RouterOutputs["location"]["delete"];
      });
    },
  },

  marker: {
    findMany() {
      return loadStore().markers as RouterOutputs["marker"]["findMany"];
    },

    findById(input: RouterInputs["marker"]["findById"]) {
      const marker = loadStore().markers.find((item) => item.id === input.id);
      return (marker ?? null) as RouterOutputs["marker"]["findById"];
    },

    create(input: RouterInputs["marker"]["create"]) {
      return mutateStore((store) => {
        const marker: MarkerRecord = {
          id: generateId("mrk"),
          lat: input.lat,
          lng: input.lng,
          note: input.note ?? undefined,
          name: input.name ?? undefined,
          color: input.color ?? "#dc2626",
          fillOpacity: input.fillOpacity ?? 0.35,
          isClosedPath: input.isClosedPath ?? false,
          paths: input.paths as Array<[number, number]> | undefined,
          type: (input.type ?? "mark") as MarkerType,
          markType: input.markType as MarkerMarkType | undefined,
          createdAt: touch(),
          updatedAt: touch(),
        };

        store.markers.unshift(marker);
        return marker as RouterOutputs["marker"]["create"];
      });
    },

    update(input: RouterInputs["marker"]["update"]) {
      return mutateStore((store) => {
        const marker = store.markers.find((item) => item.id === input.id);
        if (!marker) throw new Error("Không tìm thấy điểm cảnh báo.");
        Object.assign(marker, {
          ...input.data,
          updatedAt: touch(),
        });
        return marker as RouterOutputs["marker"]["update"];
      });
    },

    delete(input: RouterInputs["marker"]["delete"]) {
      return mutateStore((store) => {
        const nextMarkers = store.markers.filter((marker) => marker.id !== input.id);
        if (nextMarkers.length === store.markers.length) {
          throw new Error("Không tìm thấy đối tượng cảnh báo để xóa.");
        }
        store.markers = nextMarkers;
        store.routeReports = store.routeReports.filter((report) => report.markerId !== input.id);
        return { success: true } as RouterOutputs["marker"]["delete"];
      });
    },
  },

  vehicle: {
    findMany(input?: RouterInputs["vehicle"]["findMany"]) {
      const search = normalizeSearch(input?.search);
      return loadStore().vehicles
        .filter((vehicle) =>
          !search
            ? true
            : [vehicle.name, vehicle.baseLocation, vehicle.note]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(search),
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ) as RouterOutputs["vehicle"]["findMany"];
    },

    findById(input: RouterInputs["vehicle"]["findById"]) {
      const vehicle = loadStore().vehicles.find((item) => item.id === input.id);
      return (vehicle ? buildVehicleDetail(vehicle) : null) as RouterOutputs["vehicle"]["findById"];
    },

    create(input: RouterInputs["vehicle"]["create"]) {
      return mutateStore((store) => {
        const now = touch();
        const vehicle: VehicleRecord = {
          id: generateId("veh"),
          name: input.name,
          image: input.image ?? undefined,
          vehicleType: input.vehicleType as VehicleType | undefined,
          capacity: input.capacity ?? undefined,
          status: (input.status as VehicleStatus | undefined) ?? "available",
          baseLocation: input.baseLocation ?? undefined,
          fuelLevel: input.fuelLevel ?? undefined,
          tags: input.tags ?? [],
          note: input.note ?? undefined,
          createdAt: now,
          updatedAt: now,
        };
        store.vehicles.unshift(vehicle);
        return vehicle as RouterOutputs["vehicle"]["create"];
      });
    },

    update(input: RouterInputs["vehicle"]["update"]) {
      return mutateStore((store) => {
        const vehicle = store.vehicles.find((item) => item.id === input.id);
        if (!vehicle) throw new Error("Không tìm thấy phương tiện.");
        Object.assign(vehicle, {
          ...input.data,
          tags: input.data.tags ?? vehicle.tags,
          updatedAt: touch(),
        });
        return vehicle as RouterOutputs["vehicle"]["update"];
      });
    },

    delete(input: RouterInputs["vehicle"]["delete"]) {
      return mutateStore((store) => {
        const exists = store.vehicles.some((vehicle) => vehicle.id === input.id);
        if (!exists) throw new Error("Không tìm thấy phương tiện để xóa.");
        store.vehicles = store.vehicles.filter((vehicle) => vehicle.id !== input.id);
        store.rescuePlans = store.rescuePlans.map((plan) => ({
          ...plan,
          vehicleIds: plan.vehicleIds.filter((vehicleId) => vehicleId !== input.id),
          updatedAt: touch(),
        }));
        recomputeDerivedState(store);
        return { success: true } as RouterOutputs["vehicle"]["delete"];
      });
    },
  },

  rescuer: {
    findMany(input?: RouterInputs["rescuer"]["findMany"]) {
      const search = normalizeSearch(input?.search);
      return loadStore().rescuers
        .filter((rescuer) =>
          !search
            ? true
            : [rescuer.fullName, rescuer.phone, rescuer.region]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(search),
        )
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "vi")) as RouterOutputs["rescuer"]["findMany"];
    },

    findById(input: RouterInputs["rescuer"]["findById"]) {
      const store = loadStore();
      const rescuer = store.rescuers.find((item) => item.id === input.id);
      if (!rescuer) return null as RouterOutputs["rescuer"]["findById"];
      return buildRescuerDetail(store, rescuer);
    },

    create(input: RouterInputs["rescuer"]["create"]) {
      return mutateStore((store) => {
        const now = touch();
        const rescuer: RescuerRecord = {
          id: generateId("res"),
          fullName: input.fullName,
          phone: input.phone,
          secondaryPhone: input.secondaryPhone ?? undefined,
          email: input.email ?? undefined,
          address: input.address ?? undefined,
          role: input.role as RescuerRole | undefined,
          status: (input.status as RescuerStatus | undefined) ?? "available",
          experienceLevel: input.experienceLevel as ExperienceLevel | undefined,
          certifications: input.certifications ?? [],
          region: input.region ?? undefined,
          avatarUrl: input.avatarUrl ?? undefined,
          note: input.note ?? undefined,
          createdAt: now,
          updatedAt: now,
        };
        store.rescuers.unshift(rescuer);
        return rescuer as RouterOutputs["rescuer"]["create"];
      });
    },

    update(input: RouterInputs["rescuer"]["update"]) {
      return mutateStore((store) => {
        const rescuer = store.rescuers.find((item) => item.id === input.id);
        if (!rescuer) throw new Error("Không tìm thấy cứu hộ viên.");
        Object.assign(rescuer, {
          ...input.data,
          certifications: input.data.certifications ?? rescuer.certifications,
          updatedAt: touch(),
        });
        recomputeDerivedState(store);
        return buildRescuerDetail(store, rescuer);
      });
    },

    delete(input: RouterInputs["rescuer"]["delete"]) {
      return mutateStore((store) => {
        const exists = store.rescuers.some((rescuer) => rescuer.id === input.id);
        if (!exists) throw new Error("Không tìm thấy cứu hộ viên để xóa.");
        store.rescuers = store.rescuers.filter((rescuer) => rescuer.id !== input.id);
        store.routeReports = store.routeReports.filter((report) => report.reporterId !== input.id);
        store.rescuePlans = store.rescuePlans.map((plan) => ({
          ...plan,
          rescuerIds: plan.rescuerIds.filter((rescuerId) => rescuerId !== input.id),
          updatedAt: touch(),
        }));
        recomputeDerivedState(store);
        return { success: true } as RouterOutputs["rescuer"]["delete"];
      });
    },
  },

  rescuePlan: {
    findMany() {
      const store = loadStore();
      return [...store.rescuePlans]
        .sort(
          (a, b) =>
            rescuePriorityOrder[a.priority] - rescuePriorityOrder[b.priority] ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((plan) => buildPlan(store, plan)) as RouterOutputs["rescuePlan"]["findMany"];
    },

    findById(input: RouterInputs["rescuePlan"]["findById"]) {
      const store = loadStore();
      const plan = store.rescuePlans.find((item) => item.id === input.id);
      return (plan ? buildPlan(store, plan) : null) as RouterOutputs["rescuePlan"]["findById"];
    },

    create(input: RouterInputs["rescuePlan"]["create"]) {
      return mutateStore((store) => {
        const now = touch();
        const plan: RescuePlanRecord = {
          id: generateId("pln"),
          title: input.title || "Kế hoạch chưa đặt tên",
          description: input.description ?? undefined,
          status: (input.status as RescuePlanStatus | undefined) ?? "draft",
          priority: (input.priority as RescuePlanPriority | undefined) ?? "medium",
          locationIds: input.locationIds ?? [],
          rescuerIds: input.rescuerIds ?? [],
          vehicleIds: input.vehicleIds ?? [],
          createdAt: now,
          updatedAt: now,
        };
        store.rescuePlans.unshift(plan);
        recomputeDerivedState(store);
        return buildPlan(store, plan);
      });
    },

    update(input: RouterInputs["rescuePlan"]["update"]) {
      return mutateStore((store) => {
        const plan = store.rescuePlans.find((item) => item.id === input.id);
        if (!plan) throw new Error("Không tìm thấy kế hoạch điều phối.");

        const nextKeys = Object.keys(input.data ?? {});
        const isStatusOnly = nextKeys.every((key) => key === "status");

        if (plan.status !== "draft" && !isStatusOnly) {
          throw new Error("Kế hoạch không còn ở trạng thái nháp nên chỉ được đổi trạng thái.");
        }

        Object.assign(plan, {
          ...input.data,
          locationIds: input.data.locationIds ?? plan.locationIds,
          rescuerIds: input.data.rescuerIds ?? plan.rescuerIds,
          vehicleIds: input.data.vehicleIds ?? plan.vehicleIds,
          updatedAt: touch(),
        });

        recomputeDerivedState(store);
        return buildPlan(store, plan);
      });
    },

    delete(input: RouterInputs["rescuePlan"]["delete"]) {
      return mutateStore((store) => {
        const plan = store.rescuePlans.find((item) => item.id === input.id);
        if (!plan) throw new Error("Không tìm thấy kế hoạch để xóa.");
        if (plan.status !== "draft") {
          throw new Error("Chỉ có thể xóa kế hoạch đang ở trạng thái nháp.");
        }

        store.rescuePlans = store.rescuePlans.filter((item) => item.id !== input.id);
        recomputeDerivedState(store);
        return { success: true } as RouterOutputs["rescuePlan"]["delete"];
      });
    },

    generateDescription(input: RouterInputs["rescuePlan"]["generateDescription"]) {
      const store = loadStore();
      const relatedLocations = store.locations.filter((location) =>
        (input.locationIds ?? []).includes(location.id),
      );

      const needs = [...new Set(
        relatedLocations.flatMap((location) => location.tags).filter(Boolean),
      )]
        .slice(0, 4)
        .join(", ");

      const transports = [...new Set(
        relatedLocations.map((location) => location.preferredTransportMode),
      )]
        .join(", ");

      const content = [
        "## Tình huống",
        relatedLocations.length
          ? `${relatedLocations.length} điểm đang cần xử lý, tập trung tại ${relatedLocations
              .slice(0, 2)
              .map((location) => location.address)
              .filter(Boolean)
              .join(" và ")}.`
          : "Chưa có điểm nào được chọn.",
        "",
        "## Mục tiêu",
        needs
          ? `Ưu tiên hỗ trợ ${needs} và giữ an toàn cho các hộ có mức khẩn cấp cao.`
          : "Tiếp cận nhanh, xác minh hiện trường và hoàn tất hỗ trợ thiết yếu.",
        "",
        "## Hành động",
        transports
          ? `Tổ chức tiếp cận theo phương án ${transports}, chia ca vận chuyển và cập nhật kết quả ngay trên dashboard.`
          : "Chia lực lượng theo từng cụm điểm, duy trì liên lạc sau mỗi lượt tiếp cận.",
        "",
        "## Rủi ro an toàn",
        "Theo dõi mực nước, đường chia cắt và ưu tiên áo phao khi tiếp cận các khu vực ngập sâu.",
      ].join("\n");

      return { content } as RouterOutputs["rescuePlan"]["generateDescription"];
    },
  },

  conversation: {
    findMany() {
      return [...loadStore().conversations]
        .sort(
          (a, b) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        ) as RouterOutputs["conversation"]["findMany"];
    },

    findById(input: RouterInputs["conversation"]["findById"]) {
      const conversation = loadStore().conversations.find(
        (item) =>
          item.id === input.id || item.providerConversationId === input.id,
      );
      return (conversation ?? null) as RouterOutputs["conversation"]["findById"];
    },
  },

  routeReport: {
    findMany() {
      const store = loadStore();
      return store.routeReports.map((report) => buildRouteReport(store, report)) as RouterOutputs["routeReport"]["findMany"];
    },

    findById(input: RouterInputs["routeReport"]["findById"]) {
      const store = loadStore();
      const report = store.routeReports.find((item) => item.id === input.id);
      return (report ? buildRouteReport(store, report) : null) as RouterOutputs["routeReport"]["findById"];
    },
  },
};
