import { NextResponse } from "next/server";
import { resolveLead, originFromRequest } from "@/lib/lead-links";
import { fullPitch, demoUrl } from "@/lib/pitch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const lead = await resolveLead(slug);
    const reqUrl = new URL(req.url);
    const isApp = reqUrl.searchParams.get("app") === "1";

    const link = demoUrl(originFromRequest(req), lead.slug);
    const text = fullPitch(lead, link);

    if (!lead.phoneRaw) {
      return NextResponse.redirect(
        new URL("/send/" + lead.slug + "?missing=phone", req.url),
        307
      );
    }

    const target = isApp
      ? "https://api.whatsapp.com/send?phone=" + lead.phoneRaw + "&text=" + encodeURIComponent(text)
      : "https://web.whatsapp.com/send?phone=" + lead.phoneRaw + "&text=" + encodeURIComponent(text);

    return NextResponse.redirect(target, 307);
  } catch (err) {
    console.error("WhatsApp gateway error:", err);
    return NextResponse.redirect(new URL("/", req.url), 307);
  }
}

