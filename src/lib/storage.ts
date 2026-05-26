import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "event-files";

export async function uploadToStorage(path: string, file: File) {
  const bytes = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

export async function deleteFromStorage(path: string) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}
