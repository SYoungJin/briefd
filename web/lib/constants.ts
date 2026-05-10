import { Sector } from "./types";

export const TREND_FEEDS = [
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://www.wired.com/feed/rss",
  "https://www.yankodesign.com/feed/",
  "https://www.dezeen.com/feed/",
  "https://www.engadget.com/rss.xml",
  "https://uxdesign.cc/feed",
  "https://uxplanet.org/feed",
  "https://www.smashingmagazine.com/feed/",
  "https://medium.com/feed/google-design",
  "https://medium.com/feed/airbnb-design",
  "https://medium.com/feed/microsoft-design",
  "https://medium.com/feed/@mozilla.design",
  "https://www.fastcompany.com/co-design/rss",
  "https://www.creativebloq.com/feed",
  "https://design-milk.com/feed/",
  "https://www.designboom.com/feed/",
  "https://www.itsnicethat.com/feed",
  "https://thedieline.com/blog?format=rss",
  "https://www.behance.net/feeds/projects?field=80",
  "https://design.google/library/feed.xml",
  "https://www.fastcompany.com/section/design/rss",
  "https://www.businessoffashion.com/rss/",
  "https://eyeondesign.aiga.org/feed/",
  "https://design-week.co.uk/feed/"
];

export const RESEARCH_FEEDS = [
  "https://arxiv.org/rss/cs.HC",
  "https://arxiv.org/rss/cs.AI",
  "https://arxiv.org/rss/cs.CL",
  "https://arxiv.org/rss/cs.CY",
  "https://arxiv.org/rss/cs.GR",
  "https://arxiv.org/rss/cs.IR",
  "https://arxiv.org/rss/cs.LG",
  "https://arxiv.org/rss/cs.MM",
  "https://feeds.feedburner.com/nngroup/news",
  "http://feeds.feedburner.com/mittrGlobalTechWatch",
  "https://www.interaction-design.org/rss/site_news.xml",
  "https://uxpamagazine.org/feed/",
  "https://uxmag.com/rss.xml",
  "https://medium.com/feed/user-experience-design-1",
  "https://medium.com/feed/swlh/tagged/design",
  "https://research.google/blog/rss/",
  "https://openai.com/blog/rss.xml",
  "https://www.microsoft.com/en-us/research/feed/",
  "https://www.deepmind.com/blog/rss.xml",
  "https://hci.stanford.edu/news.rss"
];

export const SECTOR_LABEL: Record<Sector, string> = {
  trend: "트렌드·기업",
  research: "논문·연구"
};

export const CATEGORIES: Record<Sector, string[]> = {
  trend: ["모빌리티", "AI·로봇", "IoT", "UXUI", "디자인", "전시·이벤트"],
  research: ["HCI", "AI·ML", "인터랙션", "접근성", "디자인시스템", "인지과학"]
};
