import { useCallback, useRef, useState } from "react";

interface FileWithPreview {
  id: string;
  file: File;
  preview: string | null;
}

interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

type UseFileUploadReturn = [
  { files: FileWithPreview[]; isDragging: boolean; errors: string[] },
  {
    handleDragEnter: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    openFileDialog: () => void;
    removeFile: (id: string) => void;
    getInputProps: () => React.InputHTMLAttributes<HTMLInputElement> & {
      ref: React.RefObject<HTMLInputElement | null>;
    };
  },
];

let fileId = 0;

function createFileEntry(file: File): FileWithPreview {
  const id = `file-${++fileId}`;
  const preview = file.type.startsWith("image/")
    ? URL.createObjectURL(file)
    : null;
  return { id, file, preview };
}

function matchesAccept(file: File, accept: string): boolean {
  const types = accept.split(",").map(t => t.trim());
  return types.some(type => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.replace("/*", "/"));
    }
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type === type;
  });
}

export function useFileUpload(
  options: UseFileUploadOptions = {},
): UseFileUploadReturn {
  const { accept, maxSize, multiple = false } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  const validate = useCallback(
    (fileList: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errs: string[] = [];

      for (const file of fileList) {
        if (accept && !matchesAccept(file, accept)) {
          errs.push(`"${file.name}" is not an accepted file type.`);
          continue;
        }
        if (maxSize && file.size > maxSize) {
          const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
          errs.push(`"${file.name}" exceeds the ${sizeMB}MB size limit.`);
          continue;
        }
        valid.push(file);
      }

      return { valid, errors: errs };
    },
    [accept, maxSize],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      const { valid, errors: validationErrors } = validate(incoming);
      setErrors(validationErrors);

      if (valid.length === 0) return;

      const entries = valid.map(createFileEntry);

      setFiles(prev => {
        if (!multiple) {
          for (const f of prev) {
            if (f.preview) URL.revokeObjectURL(f.preview);
          }
          return [entries[0]];
        }
        return [...prev, ...entries];
      });
    },
    [validate, multiple],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
    setErrors([]);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length > 0) {
        addFiles(selected);
      }
      e.target.value = "";
    },
    [addFiles],
  );

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file" as const,
      accept,
      multiple,
      onChange: handleInputChange,
    }),
    [accept, multiple, handleInputChange],
  );

  return [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ];
}
