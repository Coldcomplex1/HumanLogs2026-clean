import { eq, inArray } from "drizzle-orm";
import { db, tables } from "../db";

const locationSeeds = [
  {
    address: "Thôn Mỹ Chánh, xã Hải Chánh, Quảng Trị",
    lat: 16.7582,
    lng: 107.1184,
    emergencyLevel: "critical" as const,
    routeConfidence: "dangerous" as const,
    preferredTransportMode: "boat" as const,
    summary: "Hộ 5 người mắc kẹt trên gác, có người cao tuổi cần thuốc tim mạch.",
    note: "Nước ngập gần 1,8m, đường liên thôn bị chia cắt hoàn toàn.",
    victims: [
      {
        fullname: "Nguyễn Thị Hương",
        phone: "0911000001",
        age: 42,
        gender: "female" as const,
        householdSize: 5,
        hasChildren: true,
        hasElderly: true,
        needsMedical: true,
        needTypes: ["thuoc", "nuoc", "luong_thuc"],
        medicineList: ["Thuốc tim", "Thuốc huyết áp"],
        waterDepthEstimate: "1,8m",
        boatAccessible: true,
      },
      {
        fullname: "Nguyễn Minh Khôi",
        phone: "0911000002",
        age: 12,
        gender: "male" as const,
        householdSize: 5,
        hasChildren: true,
        needTypes: ["nuoc", "luong_thuc", "ao_phao"],
        waterDepthEstimate: "1,8m",
        boatAccessible: true,
      },
    ],
  },
  {
    address: "Khối 4, phường Hòa Hiệp Nam, Đà Nẵng",
    lat: 16.1248,
    lng: 108.1501,
    emergencyLevel: "high" as const,
    routeConfidence: "medium" as const,
    preferredTransportMode: "ambulance" as const,
    summary: "Gia đình 3 người cần sơ tán, có thai phụ gần đến ngày sinh.",
    note: "Xe cứu thương có thể tiếp cận từ trục chính, hẻm cuối phải đi bộ.",
    victims: [
      {
        fullname: "Trần Thị Yến",
        phone: "0911000003",
        age: 29,
        gender: "female" as const,
        householdSize: 3,
        isPregnant: true,
        needTypes: ["so_tan", "nuoc"],
        waterDepthEstimate: "0,7m",
        boatAccessible: false,
      },
      {
        fullname: "Trần Văn Hải",
        phone: "0911000004",
        age: 33,
        gender: "male" as const,
        householdSize: 3,
        needTypes: ["luong_thuc", "nuoc"],
        waterDepthEstimate: "0,7m",
        boatAccessible: false,
      },
    ],
  },
  {
    address: "Ấp Phú Lợi, xã Tân Phước Hưng, Hậu Giang",
    lat: 9.8015,
    lng: 105.6712,
    emergencyLevel: "high" as const,
    routeConfidence: "high" as const,
    preferredTransportMode: "boat" as const,
    summary: "Điểm tiếp tế cho 2 hộ liền kề, thiếu nước sạch và sữa em bé.",
    note: "Xuồng nhỏ có thể áp sát mép hiên sau nhà.",
    victims: [
      {
        fullname: "Lê Thị Ngọc",
        phone: "0911000005",
        age: 26,
        gender: "female" as const,
        householdSize: 4,
        hasChildren: true,
        needTypes: ["nuoc", "sua_em_be", "luong_thuc"],
        waterDepthEstimate: "1,2m",
        boatAccessible: true,
      },
      {
        fullname: "Lê Bảo Trâm",
        phone: "0911000006",
        age: 2,
        gender: "female" as const,
        householdSize: 4,
        hasChildren: true,
        needTypes: ["sua_em_be"],
        waterDepthEstimate: "1,2m",
        boatAccessible: true,
      },
    ],
  },
  {
    address: "Tổ 8, thị trấn Nam Phước, Quảng Nam",
    lat: 15.7742,
    lng: 108.1249,
    emergencyLevel: "medium" as const,
    routeConfidence: "unverified" as const,
    preferredTransportMode: "hand_off" as const,
    summary: "Cần sạc điện và bổ sung lương thực cho hộ có 6 người.",
    note: "Đường chính có xe tải vào được, đoạn cuối phải trung chuyển bằng xe máy.",
    victims: [
      {
        fullname: "Phạm Văn Dũng",
        phone: "0911000007",
        age: 51,
        gender: "male" as const,
        householdSize: 6,
        needTypes: ["luong_thuc", "sac_dien"],
        daysWithoutAid: 2,
        waterDepthEstimate: "0,4m",
      },
      {
        fullname: "Phạm Thị Mỹ",
        phone: "0911000008",
        age: 47,
        gender: "female" as const,
        householdSize: 6,
        needTypes: ["luong_thuc", "nuoc"],
        waterDepthEstimate: "0,4m",
      },
    ],
  },
  {
    address: "Xóm Cồn Tàu, xã Triệu Độ, Quảng Trị",
    lat: 16.7944,
    lng: 107.0386,
    emergencyLevel: "critical" as const,
    routeConfidence: "dangerous" as const,
    preferredTransportMode: "boat" as const,
    summary: "Có người khuyết tật và trẻ nhỏ, cần sơ tán gấp trước khi triều dâng.",
    note: "Dòng chảy mạnh, chỉ nên dùng xuồng máy có lái kinh nghiệm.",
    victims: [
      {
        fullname: "Hồ Văn Thuận",
        phone: "0911000009",
        age: 38,
        gender: "male" as const,
        householdSize: 4,
        hasChildren: true,
        hasDisability: true,
        needTypes: ["so_tan", "ao_phao", "thuoc"],
        needsMedical: true,
        waterDepthEstimate: "2,1m",
        boatAccessible: true,
      },
      {
        fullname: "Hồ Thị Lan",
        phone: "0911000010",
        age: 9,
        gender: "female" as const,
        householdSize: 4,
        hasChildren: true,
        needTypes: ["so_tan", "nuoc"],
        waterDepthEstimate: "2,1m",
        boatAccessible: true,
      },
    ],
  },
  {
    address: "Khu phố 3, phường 5, thành phố Cà Mau",
    lat: 9.1766,
    lng: 105.1524,
    emergencyLevel: "medium" as const,
    routeConfidence: "high" as const,
    preferredTransportMode: "road" as const,
    summary: "Hộ dân cần nước sạch và chăn màn sau khi ngập kéo dài hai ngày.",
    note: "Xe tải 1,5 tấn vào được vào ban ngày.",
    victims: [
      {
        fullname: "Ngô Kim Oanh",
        phone: "0911000011",
        age: 35,
        gender: "female" as const,
        householdSize: 5,
        needTypes: ["nuoc", "ve_sinh", "lien_lac"],
        daysWithoutAid: 2,
      },
      {
        fullname: "Ngô Quốc Nam",
        phone: "0911000012",
        age: 63,
        gender: "male" as const,
        householdSize: 5,
        hasElderly: true,
        needTypes: ["nuoc", "luong_thuc"],
      },
    ],
  },
  {
    address: "Ấp Đông Thuận, huyện Cái Bè, Tiền Giang",
    lat: 10.3698,
    lng: 106.0863,
    emergencyLevel: "high" as const,
    routeConfidence: "low" as const,
    preferredTransportMode: "drone" as const,
    summary: "Cần chuyển thuốc insulin khẩn cho bệnh nhân tiểu đường.",
    note: "Đường bộ bị đứt đoạn tạm thời, xuồng lớn khó tiếp cận.",
    victims: [
      {
        fullname: "Đoàn Văn Lộc",
        phone: "0911000013",
        age: 58,
        gender: "male" as const,
        householdSize: 2,
        needsMedical: true,
        needTypes: ["thuoc", "nuoc"],
        medicineList: ["Insulin", "Kim tiêm"],
        waterDepthEstimate: "0,9m",
      },
    ],
  },
  {
    address: "Phường Tân Lập, thành phố Buôn Ma Thuột, Đắk Lắk",
    lat: 12.6797,
    lng: 108.0483,
    emergencyLevel: "medium" as const,
    routeConfidence: "medium" as const,
    preferredTransportMode: "road" as const,
    summary: "Khu dân cư cần tiếp tế thực phẩm khô và nước uống đóng chai.",
    note: "Mực nước rút chậm, xe bán tải có thể vào theo từng đợt.",
    victims: [
      {
        fullname: "Võ Thị Mai",
        phone: "0911000014",
        age: 44,
        gender: "female" as const,
        householdSize: 7,
        hasChildren: true,
        needTypes: ["luong_thuc", "nuoc"],
      },
      {
        fullname: "Võ Minh Trí",
        phone: "0911000015",
        age: 16,
        gender: "male" as const,
        householdSize: 7,
        hasChildren: true,
        needTypes: ["luong_thuc", "nuoc"],
      },
    ],
  },
  {
    address: "Thôn Phú Mỹ, xã Phước Đồng, Khánh Hòa",
    lat: 12.2125,
    lng: 109.2267,
    emergencyLevel: "high" as const,
    routeConfidence: "medium" as const,
    preferredTransportMode: "hand_off" as const,
    summary: "Cần sơ tán người già khỏi vùng sạt lở ven suối.",
    note: "Xe tải dừng ở sân trường, đoạn cuối bộ đội cõng bộ.",
    victims: [
      {
        fullname: "Lâm Thị Cúc",
        phone: "0911000016",
        age: 71,
        gender: "female" as const,
        householdSize: 2,
        hasElderly: true,
        needTypes: ["so_tan", "thuoc", "ao_phao"],
        needsMedical: true,
      },
    ],
  },
  {
    address: "Khu dân cư An Bình, Ninh Kiều, Cần Thơ",
    lat: 10.0314,
    lng: 105.7736,
    emergencyLevel: "medium" as const,
    routeConfidence: "high" as const,
    preferredTransportMode: "hand_off" as const,
    summary: "Cần tiếp tế nước sạch cho nhóm trọ công nhân bị cô lập cục bộ.",
    note: "Sẽ quy đổi sang hand_off ở heuristics vì phương tiện cuối là xe máy.",
    victims: [
      {
        fullname: "Phan Tuấn Anh",
        phone: "0911000017",
        age: 24,
        gender: "male" as const,
        householdSize: 8,
        needTypes: ["nuoc", "luong_thuc", "sac_dien"],
      },
      {
        fullname: "Nguyễn Hồng Phúc",
        phone: "0911000018",
        age: 23,
        gender: "male" as const,
        householdSize: 8,
        needTypes: ["nuoc", "luong_thuc"],
      },
    ],
  },
  {
    address: "Tuyến dân cư vượt lũ Long Thuận, Đồng Tháp",
    lat: 10.4789,
    lng: 105.6351,
    emergencyLevel: "high" as const,
    routeConfidence: "high" as const,
    preferredTransportMode: "boat" as const,
    summary: "Điểm tập trung nhiều hộ xin áo phao và lương khô trước khi nước lên.",
    note: "Có bến xuồng tạm ở đầu tuyến dân cư.",
    victims: [
      {
        fullname: "Trương Thị Kiều",
        phone: "0911000019",
        age: 37,
        gender: "female" as const,
        householdSize: 6,
        hasChildren: true,
        needTypes: ["ao_phao", "luong_thuc", "nuoc"],
      },
      {
        fullname: "Trương Minh Nhựt",
        phone: "0911000020",
        age: 8,
        gender: "male" as const,
        householdSize: 6,
        hasChildren: true,
        needTypes: ["ao_phao", "sua_em_be"],
      },
    ],
  },
  {
    address: "Xã Phước Sơn, Tuy Phước, Bình Định",
    lat: 13.8049,
    lng: 109.1378,
    emergencyLevel: "critical" as const,
    routeConfidence: "low" as const,
    preferredTransportMode: "boat" as const,
    summary: "Một cụ ông đang sốt cao, gia đình cần sơ tán và hỗ trợ y tế gấp.",
    note: "Đường bê tông ngập xiết, phải dùng xuồng máy rồi bàn giao xe cứu thương.",
    victims: [
      {
        fullname: "Đinh Văn Nhân",
        phone: "0911000021",
        age: 74,
        gender: "male" as const,
        householdSize: 3,
        hasElderly: true,
        needsMedical: true,
        needTypes: ["so_tan", "thuoc", "nuoc"],
        medicineList: ["Hạ sốt", "Kháng sinh"],
        waterDepthEstimate: "1,4m",
        boatAccessible: true,
      },
      {
        fullname: "Đinh Thị Thương",
        phone: "0911000022",
        age: 45,
        gender: "female" as const,
        householdSize: 3,
        needTypes: ["nuoc", "luong_thuc"],
        waterDepthEstimate: "1,4m",
        boatAccessible: true,
      },
    ],
  },
];

