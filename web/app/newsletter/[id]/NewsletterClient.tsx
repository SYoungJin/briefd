"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles, X } from "lucide-react";
import type { ConceptCardItem } from "@/lib/types";
import { ConceptCard } from "@/components/ConceptCard";

interface Props {
  id: number;
  sector: "trend" | "research";
  content: string;
}

interface Section {
  heading: string;
  body: string;
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

export function NewsletterClient({ id, sector, content }: Props) {
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
          sourceId: id
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
            <button
              className="iconBtn closeBtn"
              onClick={() => setConcepts([])}
              aria-label="close"
            >
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
