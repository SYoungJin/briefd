import { Sector } from "./types";

export const TREND_FEEDS = [
  // UXUI / Product Design
  "https://uxdesign.cc/feed",
  "https://uxplanet.org/feed",
  "https://www.smashingmagazine.com/feed/",
  "https://medium.com/feed/google-design",
  "https://medium.com/feed/airbnb-design",
  "https://medium.com/feed/microsoft-design",
  "https://medium.com/feed/@mozilla.design",
  "https://eyeondesign.aiga.org/feed/",
  "https://www.fastcompany.com/co-design/rss",
  "https://uxmag.com/rss.xml",
  "https://medium.com/feed/user-experience-design-1",
  "https://www.creativebloq.com/feed",

  // Mobility (EV / Autonomous / Vehicle UX)
  "https://electrek.co/feed/",
  "https://insideevs.com/rss/",
  "https://www.theverge.com/transportation/rss/index.xml",
  "https://techcrunch.com/category/transportation/feed/",
  "https://www.thedrive.com/feed",

  // IT exhibitions / new feature reveals / consumer tech
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://www.wired.com/feed/rss",
  "https://www.engadget.com/rss.xml",
  "https://www.designboom.com/feed/",
  "https://www.dezeen.com/feed/",
  "https://www.itsnicethat.com/feed",
  "https://www.fastcompany.com/section/design/rss"
];

export const RESEARCH_FEEDS = [
  // HCI core (academic)
  "https://arxiv.org/rss/cs.HC",
  "https://arxiv.org/rss/cs.CY",
  "https://hci.stanford.edu/news.rss",

  // UX / HCI research publications
  "https://feeds.feedburner.com/nngroup/news",
  "https://www.interaction-design.org/rss/site_news.xml",
  "https://uxpamagazine.org/feed/",
  "https://uxmag.com/rss.xml",
  "https://medium.com/feed/user-experience-design-1",

  // Service Design
  "https://medium.com/feed/tag/service-design",
  "https://www.servicedesignshow.com/feed/",
  "https://servicedesignnetwork.org/feed/",
  "https://medium.com/feed/touchpoint",
  "https://blog.practicalservicedesign.com/feed",

  // Adjacent (research-quality writing)
  "https://medium.com/feed/swlh/tagged/design",
  "http://feeds.feedburner.com/mittrGlobalTechWatch"
];

export const SECTOR_LABEL: Record<Sector, string> = {
  trend: "트렌드·기업",
  research: "논문·연구"
};

export const CATEGORIES: Record<Sector, string[]> = {
  trend: ["UXUI", "모빌리티", "전시·이벤트", "디자인", "AI·로봇", "IoT"],
  research: ["HCI", "서비스디자인", "인터랙션", "접근성", "디자인시스템", "인지과학"]
};
