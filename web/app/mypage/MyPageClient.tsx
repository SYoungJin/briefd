"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Sparkles,
  X
} from "lucide-react";
import { SECTOR_LABEL } from "@/lib/constants";
import type { ConceptCardItem } from "@/lib/types";
import { ConceptCard } from "@/components/ConceptCard";

export interface NewsletterRow {
  id: number;
  sector: "trend" | "research";
  content: string;
  created_at: string;
}

export interface ConceptRow {
  id: number;
  concept_name: string;
  concept_en: string | null;
  definition: string | null;
  explanation: string | null;
  example: string | null;
  tags: string[] | null;
}

interface Props {
  newsletters: NewsletterRow[];
  cards: ConceptRow[];
}

interface Section {
  heading: string;
  body: string;
}

function previewFromMarkdown(md: string): { title: string; lead: string } {
  const lines = md.split("\n").filter((l) => l.trim().length > 0);
  const titleLine = lines.find((l) => /^#\s/.test(l)) ?? lines[0] ?? "";
  const title = titleLine.replace(/^#+\s*/, "").slice(0, 60);
  const lead = lines.find((l) => !/^#/.test(l) && !/^\s*-/.test(l))?.replace(/[*_`>#-]/g, "").slice(0, 110) ?? "";
  return { title: title || "Untitled", lead };
}

function splitSections(md: string): Section[] {
  const lines = md.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const m = line.match(/^##\s+(.*)/);
    if (m) {
      if (current) sections.push(current);
      current = { heading: m[1].trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    } else {
      if (sections.length === 0) {
        sections.push({ heading: "", body: line + "\n" });
      } else {
        sections[sections.length - 1].body += line + "\n";
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

export function MyPageClient({ newsletters, cards }: Props) {
  const searchParams = useSearchParams();
  const initialId = useMemo(() => {
    const v = searchParams.get("n");
    return v ? Number(v) : null;
  }, [searchParams]);

  const [openId, setOpenId] = useState<number | null>(initialId);
  const expandedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialId && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialId]);

  return (
    <main className="docPage myPage">
      <header className="myPageHeader">
        <div>
          <Link href="/" className="muted backLink">
            <ArrowLeft size={14} /> 피드로
          </Link>
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
            {newsletters.map((n) => (
              <NewsletterAccordion
                key={n.id}
                newsletter={n}
                expanded={openId === n.id}
                onToggle={() => setOpenId(openId === n.id ? null : n.id)}
                anchorRef={openId === n.id ? expandedRef : undefined}
              />
            ))}
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
            <p>아직 저장한 카드가 없어요. 뉴스레터에서 ‘개념 추출’을 눌러보세요.</p>
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

interface AccordionProps {
  newsletter: NewsletterRow;
  expanded: boolean;
  onToggle: () => void;
  anchorRef?: React.RefObject<HTMLDivElement>;
}

function NewsletterAccordion({ newsletter, expanded, onToggle, anchorRef }: AccordionProps) {
  const { title, lead } = previewFromMarkdown(newsletter.content);
  const date = new Date(newsletter.created_at);
  const accentClass = newsletter.sector === "trend" ? "trendAccent" : "researchAccent";

  return (
    <div ref={anchorRef} className={`newsletterAccordion ${expanded ? "open" : ""}`}>
      <button className="newsletterAccordionHead" onClick={onToggle}>
        <div className="newsletterRowMain">
          <span className={`badge ${newsletter.sector}`}>{SECTOR_LABEL[newsletter.sector]}</span>
          <h3>{title}</h3>
          {lead && <p>{lead}</p>}
        </div>
        <div className="newsletterRowMeta">
          <small>{date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</small>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="newsletterExpanded">
          <div className={`newsletterCover compact ${accentClass}`}>
            <div className="newsletterCoverInner">
              <div className="coverEyebrow">
                <span>BRIEFD</span>
                <span>·</span>
                <span>{SECTOR_LABEL[newsletter.sector]}</span>
                <span>·</span>
                <span>Issue #{newsletter.id.toString().padStart(4, "0")}</span>
              </div>
              <h1 className="coverTitle compact">
                {newsletter.sector === "trend"
                  ? "이번 주 디자이너가 알아야 할 트렌드"
                  : "UXUI 실무에 바로 쓰는 연구 인사이트"}
              </h1>
              <div className="coverMeta">
                <Calendar size={14} />
                <span>
                  {date.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
                <span>·</span>
                <span>약 {Math.max(2, Math.round(newsletter.content.length / 500))}분 읽기</span>
              </div>
            </div>
            <div className="coverGradientOrb" />
          </div>

          <NewsletterBodyClient newsletterId={newsletter.id} sector={newsletter.sector} content={newsletter.content} />
        </div>
      )}
    </div>
  );
}

function NewsletterBodyClient({
  newsletterId,
  sector,
  content
}: {
  newsletterId: number;
  sector: "trend" | "research";
  content: string;
}) {
  const sections = splitSections(content);
  const [extractingFor, setExtractingFor] = useState<number | null>(null);
  const [concepts, setConcepts] = useState<ConceptCardItem[]>([]);
  const [conceptIndex, setConceptIndex] = useState(0);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function handleExtract(idx: number, sectionText: string) {
    setExtractingFor(idx);
    setError(null);
    try {
      const res = await fetch("/api/concepts/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: sectionText,
          sourceType: "newsletter",
          userId: "00000000-0000-0000-0000-000000000000"
        })
      });
      const data = (await res.json().catch(() => ({}))) as {
        concepts?: ConceptCardItem[];
        message?: string;
      };
      if (!res.ok || !data.concepts) {
        setError(data.message ?? "개념 추출에 실패했어요.");
        return;
      }
      setConcepts(data.concepts);
      setConceptIndex(0);
      setSavedSet(new Set());
    } catch {
      setError("네트워크 오류로 개념을 추출할 수 없어요.");
    } finally {
      setExtractingFor(null);
    }
  }

  async function handleSaveCurrent() {
    if (concepts.length === 0) return;
    const card = concepts[conceptIndex];
    setSavingIndex(conceptIndex);
    try {
      const res = await fetch("/api/concepts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card,
          sourceType: "newsletter",
          sourceId: newsletterId
        })
      });
      if (res.ok) {
        const next = new Set(savedSet);
        next.add(conceptIndex);
        setSavedSet(next);
      }
    } finally {
      setSavingIndex(null);
    }
  }

  return (
    <>
      <div className="newsletterBody">
        {sections.map((section, idx) => (
          <section key={idx} className="newsletterSection">
            {section.heading && (
              <div className="sectionHeadingRow">
                <span className={`sectionMarker ${sector}`} aria-hidden />
                <h2>{section.heading}</h2>
              </div>
            )}
            <div className="markdownBody">
              <ReactMarkdown>{section.body.trim()}</ReactMarkdown>
            </div>
            {section.heading && (
              <button
                className="conceptInlineBtn"
                onClick={() => handleExtract(idx, `${section.heading}\n\n${section.body}`)}
                disabled={extractingFor === idx}
              >
                {extractingFor === idx ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    추출 중...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    이 섹션에서 개념 카드 추출
                  </>
                )}
              </button>
            )}
          </section>
        ))}
      </div>

      {concepts.length > 0 && (
        <div className="conceptModal" onClick={() => setConcepts([])}>
          <div className="conceptModalInner" onClick={(e) => e.stopPropagation()}>
            <button className="iconBtn closeBtn" onClick={() => setConcepts([])} aria-label="close">
              <X size={20} />
            </button>
            <div className="conceptNav">
              <button
                className="iconBtn"
                onClick={() => setConceptIndex((i) => Math.max(0, i - 1))}
                disabled={conceptIndex === 0}
              >
                ←
              </button>
              <span className="muted">
                {conceptIndex + 1} / {concepts.length}
              </span>
              <button
                className="iconBtn"
                onClick={() => setConceptIndex((i) => Math.min(concepts.length - 1, i + 1))}
                disabled={conceptIndex === concepts.length - 1}
              >
                →
              </button>
            </div>
            <ConceptCard item={concepts[conceptIndex]} />
            <div className="conceptModalActions">
              <button
                className="generateBtn"
                onClick={handleSaveCurrent}
                disabled={savingIndex !== null || savedSet.has(conceptIndex)}
              >
                {savedSet.has(conceptIndex)
                  ? "✓ 저장됨"
                  : savingIndex === conceptIndex
                  ? "저장 중..."
                  : "My page 에 저장"}
              </button>
              <button className="foldBtn" onClick={() => setConcepts([])}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="conceptModal" onClick={() => setError(null)}>
          <div className="loadingCard">
            <h3>오류</h3>
            <p className="muted">{error}</p>
            <button className="generateBtn" onClick={() => setError(null)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
