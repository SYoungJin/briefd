import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function maskKey(key: string) {
  if (key.length < 7) return "sk-••••";
  return `${key.slice(0, 3)}${"•".repeat(12)}${key.slice(-4)}`;
}

function encryptKey(plain: string) {
  const secret = process.env.SETTINGS_ENCRYPT_SECRET ?? "";
  return CryptoJS.AES.encrypt(plain, secret).toString();
}

function decryptKey(cipherText: string) {
  const secret = process.env.SETTINGS_ENCRYPT_SECRET ?? "";
  const bytes = CryptoJS.AES.decrypt(cipherText, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ exists: false, masked: null });
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ exists: false, masked: null });

  const { data } = await supabaseAdmin
    .from("user_settings")
    .select("openai_key")
    .eq("user_id", userId)
    .maybeSingle();

  const encrypted = data?.openai_key as string | undefined;
  if (!encrypted) return NextResponse.json({ exists: false, masked: null });

  const plain = decryptKey(encrypted);
  return NextResponse.json({ exists: true, masked: maskKey(plain) });
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ success: false }, { status: 500 });
  const body = (await req.json()) as { userId: string; apiKey: string };
  const encrypted = encryptKey(body.apiKey);

  await supabaseAdmin
    .from("user_settings")
    .upsert(
      {
        user_id: body.userId,
        openai_key: encrypted,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ success: false }, { status: 500 });
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ success: false }, { status: 400 });

  await supabaseAdmin.from("user_settings").delete().eq("user_id", userId);
  return NextResponse.json({ success: true });
}
