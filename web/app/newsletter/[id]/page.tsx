import Link from "next/link";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTOR_LABEL } from "@/lib/constants";
import { NewsletterClient } from "./NewsletterClient";

export default async function NewsletterPage({ params }: { params: { id: string } }) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return <main className="docPage">Supabase 연결이 필요합니다.</main>;
  }
  const { data } = await supabaseAdmin
    .from("newsletters")
    .select("id,sector,content,created_at")
    .eq("id", Number(params.id))
    .maybeSingle();

  if (!data) {
    return (
      <main className="docPage">
        <Link href="/mypage" className="muted backLink">← My page 로</Link>
        <h1>뉴스레터를 찾을 수 없습니다</h1>
      </main>
    );
  }

  const sector = data.sector as "trend" | "research";
  const date = new Date(data.created_at);
  const issueNumber = data.id.toString().padStart(4, "0");
  const accentClass = sector === "trend" ? "trendAccent" : "researchAccent";

  return (
    <main className="newsletterDoc">
      <div className={`newsletterCover ${accentClass}`}>
        <div className="newsletterCoverInner">
          <Link href="/mypage" className="coverBackLink">
            <ArrowLeft size={16} />
            My page
          </Link>
          <div className="coverEyebrow">
            <span>BRIEFD</span>
            <span>·</span>
            <span>{SECTOR_LABEL[sector]}</span>
            <span>·</span>
            <span>Issue #{issueNumber}</span>
          </div>
          <h1 className="coverTitle">
            {sector === "trend"
              ? "이번 주 디자이너가 알아야 할 트렌드"
              : "UXUI 실무에 바로 쓰는 연구 인사이트"}
          </h1>
          <div className="coverMeta">
            <Calendar size={14} />
            <span>{date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>·</span>
            <span>약 {Math.max(2, Math.round(data.content.length / 500))}분 읽기</span>
          </div>
        </div>
        <div className="coverGradientOrb" />
      </div>

      <NewsletterClient
        id={data.id}
        sector={sector}
        content={data.content}
      />

      <footer className="newsletterFooter">
        <div className="footerLine" />
        <p>
          이 뉴스레터는 <strong>Briefd</strong> 가 오늘의 {SECTOR_LABEL[sector]} 자료를 분석해 자동 작성했어요.
        </p>
        <div className="footerActions">
          <Link href="/" className="summaryBtn">
            <Sparkles size={14} /> 새 뉴스레터 만들기
          </Link>
          <Link href="/mypage" className="foldBtn">
            My page 로 돌아가기
          </Link>
        </div>
      </footer>
    </main>
  );
}
