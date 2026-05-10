import { NextRequest, NextResponse } from "next/server";
import { getOpenAIForUser } from "@/lib/openaiForUser";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    sourceText: string;
    sourceType: "article" | "newsletter";
    userId?: string;
  };

  const openai = await getOpenAIForUser(body.userId);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content:
          "다음 텍스트에서 UXUI 디자이너가 알아야 할 핵심 개념·원칙을 1~3개 추출하고 각각에 대해 아래 JSON 형식으로 반환하세요:\n" +
          "{ concepts: [{ concept_name, concept_en, definition, explanation, example, tags }] }\n\n" +
          body.sourceText
      }
    ]
  });

  const raw = completion.choices[0]?.message?.content ?? "{\"concepts\":[]}";
  const parsed = JSON.parse(raw) as { concepts: unknown[] };
  return NextResponse.json(parsed);
}
