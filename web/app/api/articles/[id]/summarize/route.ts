import { NextRequest, NextResponse } from "next/server";
import { getOpenAIForUser } from "@/lib/openaiForUser";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid article id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { userId?: string };
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: "Supabase not configured" }, { status: 500 });
  }
  const { data: article } = await supabaseAdmin
    .from("articles")
    .select("id,title,url,summary")
    .eq("id", id)
    .maybeSingle();

  if (!article) {
    return NextResponse.json({ message: "Article not found" }, { status: 404 });
  }

  if (article.summary) {
    return NextResponse.json({ id: article.id, summary: article.summary, cached: true });
  }

  const openai = await getOpenAIForUser(body.userId);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content:
          `다음 기사를 한국어로 3줄 이내로 핵심만 요약해줘. 각 줄은 "•"로 시작해줘.\n\n` +
          `${article.title}\n${article.url}`
      }
    ],
    temperature: 0.2
  });

  const summary = completion.choices[0]?.message?.content?.trim() ?? "• 요약을 생성하지 못했습니다.";

  await supabaseAdmin
    .from("articles")
    .update({ summary })
    .eq("id", id);

  return NextResponse.json({ id: article.id, summary, cached: false });
}
