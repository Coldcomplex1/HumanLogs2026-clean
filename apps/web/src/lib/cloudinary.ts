import { env } from "@/env";

const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(
  file: File,
  folder = "humanlogs2026",
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Chưa cấu hình Cloudinary. Bạn có thể nhập URL ảnh thủ công thay thế.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Tải ảnh lên thất bại");
  }

  const data = await response.json();
  return data.secure_url as string;
}

export const uploadAvatar = (file: File) =>
  uploadImage(file, "humanlogs2026/rescuers");
