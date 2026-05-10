import ReactMarkdown from "react-markdown";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTOR_LABEL } from "@/lib/constants";

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
    return <main className="docPage">뉴스레터를 찾을 수 없습니다.</main>;
  }

  return (
    <main className="docPage">
      <header className="docHeader">
        <span>{new Date(data.created_at).toLocaleString("ko-KR")}</span>
        <span className="badge">{SECTOR_LABEL[data.sector as "trend" | "research"]}</span>
      </header>
      <article className="markdownBody">
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </article>
      <footer className="docActions">
        <button className="summaryBtn">PDF 저장</button>
        <button className="summaryBtn">링크 복사</button>
      </footer>
    </main>
  );
}
