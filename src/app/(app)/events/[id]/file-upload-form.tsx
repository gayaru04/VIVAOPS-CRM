"use client";
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { uploadFile } from "@/server/actions/files";

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-surface text-[12px] font-medium text-foreground hover:bg-hover transition-colors disabled:opacity-50"
    >
      {pending ? (
        <>
          <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Uploading…
        </>
      ) : (
        "Upload File"
      )}
    </button>
  );
}

export function FileUploadForm({ eventId }: { eventId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={uploadFile}
      onSubmit={() => setTimeout(() => { if (inputRef.current) inputRef.current.value = ""; }, 100)}
      className="flex items-center gap-3"
    >
      <input type="hidden" name="eventId" value={eventId} />
      <input
        ref={inputRef}
        name="file"
        type="file"
        required
        className="text-[12px] text-text-3 file:mr-2 file:h-7 file:px-2.5 file:rounded file:border file:border-border file:bg-surface file:text-[12px] file:font-medium file:text-foreground file:cursor-pointer hover:file:bg-hover"
      />
      <UploadButton />
    </form>
  );
}
