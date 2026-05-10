"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, User, X } from "lucide-react";
import { useSectorStore } from "@/store/sectorStore";
import { SECTOR_LABEL } from "@/lib/constants";
import { todayLabel } from "@/lib/time";

type RefreshState = "idle" | "loading" | "success" | "error" | "cooldown";

interface Props {
  onGenerateNewsletter: () => void;
  newsletterLoading?: boolean;
}

export function Header({ onGenerateNewsletter, newsletterLoading }: Props) {
  const router = useRouter();
  const { sector, setSector } = useSectorStore();
  const [state, setState] = useState<RefreshState>("idle");
  const [cooldown, setCooldown] = useState(0);

  const tooltip = useMemo(() => {
    if (state === "loading") return "업데이트 중...";
    if (state === "cooldown") return `${cooldown}초 후 사용 가능`;
    return "새 콘텐츠 가져오기";
  }, [state, cooldown]);

  async function handleRefresh() {
    if (state === "loading" || state === "cooldown") return;
    setState("loading");
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, userId: "00000000-0000-0000-0000-000000000000" })
      });
      const data = (await res.json().catch(() => ({}))) as {
        newCount?: number;
        failedFeeds?: string[];
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message ?? "업데이트 실패");
      }
      setState("success");
      setTimeout(() => setState("cooldown"), 1500);
      let left = 30;
      setCooldown(left);
      const timer = setInterval(() => {
        left -= 1;
        setCooldown(left);
        if (left <= 0) {
          clearInterval(timer);
          setState("idle");
        }
      }, 1000);
      router.refresh();
      const failed = data.failedFeeds?.length ?? 0;
      alert(
        `새 콘텐츠 ${data.newCount ?? 0}개를 가져왔어요${failed > 0 ? ` (실패한 소스 ${failed}개)` : ""}`
      );
    } catch (error) {
      setState("error");
      setTimeout(() => setState("idle"), 1500);
      const message = error instanceof Error ? error.message : "업데이트에 실패했어요. 다시 시도해주세요";
      alert(message);
    }
  }

  return (
    <header className="headerBar">
      <div className="brand">
        <strong>Briefd</strong>
        <span>{todayLabel()}</span>
      </div>

      <div className="sectorSegment">
        {(["trend", "research"] as const).map((key) => (
          <button
            key={key}
            className={`segmentBtn ${sector === key ? key : ""}`}
            onClick={() => setSector(key)}
          >
            {SECTOR_LABEL[key]}
          </button>
        ))}
      </div>

      <div className="headerActions">
        <button className="iconBtn" title={tooltip} onClick={handleRefresh} disabled={state === "loading" || state === "cooldown"}>
          {state === "success" ? (
            <Check size={20} />
          ) : state === "error" ? (
            <X size={20} />
          ) : (
            <RefreshCw size={20} className={state === "loading" ? "spin" : ""} />
          )}
        </button>
        <button
          className="generateBtn"
          onClick={onGenerateNewsletter}
          disabled={newsletterLoading}
        >
          {newsletterLoading ? "작성 중..." : "뉴스레터 만들기"}
        </button>
        <button className="iconBtn"><User size={20} /></button>
      </div>
    </header>
  );
}