const markersSeed = [
  {
    name: "Vùng ngập sâu Hải Chánh",
    type: "area" as const,
    markType: "flood_area" as const,
    lat: 16.7582,
    lng: 107.1184,
    color: "#0ea5e9",
    fillOpacity: 0.28,
    isClosedPath: true,
    paths: [
      [107.114, 16.756],
      [107.123, 16.756],
      [107.124, 16.761],
      [107.115, 16.762],
    ] as Array<[number, number]>,
    note: "Chỉ tiếp cận bằng xuồng máy.",
  },
  {
    name: "Đường bị chặn Nam Phước",
    type: "mark" as const,
    markType: "blocked_road" as const,
    lat: 15.7758,
    lng: 108.1265,
    color: "#f97316",
    note: "Xe tải không qua được do sụt lề.",
  },
  {
    name: "Nước chảy xiết Triệu Độ",
    type: "mark" as const,
    markType: "strong_current" as const,
    lat: 16.7956,
    lng: 107.0371,
    color: "#ef4444",
    note: "Không cho xuồng chèo tay đi vào.",
  },
  {
    name: "Điểm tập kết phường 5 Cà Mau",
    type: "mark" as const,
    markType: "safe_pickup" as const,
    lat: 9.1778,
    lng: 105.151,
    color: "#22c55e",
    note: "Tập kết hàng khô và nước uống.",
  },
  {
    name: "Điểm y tế lưu động Bình Định",
    type: "mark" as const,
    markType: "medical_point" as const,
    lat: 13.8061,
    lng: 109.1394,
    color: "#dc2626",
    note: "Có 1 bác sĩ và 2 điều dưỡng trực.",
  },
  {
    name: "Điểm trú ẩn trường tiểu học Long Thuận",
    type: "mark" as const,
    markType: "shelter" as const,
    lat: 10.4802,
    lng: 105.6335,
    color: "#14b8a6",
    note: "Sức chứa khoảng 80 người.",
  },
  {
    name: "Tuyến xuồng tiếp cận Phú Mỹ",
    type: "route" as const,
    markType: "safe_pickup" as const,
    lat: 12.2125,
    lng: 109.2267,
    color: "#38bdf8",
    fillOpacity: 0.85,
    isClosedPath: false,
    paths: [
      [109.2251, 12.2102],
      [109.2261, 12.2111],
      [109.2272, 12.2121],
      [109.2287, 12.2134],
    ] as Array<[number, number]>,
    note: "Đường thủy khuyến nghị trong 6 giờ tới.",
  },
  {
    name: "Nguy cơ rò điện Hòa Hiệp Nam",
    type: "mark" as const,
    markType: "electric_hazard" as const,
    lat: 16.1263,
    lng: 108.1486,
    color: "#facc15",
    note: "Điện lực đang cô lập khu vực.",
  },
];

