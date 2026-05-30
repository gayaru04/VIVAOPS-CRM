import { createClient } from "@supabase/supabase-js";

const BUCKET = "event-files";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  return createClient(url, key);
}

export async function uploadToStorage(path: string, file: File) {
  const bytes = await file.arrayBuffer();
  const { error } = await getAdmin().storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

export async function deleteFromStorage(path: string) {
  const { error } = await getAdmin().storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  const { data, error } = await getAdmin().storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}
