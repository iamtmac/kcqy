import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// --- Mock Data & Scoring Logic ---

interface Enterprise {
  id: string;
  name: string;
  district: string;
  industry: string;
  capital: number; // in 10k CNY
  establishedDate: string;
  isIndependent: boolean;
  status: "存续" | "注销" | "吊销";
  isJiaxing: boolean;
  noViolations: boolean;
  allowedIndustry: boolean;
  scope: string;
  ipCount: number;
  hasPreviousRecords: boolean;
  contact: string;
  statusTracking: "待邀约" | "辅导中" | "申报中" | "已认定" | "未通过";
}

const DISTRICTS = ["南湖区", "秀洲区", "嘉善县", "海盐县", "海宁市", "平湖市", "桐乡市", "嘉兴经开区", "嘉兴港区"];
const TECH_KEYWORDS = ["科技", "研发", "智能", "信息", "生物", "新材料", "新能源", "装备", "电子", "软件", "医药", "科创"];
const SCOPE_KEYWORDS = ["技术开发", "技术转让", "技术咨询", "技术服务", "软件开发", "研发设计"];
const PSEUDO_SCOPE = ["批发", "零售", "贸易", "劳务分包", "劳务派遣", "仓储", "物流", "餐饮", "住宿", "商务代理"];

const mockEnterprises: Enterprise[] = [
  {
    id: "1",
    name: "嘉兴智控科技有限公司",
    district: "南湖区",
    industry: "软件和信息技术服务业",
    capital: 1000,
    establishedDate: "2020-05-12",
    isIndependent: true,
    status: "存续",
    isJiaxing: true,
    noViolations: true,
    allowedIndustry: true,
    scope: "工业自动化控制系统、软件开发、技术服务",
    ipCount: 12,
    hasPreviousRecords: true,
    contact: "张经理 138****1234",
    statusTracking: "待邀约"
  },
  {
    id: "2",
    name: "嘉兴市恒通商贸有限公司",
    district: "秀洲区",
    industry: "批发业",
    capital: 500,
    establishedDate: "2015-03-20",
    isIndependent: true,
    status: "存续",
    isJiaxing: true,
    noViolations: true,
    allowedIndustry: true,
    scope: "日用百货批发、零售、贸易",
    ipCount: 0,
    hasPreviousRecords: false,
    contact: "李总 139****5678",
    statusTracking: "待邀约"
  },
  {
    id: "3",
    name: "嘉善科创生物研发中心",
    district: "嘉善县",
    industry: "科学研究和技术服务业",
    capital: 2000,
    establishedDate: "2022-01-10",
    isIndependent: true,
    status: "存续",
    isJiaxing: true,
    noViolations: true,
    allowedIndustry: true,
    scope: "生物医药技术研发、技术转让、技术咨询",
    ipCount: 5,
    hasPreviousRecords: false,
    contact: "王博士 137****9988",
    statusTracking: "辅导中"
  },
  {
    id: "4",
    name: "海宁市某某大型集团分公司",
    district: "海宁市",
    industry: "制造业",
    capital: 10000,
    establishedDate: "2010-06-15",
    isIndependent: false,
    status: "存续",
    isJiaxing: true,
    noViolations: true,
    allowedIndustry: true,
    scope: "纺织品制造、销售",
    ipCount: 20,
    hasPreviousRecords: true,
    contact: "陈主任 135****4433",
    statusTracking: "待邀约"
  },
  {
    id: "5",
    name: "嘉兴云端信息技术有限公司",
    district: "南湖区",
    industry: "信息传输、软件和信息技术服务业",
    capital: 300,
    establishedDate: "2023-08-20",
    isIndependent: true,
    status: "存续",
    isJiaxing: true,
    noViolations: true,
    allowedIndustry: true,
    scope: "云计算技术服务、软件开发",
    ipCount: 1,
    hasPreviousRecords: false,
    contact: "赵经理 136****2211",
    statusTracking: "待邀约"
  }
];

