"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

const trendTopics = ["모빌리티", "AI·로봇", "IoT", "UXUI", "전시·이벤트"];
const researchTopics = ["HCI", "AI·ML", "인터랙션", "접근성", "디자인시스템"];

export default function SettingsPage() {
  const userId = "00000000-0000-0000-0000-000000000000";
  const [masked, setMasked] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("미연결");
  const [trendSelection, setTrendSelection] = useState<Record<string, boolean>>({});
  const [researchSelection, setResearchSelection] = useState<Record<string, boolean>>({});
  const [briefingTime, setBriefingTime] = useState("오전 7시");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/settings/apikey?userId=${userId}`);
      const data = (await res.json()) as { masked: string | null };
      setMasked(data.masked);
    })();
  }, []);

  async function validateAndSave() {
    setStatus("idle");
    const cleanedKey = apiKey.trim();
    if (!cleanedKey) {
      setStatus("error");
      setStatusMessage("새 OpenAI 키를 입력해 주세요");
      return;
    }
    const validate = await fetch("/api/settings/apikey/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: cleanedKey })
    });
    if (!validate.ok) {
      const errorBody = (await validate.json().catch(() => ({}))) as { message?: string };
      setStatus("error");
      setStatusMessage(errorBody.message ?? "키가 유효하지 않아요");
      return;
    }
    const saveRes = await fetch("/api/settings/apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, apiKey: cleanedKey })
    });
    if (!saveRes.ok) {
      const saveBody = (await saveRes.json().catch(() => ({}))) as { message?: string };
      setStatus("error");
      setStatusMessage(saveBody.message ?? "키 저장에 실패했어요");
      return;
    }
    setMasked(`${cleanedKey.slice(0, 3)}••••••••••••${cleanedKey.slice(-4)}`);
    setStatus("ok");
    setStatusMessage("연결됨");
    setApiKey("");
  }

  async function removeKey() {
    await fetch(`/api/settings/apikey?userId=${userId}`, { method: "DELETE" });
    setMasked(null);
    setApiKey("");
    setStatus("idle");
    setStatusMessage("미연결");
  }

  return (
    <main className="docPage settingsPage">
      <section className="settingsCard">
        <h2>API 키 설정</h2>
        <p>AI 요약, 뉴스레터 생성, 개념 추출 기능에 사용됩니다.</p>
        <label>OpenAI API Key</label>
        <div className="keyRow">
          <input
            type={showKey ? "text" : "password"}
            placeholder={masked ?? "sk-..."}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button className="iconBtn" onClick={() => setShowKey((v) => !v)}>
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="row">
          <button className="generateBtn" onClick={validateAndSave}>저장</button>
          <button className="foldBtn" onClick={removeKey}>삭제</button>
          <span className={status === "ok" ? "ok" : status === "error" ? "error" : "muted"}>
            {statusMessage}
          </span>
        </div>
      </section>

      <section className="settingsCard">
        <h2>관심 주제 설정</h2>
        <div className="topicGrid">
          {trendTopics.map((topic) => (
            <button
              key={topic}
              className={trendSelection[topic] ? "chip active" : "chip"}
              onClick={() => setTrendSelection((p) => ({ ...p, [topic]: !p[topic] }))}
            >
              {topic}
            </button>
          ))}
        </div>
        <div className="topicGrid">
          {researchTopics.map((topic) => (
            <button
              key={topic}
              className={researchSelection[topic] ? "chip active" : "chip"}
              onClick={() => setResearchSelection((p) => ({ ...p, [topic]: !p[topic] }))}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      <section className="settingsCard">
        <h2>알림 설정</h2>
        <select value={briefingTime} onChange={(e) => setBriefingTime(e.target.value)}>
          <option>오전 6시</option>
          <option>오전 7시</option>
          <option>오전 8시</option>
          <option>오전 9시</option>
          <option>사용 안함</option>
        </select>
      </section>
    </main>
  );
}