const labelsSeed = [
  {
    name: "Điểm cần sơ tán",
    color: "#ef4444",
    icon: "lifebuoy",
    description: "Ưu tiên rút người khỏi khu vực nguy hiểm ngay.",
  },
  {
    name: "Điểm tiếp tế",
    color: "#0ea5e9",
    icon: "package",
    description: "Ưu tiên giao nước, lương thực và vật tư thiết yếu.",
  },
  {
    name: "Điểm y tế",
    color: "#dc2626",
    icon: "cross",
    description: "Có nhu cầu hỗ trợ thuốc men hoặc sơ cứu khẩn cấp.",
  },
];

const rescuerSeed = [
  ["Nguyễn Văn Tâm", "0912000001", "boat_operator", "available", "senior", "Quảng Trị"],
  ["Lê Hoàng Minh", "0912000002", "driver", "available", "intermediate", "Đà Nẵng"],
  ["Phạm Thảo Nhi", "0912000003", "medic", "available", "senior", "Quảng Nam"],
  ["Đỗ Công Hậu", "0912000004", "logistics", "available", "lead", "Cần Thơ"],
  ["Trần Khánh Linh", "0912000005", "coordinator", "available", "lead", "Đồng Tháp"],
  ["Hồ Quốc Việt", "0912000006", "diver", "available", "intermediate", "Khánh Hòa"],
  ["Ngô Phương Anh", "0912000007", "volunteer", "off_duty", "junior", "Cà Mau"],
  ["Mai Thanh Sơn", "0912000008", "boat_operator", "available", "intermediate", "Bình Định"],
] as const;

