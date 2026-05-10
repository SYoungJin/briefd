import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTOR_LABEL } from "@/lib/constants";
import { ConceptCard } from "@/components/ConceptCard";

interface NewsletterRow {
  id: number;
  sector: "trend" | "research";
  content: string;
  created_at: string;
}

interface ConceptRow {
  id: number;
  concept_name: string;
  concept_en: string | null;
  definition: string | null;
  explanation: string | null;
  example: string | null;
  tags: string[] | null;
}

function previewFromMarkdown(md: string): { title: string; lead: string } {
  const lines = md.split("\n").filter((l) => l.trim().length > 0);
  const titleLine = lines.find((l) => /^#\s/.test(l)) ?? lines[0] ?? "";
  const title = titleLine.replace(/^#+\s*/, "").slice(0, 60);
  const lead = lines.find((l) => !/^#/.test(l) && !/^\s*-/.test(l))?.replace(/[*_`>#-]/g, "").slice(0, 110) ?? "";
  return { title: title || "Untitled", lead };
}

export default async function MyPage() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return (
      <main className="docPage">
        <h1>My page</h1>
        <p className="muted">Supabase 연결이 필요합니다.</p>
      </main>
    );
  }

  const [newslettersRes, cardsRes] = await Promise.all([
    supabaseAdmin
      .from("newsletters")
      .select("id,sector,content,created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabaseAdmin
      .from("concept_cards")
      .select("id,concept_name,concept_en,definition,explanation,example,tags")
      .order("created_at", { ascending: false })
      .limit(60)
  ]);

  const newsletters = (newslettersRes.data ?? []) as NewsletterRow[];
  const cards = (cardsRes.data ?? []) as ConceptRow[];

  return (
    <main className="docPage myPage">
      <header className="myPageHeader">
        <div>
          <Link href="/" className="muted backLink">← 피드로</Link>
          <h1>My page</h1>
          <p className="muted">내가 만든 뉴스레터와 저장한 개념 카드를 한곳에서.</p>
        </div>
        <Link href="/" className="generateBtn">
          새 뉴스레터 만들기 <ArrowRight size={16} />
        </Link>
      </header>

      <section className="mySection">
        <div className="mySectionHead">
          <FileText size={18} />
          <h2>내 뉴스레터</h2>
          <span className="muted">{newsletters.length}건</span>
        </div>

        {newsletters.length === 0 ? (
          <div className="emptyState">
            <p>아직 만든 뉴스레터가 없어요.</p>
            <Link href="/" className="summaryBtn">
              피드로 가서 만들기
            </Link>
          </div>
        ) : (
          <div className="newsletterList">
            {newsletters.map((n) => {
              const { title, lead } = previewFromMarkdown(n.content);
              return (
                <Link key={n.id} href={`/newsletter/${n.id}`} className="newsletterRow">
                  <div className="newsletterRowMain">
                    <span className={`badge ${n.sector}`}>{SECTOR_LABEL[n.sector]}</span>
                    <h3>{title}</h3>
                    {lead && <p>{lead}</p>}
                  </div>
                  <div className="newsletterRowMeta">
                    <small>{new Date(n.created_at).toLocaleString("ko-KR")}</small>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mySection">
        <div className="mySectionHead">
          <Sparkles size={18} />
          <h2>저장한 개념 카드</h2>
          <span className="muted">{cards.length}건</span>
        </div>

        {cards.length === 0 ? (
          <div className="emptyState">
            <p>아직 저장한 카드가 없어요. 뉴스레터나 논문 기사에서 ‘개념 추출’을 눌러보세요.</p>
          </div>
        ) : (
          <div className="myCardsGrid">
            {cards.map((card) => (
              <ConceptCard
                key={card.id}
                item={{
                  concept_name: card.concept_name,
                  concept_en: card.concept_en ?? "",
                  definition: card.definition ?? "",
                  explanation: card.explanation ?? "",
                  example: card.example ?? "",
                  tags: card.tags ?? []
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
