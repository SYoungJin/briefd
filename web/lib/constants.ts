import { Sector } from "./types";

export const TREND_FEEDS = [
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://www.wired.com/feed/rss",
  "https://www.yankodesign.com/feed/",
  "https://www.dezeen.com/feed/",
  "https://www.engadget.com/rss.xml"
];

export const RESEARCH_FEEDS = [
  "https://arxiv.org/rss/cs.HC",
  "https://arxiv.org/rss/cs.AI",
  "https://feeds.feedburner.com/nngroup/news",
  "http://feeds.feedburner.com/mittrGlobalTechWatch"
];

export const SECTOR_LABEL: Record<Sector, string> = {
  trend: "트렌드·기업",
  research: "논문·연구"
};

export const CATEGORIES: Record<Sector, string[]> = {
  trend: ["모빌리티", "AI·로봇", "IoT", "UXUI", "전시·이벤트"],
  research: ["HCI", "AI·ML", "인터랙션", "접근성", "디자인시스템"]
};
