// 집사이 — 사실 중심 리포트 전송 (P0 프로토타입)
// 실행: node server.js  (Node 18 이상, 추가 설치 없음)
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const PUBLIC_DIR = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 3000;

// .env 읽기 (ANTHROPIC_API_KEY)
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const MODEL = "claude-haiku-5-5";
const API_URL = "https://api.anthropic.com/v1/messages";
const AI_TIMEOUT_MS = 15000;
const MAX_PHOTOS = 3;
const EMPTY = "미입력";
const FIELDS = [
  ["location", "위치"],
  ["symptom", "증상"],
  ["firstSeen", "처음 발견한 날짜"],
  ["impact", "현재 영향"],
  ["request", "요청 사항"],
];

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const SYSTEM_PROMPT = `너는 임차인이 임대인에게 보낼 집 고장·하자 리포트를 정리한다.
임차인이 쓴 글을 아래 다섯 항목으로 나눠 report 도구로 돌려준다.
- location: 문제가 있는 곳
- symptom: 임차인이 관찰한 사실만
- firstSeen: 처음 발견한 때. 원문 표현 그대로 쓰고 날짜를 계산하거나 바꾸지 않는다.
- impact: 생활에 미치는 영향
- request: 임대인에게 바라는 것
규칙:
- 원문에 없는 내용은 쓰지 않는다.
- 감정 표현(짜증, 화남, 느낌표 등), 원인 추정, 책임 소재 주장, 비용 부담 주장은 모두 뺀다.
- 원문에서 알 수 없는 항목은 정확히 "${EMPTY}"라고 쓴다.
- 차분한 존댓말 명사형 문장으로 짧게 쓴다.`;

const REPORT_TOOL = {
  name: "report",
  description: "정리된 리포트 항목",
  input_schema: {
    type: "object",
    properties: Object.fromEntries(FIELDS.map(([k, label]) => [k, { type: "string", description: label }])),
    required: FIELDS.map(([k]) => k),
  },
};

function fallbackFields(text) {
  const f = Object.fromEntries(FIELDS.map(([k]) => [k, EMPTY]));
  f.symptom = text;
  return f;
}

async function organize(text) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("API 키가 없습니다");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [REPORT_TOOL],
        tool_choice: { type: "tool", name: "report" },
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!res.ok) throw new Error(`API 오류 ${res.status}`);
    const body = await res.json();
    const block = (body.content || []).find((b) => b.type === "tool_use" && b.name === "report");
    if (!block || typeof block.input !== "object") throw new Error("응답 형식이 맞지 않습니다");
    const out = {};
    for (const [k] of FIELDS) {
      const v = block.input[k];
      if (typeof v !== "string") throw new Error("응답 형식이 맞지 않습니다");
      out[k] = v.trim() || EMPTY;
    }
    return out;
  } finally {
    clearTimeout(timer);
  }
}

function send(res, status, type, body) {
  res.writeHead(status, { "content-type": type });
  res.end(body);
}
const json = (res, status, obj) => send(res, status, "application/json; charset=utf-8", JSON.stringify(obj));

function readBody(req, limit = 40 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function savePhoto(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) throw new Error("사진 형식이 맞지 않습니다");
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const name = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(m[2], "base64"));
  return name;
}

function reportPage(r) {
  const sent = new Date(r.sentAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const rows = FIELDS.map(([k, label]) => `<div class="row"><dt>${label}</dt><dd>${esc(r.fields[k])}</dd></div>`).join("");
  const photos = r.photos.map((p) => `<img src="/uploads/${esc(p)}" alt="첨부 사진">`).join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>집 고장·하자 리포트</title><link rel="stylesheet" href="/style.css"></head><body><main>
<p class="eyebrow">집사이 · 사실 중심 리포트</p>
<h1>집 고장·하자 리포트</h1>
<p class="meta">보낸 시각: <b>${esc(sent)}</b> · 보낸 뒤에는 내용이 바뀌지 않습니다.</p>
<dl class="report">${rows}</dl>
${photos ? `<h2>사진</h2><div class="photos">${photos}</div>` : ""}
</main></body></html>`;
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

function serveFile(res, dir, rel) {
  const file = path.join(dir, rel);
  if (!file.startsWith(dir + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, "text/plain; charset=utf-8", "없는 페이지입니다");
  send(res, 200, MIME[path.extname(file)] || "application/octet-stream", fs.readFileSync(file));
}

const ID_RE = /^[0-9a-f-]{36}$/;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "POST" && url.pathname === "/api/organize") {
      const { text } = JSON.parse(await readBody(req));
      if (typeof text !== "string" || !text.trim()) return json(res, 400, { error: "내용을 써 주세요" });
      try {
        return json(res, 200, { fields: await organize(text.trim()), aiFailed: false });
      } catch (e) {
        console.warn("AI 정리 실패:", e.name === "AbortError" ? "15초 안에 응답 없음" : e.message);
        return json(res, 200, { fields: fallbackFields(text.trim()), aiFailed: true });
      }
    }
    if (req.method === "POST" && url.pathname === "/api/reports") {
      const { fields, photos = [] } = JSON.parse(await readBody(req));
      if (!Array.isArray(photos) || photos.length < 1 || photos.length > MAX_PHOTOS) return json(res, 400, { error: `사진은 1~${MAX_PHOTOS}장 첨부해 주세요` });
      const clean = {};
      for (const [k] of FIELDS) clean[k] = typeof fields?.[k] === "string" && fields[k].trim() ? fields[k].trim() : EMPTY;
      const id = crypto.randomUUID();
      const report = { id, sentAt: new Date().toISOString(), fields: clean, photos: photos.map(savePhoto) };
      fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(report, null, 2), { flag: "wx" });
      return json(res, 201, { id, url: `${url.origin}/r/${id}` });
    }
    if (req.method === "GET" && url.pathname.startsWith("/r/")) {
      const id = url.pathname.slice(3);
      const file = path.join(DATA_DIR, `${id}.json`);
      if (!ID_RE.test(id) || !fs.existsSync(file)) return send(res, 404, "text/plain; charset=utf-8", "리포트를 찾을 수 없습니다");
      return send(res, 200, "text/html; charset=utf-8", reportPage(JSON.parse(fs.readFileSync(file, "utf8"))));
    }
    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) return serveFile(res, UPLOAD_DIR, path.basename(url.pathname));
    if (req.method === "GET") return serveFile(res, PUBLIC_DIR, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    send(res, 405, "text/plain; charset=utf-8", "허용되지 않는 요청입니다");
  } catch (e) {
    console.error(e);
    json(res, 400, { error: "요청을 처리하지 못했습니다" });
  }
});

server.listen(PORT, () => {
  console.log(`집사이 리포트: http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) console.warn("ANTHROPIC_API_KEY가 없습니다. AI 정리는 실패 처리로 동작합니다.");
});
