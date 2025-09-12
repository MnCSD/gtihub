"use client";

import { useCallback, useRef, useState } from "react";

type UploadAreaProps = {
  onFilesSelected?: (files: File[]) => void;
};

export default function UploadArea({ onFilesSelected }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleChoose = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const next = Array.from(list);
      setFiles(next);
      onFilesSelected?.(next);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer?.files ?? null);
    },
    [handleFiles]
  );

  const onDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex flex-col items-center justify-center rounded-md border border-white/20 bg-[#0b0f14] text-white/80 h-60 w-full transition-colors ${
          isDragging ? "bg-white/5 border-white/40" : ""
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full border border-white/20 p-3">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden
              className="text-white/70"
            >
              <path
                fill="currentColor"
                d="M19 15v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4h2v4h10v-4h2ZM12 3l5 5h-3v6h-4V8H7l5-5Z"
              />
            </svg>
          </div>
          <div className="text-lg font-medium text-white">
            Drag files here to add them to your repository
          </div>
          <button
            type="button"
            onClick={handleChoose}
            className="text-[#58a6ff] hover:underline"
          >
            Or choose your files
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="border border-white/20 rounded-md overflow-hidden">
          <div className="px-4 py-2 text-sm text-white/70 bg-white/5">
            Selected files
          </div>
          <ul className="max-h-40 overflow-auto divide-y divide-white/10">
            {files.map((f) => (
              <li key={f.name} className="px-4 py-2 text-sm text-white/90">
                {f.name}
                <span className="text-white/50"> · {(f.size / 1024).toFixed(1)} KB</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

