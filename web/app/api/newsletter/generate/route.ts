import { NextRequest, NextResponse } from "next/server";
import { getOpenAIForUser } from "@/lib/openaiForUser";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Sector } from "@/lib/types";

const trendPrompt = `당신은 UXUI 디자이너를 위한 테크 트렌드 에디터입니다.
오늘의 주요 뉴스와 전시회 소식을 바탕으로
UXUI 관점에서 의미 있는 내용만 추려 뉴스레터를 작성하세요.
각 섹션은 ## 헤더로 구분하고, UXUI 디자이너에게
실질적인 인사이트와 시사점을 포함해 주세요.
한국어로 작성하세요.`;

const researchPrompt = `당신은 HCI·UXUI 연구를 쉽게 설명하는 리서치 에디터입니다.
최신 논문들의 핵심 발견을 UXUI 실무자가 이해할 수 있는
언어로 풀어 뉴스레터를 작성하세요.
각 논문의 실무 적용 가능성을 반드시 포함하세요.
한국어로 작성하세요.`;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { sector?: Sector; userId?: string };
  const sector = body.sector ?? "trend";
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: "Supabase not configured" }, { status: 500 });
  }

  const { data: articles } = await supabaseAdmin
    .from("articles")
    .select("id,title,source,url,summary")
    .eq("sector", sector)
    .order("published_at", { ascending: false })
    .limit(10);

  const articleText = (articles ?? [])
    .map((a) => `- ${a.title}\n  source: ${a.source}\n  url: ${a.url}\n  summary: ${a.summary ?? "없음"}`)
    .join("\n");

  const openai = await getOpenAIForUser(body.userId);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: sector === "trend" ? trendPrompt : researchPrompt },
      { role: "user", content: `다음 자료를 기반으로 뉴스레터를 작성해줘.\n\n${articleText}` }
    ]
  });

  let content = "";
  for await (const chunk of completion) {
    content += chunk.choices[0]?.delta?.content ?? "";
  }

  const { data: inserted } = await supabaseAdmin
    .from("newsletters")
    .insert({
      sector,
      content,
      article_ids: (articles ?? []).map((a) => a.id)
    })
    .select("id")
    .single();

  return NextResponse.json({ id: inserted?.id, content });
}