// Generate more mock data
for (let i = 6; i <= 100; i++) {
  const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
  const isTechName = Math.random() > 0.4;
  const name = `嘉兴${isTechName ? TECH_KEYWORDS[Math.floor(Math.random() * TECH_KEYWORDS.length)] : "某某"}${["科技", "工业", "电子", "商贸", "实业"][Math.floor(Math.random() * 5)]}有限公司`;
  
  mockEnterprises.push({
    id: i.toString(),
    name,
    district,
    industry: ["制造业", "批发业", "软件和信息技术服务业", "科学研究和技术服务业", "商务服务业"][Math.floor(Math.random() * 5)],
    capital: Math.floor(Math.random() * 8000),
    establishedDate: `${2010 + Math.floor(Math.random() * 15)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    isIndependent: Math.random() > 0.1,
    status: "存续",
    isJiaxing: true,
    noViolations: Math.random() > 0.05,
    allowedIndustry: true,
    scope: Math.random() > 0.5 ? "技术开发、技术服务、软件开发" : "批发、零售、贸易、劳务派遣",
    ipCount: Math.floor(Math.random() * 15),
    hasPreviousRecords: Math.random() > 0.8,
    contact: `联系人 1${Math.floor(Math.random() * 9)}8****${Math.floor(Math.random() * 9999)}`,
    statusTracking: "待邀约"
  });
}

function calculateScore(ent: Enterprise) {
  let score = 0;
  let reasons: string[] = [];
  let shortfalls: string[] = [];

  // (1) 基础准入 (45分) - 一票否决
  const basicPass = ent.isJiaxing && ent.status === "存续" && ent.noViolations && ent.allowedIndustry;
  if (basicPass) {
    score += 45;
    reasons.push("基础合规满足");
  } else {
    reasons.push("基础合规不满足（一票否决）");
    return { score: 0, grade: "暂不符合", reasons, shortfalls: ["基础合规项不通过"] };
  }

  // (2) 企业规模预判 (20分)
  let scaleScore = 0;
  if (ent.capital <= 5000) {
    scaleScore += 8;
  } else {
    shortfalls.push("注册资本超5000万");
  }
  if (ent.isIndependent) {
    scaleScore += 7;
  } else {
    shortfalls.push("非独立法人主体");
  }
  const age = new Date().getFullYear() - new Date(ent.establishedDate).getFullYear();
  if (age >= 1 && age <= 20) {
    scaleScore += 5;
  } else {
    shortfalls.push("成立年限不在1-20年区间");
  }
  score += scaleScore;
  reasons.push(`规模得分: ${scaleScore}/20`);

  // (3) 科创属性倾向推测 (35分)
  let techScore = 0;
  if (TECH_KEYWORDS.some(k => ent.name.includes(k))) {
    techScore += 10;
  } else {
    shortfalls.push("名称不含科创关键词");
  }
  if (SCOPE_KEYWORDS.some(k => ent.scope.includes(k))) {
    techScore += 9;
  } else {
    shortfalls.push("经营范围不含技术类条目");
  }
  if (ent.ipCount > 0) {
    techScore += 6;
  } else {
    shortfalls.push("无公开知识产权记录");
  }
  if (ent.hasPreviousRecords) {
    techScore += 5;
  } else {
    shortfalls.push("无历史入库或扶持记录");
  }
  const techIndustries = ["科学研究", "信息技术", "高端制造", "医药健康"];
  if (techIndustries.some(i => ent.industry.includes(i))) {
    techScore += 5;
  } else {
    shortfalls.push("行业门类非核心科创领域");
  }
  score += techScore;
  reasons.push(`科创属性得分: ${techScore}/35`);

  // 伪科技剔除逻辑
  const hasTechName = TECH_KEYWORDS.some(k => ent.name.includes(k));
  const onlyPseudoScope = PSEUDO_SCOPE.some(k => ent.scope.includes(k)) && !SCOPE_KEYWORDS.some(k => ent.scope.includes(k));
  if (hasTechName && onlyPseudoScope) {
    return { score: 59, grade: "暂不符合", reasons: ["判定为伪科技企业：名称含科技但经营范围仅为商贸劳务"], shortfalls: ["经营范围与名称不匹配"] };
  }

  let grade = "暂不符合";
  if (score >= 85) grade = "A档";
  else if (score >= 70) grade = "B档";
  else if (score >= 60) grade = "C档";

  return { score, grade, reasons, shortfalls };
}

// --- API Routes ---

app.get("/api/enterprises", (req, res) => {
  const data = mockEnterprises.map(ent => ({
    ...ent,
    ...calculateScore(ent)
  }));
  res.json(data);
});

app.get("/api/stats", (req, res) => {
  const scoredData = mockEnterprises.map(ent => calculateScore(ent));
  const stats = {
    total: mockEnterprises.length,
    gradeA: scoredData.filter(d => d.grade === "A档").length,
    gradeB: scoredData.filter(d => d.grade === "B档").length,
    gradeC: scoredData.filter(d => d.grade === "C档").length,
    ineligible: scoredData.filter(d => d.grade === "暂不符合").length,
    byDistrict: DISTRICTS.map(d => ({
      name: d,
      count: mockEnterprises.filter(e => e.district === d).length
    }))
  };
  res.json(stats);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