const vehicleSeed = [
  ["Xuồng máy ST-01", "boat", 8, "available", "Bến Hải Chánh", 85],
  ["Xuồng composite CT-02", "boat", 6, "on_mission", "Bến Long Thuận", 70],
  ["Xe tải cứu trợ 2.5T", "truck", 1200, "available", "Kho Nam Phước", 92],
  ["Xe cứu thương HL-115", "ambulance", 3, "available", "Bệnh viện dã chiến Bình Định", 88],
  ["Xe máy trung chuyển AN-09", "motorbike", 2, "available", "Phường Hòa Hiệp Nam", 64],
  ["Drone thả hàng DR-03", "drone", 15, "maintenance", "Điểm tập kết Cà Mau", 100],
] as const;

const transcript = (lines: Array<[string, string]>) =>
  lines.map(([role, message], index) => ({
    role,
    message,
    timeInCallSecs: index * 18,
  }));

async function clearData() {
  await db.delete(tables.routeReport);
  await db.delete(tables.conversation);
  await db.delete(tables.rescuePlanVehicle);
  await db.delete(tables.rescuePlanRescuer);
  await db.delete(tables.rescuePlanLocation);
  await db.delete(tables.rescuePlan);
  await db.delete(tables.victimTag);
  await db.delete(tables.victim);
  await db.delete(tables.marker);
  await db.delete(tables.location);
  await db.delete(tables.vehicle);
  await db.delete(tables.rescuer);
  await db.delete(tables.label);
}

