import { NextResponse } from "next/server";
import { resolveLead, originFromRequest } from "@/lib/lead-links";
import { fullPitch, demoUrl } from "@/lib/pitch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const lead = await resolveLead(slug);
    const link = demoUrl(originFromRequest(req), lead.slug);
    const text = fullPitch(lead, link);

    const tgUrl = lead.phoneRaw
      ? "tg://resolve?phone=" + lead.phoneRaw + "&text=" + encodeURIComponent(text)
      : "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(text);

    const html = [
      "<!DOCTYPE html>",
      '<html lang="ru">',
      "<head>",
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "<title>Сообщение для " + escapeHtml(lead.name) + "</title>",
      "<style>",
      "  :root{color-scheme:dark}",
      "  *{box-sizing:border-box}",
      '  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:#0a0b0d;color:#f6f6f4;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
      "  .card{width:100%;max-width:460px;background:#111317;border:1px solid rgba(255,255,255,.09);border-radius:24px;padding:28px;box-shadow:0 30px 80px -40px #000}",
      "  .badge{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#34d399;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);border-radius:999px;padding:6px 11px}",
      "  h1{font-size:19px;line-height:1.25;letter-spacing:-.02em;margin:18px 0 6px}",
      "  p{font-size:13px;line-height:1.6;color:#9aa0a8;margin:0}",
      "  .preview{margin:20px 0;padding:14px;border-radius:14px;background:#0a0b0d;border:1px solid rgba(255,255,255,.07);font-size:12px;line-height:1.6;color:#c9cdd3;white-space:pre-wrap;max-height:168px;overflow:auto}",
      "  .btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:48px;border:0;border-radius:999px;background:#2aabee;color:#fff;font-size:14px;font-weight:700;text-decoration:none;cursor:pointer}",
      "  .btn.secondary{margin-top:9px;background:#15171c;border:1px solid rgba(255,255,255,.1);color:#f6f6f4}",
      "  .hint{margin-top:12px;text-align:center;font-size:11px;color:#737a83}",
      "  .logo{width:44px;height:44px;border-radius:12px;object-fit:contain;background:#0a0b0d;border:1px solid rgba(255,255,255,.1);padding:4px}",
      "  .head{display:flex;align-items:center;gap:12px}",
      "</style>",
      "</head>",
      "<body>",
      '<main class="card">',
      '<div class="badge">Сообщение готово</div>',
      '<div class="head" style="margin-top:18px">',
      lead.logo
        ? '<img class="logo" src="' + escapeHtml(lead.logo) + '" alt="">'
        : '<div class="logo"></div>',
      "<div>",
      "<h1>" + escapeHtml(lead.name) + "</h1>",
      "<p>" + escapeHtml([lead.city, lead.phone].filter(Boolean).join(" · ")) + "</p>",
      "</div>",
      "</div>",
      '<p style="margin-top:16px">Откроем чат с клиентом. Если текст не подставится сам — нажмите «Скопировать текст» и вставьте его в поле ввода.</p>',
      '<div class="preview">' + escapeHtml(text) + "</div>",
      '<a class="btn" href="' + escapeHtml(tgUrl) + '" id="tg">Показать клиенту его будущий сайт</a>',
      '<button class="btn secondary" type="button" id="copy">Скопировать текст</button>',
      '<p class="hint" id="hint">Telegram не открылся? Скопируйте текст и отправьте его вручную.</p>',
      "</main>",
      "<script>",
      "  var text = " + JSON.stringify(text) + ";",
      "  function copy(){ if(navigator.clipboard){ navigator.clipboard.writeText(text).then(function(){ document.getElementById('hint').textContent='Текст скопирован'; }); } }",
      "  copy();",
      "  document.getElementById('copy').addEventListener('click', function(e){ e.preventDefault(); copy(); });",
      "  setTimeout(function(){ window.location.href = " + JSON.stringify(tgUrl) + "; }, 700);",
      "</script>",
      "</body>",
      "</html>",
    ].join("\n");

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Telegram gateway error:", err);
    return NextResponse.redirect(new URL("/", req.url), 307);
  }
}

