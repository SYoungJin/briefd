import CryptoJS from "crypto-js";
import OpenAI from "openai";
import { getSupabaseAdmin } from "./supabaseAdmin";

function decryptKey(cipherText: string): string {
  const secret = process.env.SETTINGS_ENCRYPT_SECRET ?? "";
  const bytes = CryptoJS.AES.decrypt(cipherText, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function getOpenAIForUser(userId?: string) {
  const supabaseAdmin = getSupabaseAdmin();
  if (userId && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("user_settings")
      .select("openai_key")
      .eq("user_id", userId)
      .maybeSingle();

    const encrypted = data?.openai_key as string | undefined;
    if (encrypted) {
      const userKey = decryptKey(encrypted);
      if (userKey) {
        return new OpenAI({ apiKey: userKey });
      }
    }
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