async function seed() {
  await clearData();

  const labels = await db.insert(tables.label).values(labelsSeed).returning();

  const rescuers = await db
    .insert(tables.rescuer)
    .values(
      rescuerSeed.map(([fullName, phone, role, status, experienceLevel, region], index) => ({
        fullName,
        phone,
        role,
        status,
        experienceLevel,
        region,
        certifications:
          role === "medic"
            ? ["Sơ cấp cứu", "Phân luồng y tế"]
            : role === "boat_operator"
              ? ["Lái xuồng máy", "An toàn đường thủy"]
              : ["Điều phối hiện trường"],
        note: `Tổ phản ứng nhanh số ${index + 1}.`,
        avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(fullName)}`,
      })),
    )
    .returning();

  const vehicles = await db
    .insert(tables.vehicle)
    .values(
      vehicleSeed.map(([name, vehicleType, capacity, status, baseLocation, fuelLevel]) => ({
        name,
        vehicleType,
        capacity,
        status,
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
      })),
    )
    .returning();

  const insertedLocations = [] as Array<{
    id: string;
    address: string | null;
  }>;

  const victimRecords = [] as Array<{ id: string; locationId: string }>;

  for (const [index, seedLocation] of locationSeeds.entries()) {
    const [createdLocation] = await db
      .insert(tables.location)
      .values({
        summary: seedLocation.summary,
        note: seedLocation.note,
        lat: seedLocation.lat,
        lng: seedLocation.lng,
        address: seedLocation.address,
        emergencyLevel: seedLocation.emergencyLevel,
        routeConfidence: seedLocation.routeConfidence,
        preferredTransportMode:
          seedLocation.preferredTransportMode === "motorbike"
            ? "hand_off"
            : seedLocation.preferredTransportMode,
        source: index % 3 === 0 ? "call" : index % 3 === 1 ? "chat" : "manual",
        status:
          seedLocation.emergencyLevel === "critical" ? "active" : "in_progress",
        labelId:
          seedLocation.emergencyLevel === "critical"
            ? labels[0]?.id
            : seedLocation.summary.includes("thuốc") || seedLocation.summary.includes("y tế")
              ? labels[2]?.id
              : labels[1]?.id,
        lastVerifiedAt: new Date(Date.now() - index * 3_600_000),
        tags: seedLocation.victims.flatMap(v => v.needTypes ?? []).slice(0, 3),
      })
      .returning();

    insertedLocations.push({ id: createdLocation.id, address: createdLocation.address });

    const createdVictims = await db
      .insert(tables.victim)
      .values(
        seedLocation.victims.map(victim => ({
          ...victim,
          note:
            victim.needsMedical
              ? "Cần nhân viên y tế kiểm tra ngay khi tiếp cận."
              : "Đã xác minh qua hotline hoặc tình nguyện viên địa bàn.",
          addressText: seedLocation.address,
          locationId: createdLocation.id,
          daysWithoutAid: victim.daysWithoutAid ?? (seedLocation.emergencyLevel === "critical" ? 2 : 1),
        })),
      )
      .returning();

    victimRecords.push(
      ...createdVictims.map(victim => ({ id: victim.id, locationId: createdLocation.id })),
    );
  }

  await db.insert(tables.victimTag).values(
    victimRecords.slice(0, 12).flatMap((victimRecord, index) => [
      {
        victimId: victimRecord.id,
        name: index % 3 === 0 ? "Cần sơ tán" : "Đã xác minh",
        color: index % 3 === 0 ? "#ef4444" : "#0ea5e9",
        icon: index % 3 === 0 ? "lifebuoy" : "badge-check",
        description:
          index % 3 === 0
            ? "Ưu tiên rút người khỏi vùng ngập sâu."
            : "Thông tin đã được xác minh trong 6 giờ gần nhất.",
      },
    ]),
  );

  const markers = await db.insert(tables.marker).values(markersSeed).returning();

  const conversations = await db
    .insert(tables.conversation)
    .values(
      victimRecords.slice(0, 6).map((victimRecord, index) => ({
        providerConversationId: `hl2026-conv-${String(index + 1).padStart(3, "0")}`,
        channel: index % 2 === 0 ? "call" : "chat",
        agentName: index % 2 === 0 ? "HumanLogs Voice Agent" : "HumanLogs Chat Agent",
        status: "done",
        startedAt: new Date(Date.now() - (index + 2) * 3_600_000),
        durationSeconds: 145 + index * 32,
        messageCount: 8 + index * 2,
        phoneNumber: `09110000${String(index + 1).padStart(2, "0")}`,
        summary:
          index % 2 === 0
            ? "Hộ dân báo thiếu nước sạch và đề nghị hỗ trợ sơ tán."
            : "Người dân đã cung cấp địa chỉ, nhu cầu thiết yếu và tình trạng y tế.",
        dataCollectionResults: {
          emergency_level: index % 3 === 0 ? "critical" : "high",
          need_types: ["nuoc", "luong_thuc", index % 2 === 0 ? "so_tan" : "thuoc"],
          household_size: 4 + index,
          boat_accessible: index % 2 === 0,
        },
        transcript: transcript([
          ["user", "Nhà tôi ngập sâu, đang thiếu nước uống."],
          ["ai", "Cho tôi xin địa chỉ và số người trong nhà."],
          ["user", "Có 4 người, một người lớn tuổi cần thuốc."],
          ["ai", "Tôi đã ghi nhận, đội điều phối sẽ xử lý ưu tiên."],
        ]),
        rawPayload: {
          source: "seed",
          scenario: "post-call-webhook",
        },
        victimId: victimRecord.id,
        locationId: victimRecord.locationId,
      })),
    )
    .returning();

  for (const [index, conversation] of conversations.entries()) {
    const victim = victimRecords[index];
    await db
      .update(tables.victim)
      .set({ conversations: [conversation.providerConversationId] })
      .where(eq(tables.victim.id, victim.id));
  }

  await db.insert(tables.routeReport).values([
    {
      locationId: insertedLocations[0]?.id,
      markerId: markers[0]?.id,
      reporterId: rescuers[0]?.id,
      transportMode: "boat",
      confidence: "dangerous",
      isPassable: false,
      waterDepthText: "Nước xoáy mạnh, sâu hơn 1,8m",
      currentStrengthText: "Chảy xiết theo hướng nam",
      note: "Không nên cho xuồng chèo tay tiếp cận.",
      path: [
        [107.114, 16.756],
        [107.119, 16.758],
      ],
    },
    {
      locationId: insertedLocations[1]?.id,
      reporterId: rescuers[1]?.id,
      transportMode: "ambulance",
      confidence: "medium",
      isPassable: true,
      waterDepthText: "Ngập bánh xe, đi chậm",
      currentStrengthText: "Ổn định",
      note: "Đoạn cuối cần đi bộ khoảng 80m.",
    },
    {
      locationId: insertedLocations[6]?.id,
      reporterId: rescuers[2]?.id,
      transportMode: "drone",
      confidence: "high",
      isPassable: true,
      note: "Có thể thả thuốc tại mái tôn phía trước nhà.",
    },
    {
      markerId: markers[6]?.id,
      reporterId: rescuers[5]?.id,
      transportMode: "boat",
      confidence: "high",
      isPassable: true,
      note: "Tuyến xuồng còn an toàn trong khung giờ sáng.",
      path: markers[6]?.paths as Array<[number, number]>,
    },
    {
      locationId: insertedLocations[10]?.id,
      reporterId: rescuers[7]?.id,
      transportMode: "boat",
      confidence: "medium",
      isPassable: true,
      waterDepthText: "1,1m",
      note: "Tiếp cận được nhưng cần áo phao cho trẻ nhỏ.",
    },
    {
      locationId: insertedLocations[11]?.id,
      reporterId: rescuers[3]?.id,
      transportMode: "hand_off",
      confidence: "low",
      isPassable: true,
      note: "Cần bàn giao xe cứu thương ở đầu đường liên xã.",
    },
  ]);

  const plans = await db
    .insert(tables.rescuePlan)
    .values([
      {
        title: "Chiến dịch sơ tán Triệu Độ - Hải Chánh",
        description:
          "## Tình huống\nNhiều hộ mắc kẹt tại vùng nước chảy xiết.\n\n## Mục tiêu\nSơ tán người già, trẻ nhỏ và chuyển thuốc khẩn cấp.\n\n## Hành động\nTiếp cận bằng xuồng máy, chia 2 mũi vào nhà dân.\n\n## Rủi ro\nDòng chảy mạnh và vật cản nổi.",
        status: "active",
        priority: "critical",
      },
      {
        title: "Tiếp tế nước sạch cụm Hậu Giang",
        description:
          "## Tình huống\nKhu vực dân cư ngập kéo dài, thiếu nước sạch và sữa em bé.\n\n## Mục tiêu\nPhát nước uống, sữa và lương thực khô trong ngày.\n\n## Phương án tiếp cận\nXuồng composite kết hợp bốc xếp nhanh tại bến tạm.",
        status: "draft",
        priority: "high",
      },
      {
        title: "Hành lang y tế Bình Định",
        description:
          "## Tình huống\nCó ca sốt cao cần sơ tán khẩn.\n\n## Mục tiêu\nĐưa bệnh nhân ra điểm bàn giao xe cứu thương an toàn.\n\n## Nhân lực & phương tiện\n1 y tế, 1 lái xuồng, 1 điều phối.",
        status: "active",
        priority: "critical",
      },
      {
        title: "Khảo sát và xác minh Nam Phước",
        description:
          "## Tình huống\nThông tin chia cắt giao thông còn chưa đồng nhất.\n\n## Mục tiêu\nXác minh luồng tiếp cận và cập nhật báo cáo tuyến đường.\n\n## Hành động\nKhảo sát bằng xe máy và bộ hành.",
        status: "completed",
        priority: "medium",
      },
    ])
    .returning();

  await db.insert(tables.rescuePlanLocation).values([
    { planId: plans[0]!.id, locationId: insertedLocations[0]!.id },
    { planId: plans[0]!.id, locationId: insertedLocations[4]!.id },
    { planId: plans[1]!.id, locationId: insertedLocations[2]!.id },
    { planId: plans[1]!.id, locationId: insertedLocations[10]!.id },
    { planId: plans[2]!.id, locationId: insertedLocations[11]!.id },
    { planId: plans[3]!.id, locationId: insertedLocations[3]!.id },
  ]);

  await db.insert(tables.rescuePlanRescuer).values([
    { planId: plans[0]!.id, rescuerId: rescuers[0]!.id },
    { planId: plans[0]!.id, rescuerId: rescuers[2]!.id },
    { planId: plans[1]!.id, rescuerId: rescuers[3]!.id },
    { planId: plans[1]!.id, rescuerId: rescuers[4]!.id },
    { planId: plans[2]!.id, rescuerId: rescuers[2]!.id },
    { planId: plans[2]!.id, rescuerId: rescuers[7]!.id },
    { planId: plans[3]!.id, rescuerId: rescuers[1]!.id },
  ]);

  await db.insert(tables.rescuePlanVehicle).values([
    { planId: plans[0]!.id, vehicleId: vehicles[0]!.id },
    { planId: plans[1]!.id, vehicleId: vehicles[1]!.id },
    { planId: plans[1]!.id, vehicleId: vehicles[2]!.id },
    { planId: plans[2]!.id, vehicleId: vehicles[3]!.id },
    { planId: plans[3]!.id, vehicleId: vehicles[4]!.id },
  ]);

  await db
    .update(tables.rescuer)
    .set({ status: "on_mission" })
    .where(
      inArray(tables.rescuer.id, [
        rescuers[0]!.id,
        rescuers[2]!.id,
        rescuers[7]!.id,
      ]),
    );

  await db
    .update(tables.vehicle)
    .set({ status: "on_mission" })
    .where(inArray(tables.vehicle.id, [vehicles[0]!.id, vehicles[3]!.id]));

  await db
    .update(tables.location)
    .set({ status: "safe", isResolved: true })
    .where(eq(tables.location.id, insertedLocations[3]!.id));

  console.log("Seeded HumanLogs2026 demo data");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
