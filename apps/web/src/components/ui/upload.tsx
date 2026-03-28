import { AlertCircleIcon, ImageUpIcon, Loader2, XIcon } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { uploadImage } from "@/lib/cloudinary";
import { useEffect, useRef, useState } from "react";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  folder?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  folder = "humanlogs2026/vehicles",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop: originalHandleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({ accept: "image/*", maxSize });

  const uploadedIdRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const entry = files[0];
    if (!entry?.file || entry.id === uploadedIdRef.current) return;
    uploadedIdRef.current = entry.id;

    let cancelled = false;
    setUploading(true);
    setUploadError(null);

    uploadImage(entry.file, folder)
      .then(url => {
        if (!cancelled) onChangeRef.current?.(url);
      })
      .catch(err => {
        if (!cancelled)
          setUploadError(err instanceof Error ? err.message : "Tải ảnh thất bại");
      })
      .finally(() => {
        if (!cancelled) setUploading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [files, folder]);

  const previewUrl = files[0]?.preview || value || null;

  const handleRemove = () => {
    if (files[0]) removeFile(files[0].id);
    onChange?.(undefined);
    setUploadError(null);
  };

  const allErrors = [...errors, ...(uploadError ? [uploadError] : [])];

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative">
        <div
          className="relative flex min-h-36 flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-[img]:border-none has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          data-dragging={isDragging || undefined}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={originalHandleDrop}
          role="button"
          tabIndex={-1}
        >
          <input
            {...getInputProps()}
            aria-label="Upload image"
            className="sr-only"
          />
          {previewUrl ? (
            <div className="absolute inset-0 ">
              <img
                alt="Uploaded image"
                className="size-full object-scale-down"
                src={previewUrl}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="size-6 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              {uploading ? (
                <Loader2 className="mb-2 size-6 animate-spin text-muted-foreground" />
              ) : (
                <div
                  aria-hidden="true"
                  className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                >
                  <ImageUpIcon className="size-4 opacity-60" />
                </div>
              )}
              <p className="mb-1.5 font-medium text-sm">
                {uploading
                  ? "Đang tải lên..."
                  : "Kéo thả ảnh hoặc nhấn để chọn"}
              </p>
              <p className="text-muted-foreground text-xs">
                Tối đa: {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
        {previewUrl && !uploading && (
          <div className="absolute top-2 right-2">
            <button
              aria-label="Remove image"
              className="z-50 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={e => {
                e.stopPropagation();
                handleRemove();
              }}
              type="button"
            >
              <XIcon aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {allErrors.length > 0 && (
        <div
          className="flex items-center gap-1 text-destructive text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{allErrors[0]}</span>
        </div>
      )}
    </div>
  );
}
