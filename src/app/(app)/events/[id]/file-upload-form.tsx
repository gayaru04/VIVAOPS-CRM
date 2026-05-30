"use client";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";

export function FileUploadForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  return (
    <FileUpload
      eventId={eventId}
      onUploaded={() => router.refresh()}
    />
  );
}
