"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import { UploadCloud, File as FileIcon, Trash2, Loader, CheckCircle, AlertCircle } from "lucide-react";

interface FileWithProgress {
  id: string;
  name: string;
  size: number;
  type: string;
  preview: string | null;
  progress: number;
  status: "uploading" | "done" | "error";
  errorMsg?: string;
  file: File;
}

interface FileUploadProps {
  eventId: string;
  onUploaded?: () => void;
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function FileUpload({ eventId, onUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startUpload = async (entry: FileWithProgress) => {
    // Animate progress to ~80% while waiting for server
    let fakeProgress = 0;
    const tick = setInterval(() => {
      fakeProgress += Math.random() * 12;
      if (fakeProgress >= 80) { clearInterval(tick); fakeProgress = 80; }
      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, progress: Math.min(fakeProgress, 80) } : f));
    }, 200);

    try {
      const fd = new FormData();
      fd.append("file", entry.file);
      fd.append("eventId", eventId);

      const res = await fetch("/api/files/upload", { method: "POST", body: fd });
      clearInterval(tick);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Upload failed");
      }

      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, progress: 100, status: "done" } : f));
      if (navigator.vibrate) navigator.vibrate(80);
      onUploaded?.();
    } catch (err) {
      clearInterval(tick);
      setFiles((prev) => prev.map((f) =>
        f.id === entry.id ? { ...f, progress: 0, status: "error", errorMsg: String(err) } : f
      ));
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newEntries: FileWithProgress[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/") || file.type.startsWith("video/")
        ? URL.createObjectURL(file)
        : null,
      progress: 0,
      status: "uploading",
      file,
    }));
    setFiles((prev) => [...prev, ...newEntries]);
    newEntries.forEach(startUpload);
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onSelect = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(e.target.files); };

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Drop zone */}
      <motion.div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        initial={false}
        animate={{ borderColor: isDragging ? "#6d4ed8" : "hsl(var(--border))", scale: isDragging ? 1.01 : 1 }}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.15 }}
        className={clsx(
          "relative rounded-xl p-8 text-center cursor-pointer border-2 border-dashed bg-surface hover:bg-hover transition-colors",
          isDragging && "ring-2 ring-primary/30 border-primary"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ y: isDragging ? [-4, 0, -4] : 0 }}
            transition={{ duration: 1.2, repeat: isDragging ? Infinity : 0, ease: "easeInOut" }}
          >
            <UploadCloud className={clsx("w-10 h-10", isDragging ? "text-primary" : "text-text-3")} />
          </motion.div>
          <div>
            <p className="text-[13.5px] font-medium text-foreground">
              {isDragging ? "Drop to upload" : files.length ? "Add more files" : "Upload files"}
            </p>
            <p className="text-[12px] text-text-3 mt-0.5">
              {isDragging
                ? <span className="text-primary font-medium">Release to upload</span>
                : <>Drag & drop or <span className="text-primary font-medium">browse</span></>
              }
            </p>
            <p className="text-[11px] text-text-4 mt-1">PDF, images, documents, videos · max 50 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={onSelect}
            accept="image/*,application/pdf,video/*,audio/*,text/*,application/zip,.doc,.docx,.xls,.xlsx"
          />
        </div>
      </motion.div>

      {/* File list */}
      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft"
          >
            {/* Thumbnail / icon */}
            <div className="relative flex-shrink-0 mt-0.5">
              {file.preview && file.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote/optimizable image
                <img src={file.preview} alt={file.name} className="w-12 h-12 rounded-lg object-cover border border-border" />
              ) : file.preview && file.type.startsWith("video/") ? (
                <video src={file.preview} className="w-12 h-12 rounded-lg object-cover border border-border" muted playsInline preload="metadata" />
              ) : (
                <div className="w-12 h-12 rounded-lg border border-border bg-surface-2 flex items-center justify-center">
                  <FileIcon className="w-5 h-5 text-text-3" />
                </div>
              )}
              {file.status === "done" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -right-1.5 -bottom-1.5 bg-surface rounded-full"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </motion.div>
              )}
              {file.status === "error" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -right-1.5 -bottom-1.5 bg-surface rounded-full"
                >
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </motion.div>
              )}
            </div>

            {/* Info + progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[11px] text-text-4 tabular-nums">{Math.round(file.progress)}%</span>
                  {file.status === "uploading" && <Loader className="w-3.5 h-3.5 animate-spin text-primary" />}
                  {file.status !== "uploading" && (
                    <button onClick={() => remove(file.id)} className="text-text-4 hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-text-3 mt-0.5">
                {file.status === "error" ? <span className="text-destructive">{file.errorMsg}</span> : formatFileSize(file.size)}
              </p>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${file.progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={clsx("h-full rounded-full", file.status === "error" ? "bg-destructive" : file.progress === 100 ? "bg-emerald-500" : "bg-primary")}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
