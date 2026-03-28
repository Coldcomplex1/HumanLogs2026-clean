import { Vehicle } from "../schemas/vehicle.schema";

export const vehicles: Omit<Vehicle, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Thuyền Cứu Hộ Số 1",
    image:
      "https://tanviendong.net/watermark/product/1200x550x1/upload/product/wwwtanviendongnet-7-4979.png",
    note: "Thuyền chuyên dụng cứu trợ bão lũ tại đồng bằng sông Cửu Long.",
  },
  {
    name: "Thuyền Cao Tốc Delta",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-GDh_ij34SnLn3KVvwF2zaFT3UmFHPGw0Pg&s",
    note: "Thuyền cao tốc cho nhiệm vụ di chuyển nhanh trong vùng ngập sâu.",
  },
  {
    name: "Drone Trinh Sát StormEye",
    image:
      "https://image.sggp.org.vn/w1000/Uploaded/2026/bhgkqzbtgazs/2025_07_04/0d629ab33ee488bad1f5-5386-4709jpg-1970-8549.jpg",
    note: "Drone phục vụ giám sát, truyền hình ảnh và tìm kiếm người bị nạn trong vùng lũ.",
  },
  {
    name: "Xe Tải Cứu Hộ Titan",
    image:
      "https://cdn.machineseeker.com/data/listing/img/vga/ms/30/03/18039606-02.jpg?v=1765459825",
    note: "Xe tải chuyên dụng cứu trợ người bị nạn trong vùng lũ.",
  },
  {
    name: "Xe Cứu Thương Hồng Thập Tự",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz5X3U2vVd2wF3TjK7L-vy3qG2yYJ6s8S0cg&s",
    note: "Xe cứu thương đầy đủ thiết bị y tế, phục vụ sơ cứu và vận chuyển nạn nhân.",
  },
  {
    name: "Xuồng Cao Su Cứu Hộ",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc3LpK5F6O8uF3_qz2k5R1xMh4L5aK-Q&s",
    note: "Xuồng cao su nhẹ, dễ triển khai nhanh trong khu vực ngập nông đến trung bình.",
  },
  {
    name: "Xe Bán Tải 4x4 Ranger",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7vK2F8h5s2u9L5p8T3jNk4fMqX0dY6e2cBQ&s",
    note: "Xe bán tải 4 bánh chủ động, vượt địa hình xấu, chở hàng cứu trợ.",
  },
  {
    name: "Máy Phát Điện Di Động 5kW",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1kF4q8D2v3h5H6gK9xI2yA7uL3pW4eN5dZQ&s",
    note: "Máy phát điện di động, cung cấp điện cho thiết bị y tế và chiếu sáng tại hiện trường.",
  },
  {
    name: "Xe PCCC Mini",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1uH7kN3_8j5Y6mD2rE4wQ0xI9vA3nL7sC&s",
    note: "Xe chữa cháy cỡ nhỏ, phù hợp di chuyển trong hẻm nhỏ và khu dân cư chật hẹp.",
  },
  {
    name: "Ca Nô Cứu Hộ Biển",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2xV4nY8zK1hJ9dG5fC7wU3tI6oP0rE8sM&s",
    note: "Ca nô cứu hộ tốc độ cao, phù hợp hoạt động trên sông lớn và vùng biển ven bờ.",
  },
  {
    name: "Máy Cắt Thủy Lực Cứu Hộ",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvA1bN8mK3jL2dF5hG7iO0pQ4rT6wU9xY&s",
    note: "Thiết bị cắt thủy lực chuyên dụng, dùng để giải cứu nạn nhân bị kẹt trong đống đổ nát.",
  },
];
