// Cloudflare Pages Function: /api/gemini
// بيستقبل الطلب من الأداة، ويضيف مفتاح Gemini المحفوظ في إعدادات Cloudflare، ويبعته لـ Google زي ما هو.
// ولو الموديل المطلوب يبدأ بـ @cf/ (زي @cf/google/gemma-4-26b-a4b-it) بيتنفّذ على Cloudflare Workers AI
// كاحتياطي مجاني (10,000 Neuron في اليوم) لما Gemini يقع — والرد بيرجع بنفس شكل رد Gemini عشان الأداة متتغيرش.
// الإعدادات في Cloudflare > Workers & Pages > المشروع > Settings:
//   Variables and Secrets: GEMINI_API_KEY (إجباري، Secret) — TEAM_PASSWORD (اختياري)
//   Bindings: Workers AI باسم  AI   (مطلوب للاحتياطي المجاني بس)
const GEMINI_RX = /^gemini-[a-z0-9.\-]+$/i;
// الموديلات المسموحة على Workers AI بس (عشان محدش يشغّل موديل غالي من بره الحد المجاني)
const CF_MODELS = new Set(["@cf/google/gemma-4-26b-a4b-it", "@cf/openai/gpt-oss-120b"]);
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

export async function onRequestPost({ request, env }) {
  try {
    if (env.TEAM_PASSWORD && request.headers.get("X-Team-Pass") !== env.TEAM_PASSWORD)
      return json({ error: { message: "team password required", code: "team_pass" } }, 401);

    let model = new URL(request.url).searchParams.get("model") || "";
    let payload;
    if (model) {
      payload = await request.arrayBuffer(); // passed through untouched (no JSON parsing = almost no CPU)
    } else {
      const p = await request.json(); // older app versions send {model, body}
      model = (p && p.model) || "";
      payload = new TextEncoder().encode(JSON.stringify((p && p.body) || {})).buffer;
    }

    if (model.startsWith("@cf/")) {
      if (!CF_MODELS.has(model)) return json({ error: { message: "bad model" } }, 400);
      return await workersAI(model, payload, env);
    }

    if (!GEMINI_RX.test(model)) return json({ error: { message: "bad model" } }, 400);
    if (!env.GEMINI_API_KEY) return json({ error: { message: "GEMINI_API_KEY is not set in Cloudflare" } }, 500);

    // Google بيرجّع 503/500 لما الموديل عليه ضغط، وغالباً بيروق في ثانيتين — فبنجرّب مرة كمان هنا قبل ما نرجع للأداة
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    let upstream, tries = 0;
    while (true) {
      tries++;
      upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: payload,
      });
      if (tries >= 2 || (upstream.status !== 503 && upstream.status !== 500)) break;
      try { await upstream.body?.cancel(); } catch (e) {}
      await new Promise((r) => setTimeout(r, 1500));
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Upstream-Tries": String(tries) },
    });
  } catch (e) {
    return json({ error: { message: "proxy error: " + (e && e.message ? e.message : String(e)) } }, 502);
  }
}

export function onRequestGet({ env }) {
  return json({ ok: true, gemini: !!env.GEMINI_API_KEY, workersAI: !!env.AI });
}

/* ---------------- Cloudflare Workers AI (الاحتياطي المجاني) ---------------- */

const partsText = (c) => ((c && c.parts) || []).map((p) => p.text || "").filter(Boolean).join("\n");

// صفحة المتجر → نص قصير (بدل أداة url_context بتاعة Gemini). محدود عشان الـ CPU في الخطة المجانية.
async function readPage(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SahlPlans/1.0)", "Accept-Language": "ar,en;q=0.8" },
    });
    clearTimeout(t);
    if (!r.ok) return "";
    const html = (await r.text()).slice(0, 250000);
    const title = (/<title[^>]*>([^<]*)<\/title>/i.exec(html) || [])[1] || "";
    const desc = (/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i.exec(html) || [])[1] || "";
    const body = html
      .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&amp;|&quot;|&#39;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000);
    return [title && "العنوان: " + title, desc && "الوصف: " + desc, body].filter(Boolean).join("\n");
  } catch (e) {
    return "";
  }
}

function aiText(r) {
  if (!r) return "";
  if (typeof r === "string") return r;
  if (typeof r.response === "string") return r.response;
  const ch = r.choices && r.choices[0];
  if (ch) {
    const m = ch.message && ch.message.content;
    if (typeof m === "string") return m;
    if (Array.isArray(m)) return m.map((x) => x.text || "").join("");
    if (typeof ch.text === "string") return ch.text;
  }
  if (Array.isArray(r.output)) {
    return r.output
      .filter((o) => o.type === "message")
      .flatMap((o) => o.content || [])
      .map((c) => c.text || "")
      .join("");
  }
  if (r.result) return aiText(r.result);
  return "";
}

async function workersAI(model, payload, env) {
  if (!env.AI) return json({ error: { message: "Workers AI binding (AI) is not set in Cloudflare" } }, 501);
  const body = JSON.parse(new TextDecoder().decode(payload) || "{}");
  const gc = body.generationConfig || {};

  let system = partsText(body.systemInstruction);
  if (/json/i.test(gc.responseMimeType || ""))
    system += "\n\nمهم: أخرج JSON صالح فقط، بدون أي شرح وبدون ``` حوله.";
  system += "\nاكتب بالعربية الفصحى المناسبة للسوق السعودي.";

  const messages = [{ role: "system", content: system.trim() }];
  for (const c of body.contents || []) messages.push({ role: c.role === "model" ? "assistant" : "user", content: partsText(c) });

  // أداة قراءة الروابط مش موجودة هنا: نقرا أول رابط في الطلب بنفسنا ونحطه في الرسالة
  const wantsUrl = (body.tools || []).some((t) => t.url_context || t.urlContext || t.google_search || t.googleSearch);
  const last = messages[messages.length - 1];
  if (wantsUrl && last && last.role === "user") {
    const m = /https?:\/\/[^\s"'<>]+/i.exec(last.content);
    if (m) {
      const page = await readPage(m[0]);
      last.content += page
        ? `\n\nمحتوى صفحة الرابط (${m[0]}) كما قرأناه:\n<<<PAGE\n${page}\nPAGE>>>`
        : `\n\n(مقدرناش نفتح الرابط ${m[0]} — اعتمد على الرابط والمعلومات المتاحة فقط ولا تخترع.)`;
    }
  }

  const max = Math.min(Number(gc.maxOutputTokens) || 4096, 16000);
  let r;
  try {
    r = await env.AI.run(model, { messages, max_tokens: max, temperature: typeof gc.temperature === "number" ? gc.temperature : 0.6 });
  } catch (e) {
    const msg = String((e && e.message) || e);
    // خلّص الحد المجاني اليومي (بيتجدد 00:00 UTC = 3 الفجر بتوقيت السعودية)
    if (/neuron|allocation|4006|quota|daily/i.test(msg)) return json({ error: { message: "Workers AI daily free limit: " + msg.slice(0, 160) } }, 429);
    return json({ error: { message: "Workers AI: " + msg.slice(0, 200) } }, 503);
  }
  const text = aiText(r).trim();
  if (!text) return json({ error: { message: "Workers AI returned empty text" } }, 503);
  return json({ candidates: [{ content: { role: "model", parts: [{ text }] }, finishReason: "STOP" }], modelVersion: model });
}
