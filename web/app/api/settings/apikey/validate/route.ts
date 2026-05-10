import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { apiKey: string };
  const apiKey = body.apiKey?.trim();
  if (!apiKey || !apiKey.startsWith("sk-")) {
    return NextResponse.json(
      { valid: false, message: "OpenAI 키 형식이 올바르지 않아요 (sk-...)" },
      { status: 400 }
    );
  }
  try {
    const openai = new OpenAI({ apiKey });
    await openai.models.list();
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[apikey-validate]", error);
    const msg = String(error);
    if (msg.includes("ENOTFOUND") || msg.includes("Connection error") || msg.includes("fetch failed")) {
      return NextResponse.json(
        { valid: false, message: "키 문제가 아니라 서버가 OpenAI에 네트워크 연결되지 않았어요. DNS/VPN/방화벽을 확인해 주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { valid: false, message: "키가 유효하지 않아요. 키 권한/결제 상태도 확인해주세요." },
      { status: 400 }
    );
  }
}
