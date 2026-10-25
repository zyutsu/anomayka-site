import { NextResponse } from "next/server";
import { resolveLead, originFromRequest } from "@/lib/lead-links";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const reqUrl = new URL(req.url);
    const search = reqUrl.searchParams;

    // Прямая демо-ссылка с параметрами: сразу на главную.
    if (search.has("name") || search.has("demo") || search.has("d") || search.has("n")) {
      const target = new URLSearchParams(search);
      target.set("demo", "1");
      return NextResponse.redirect(new URL("/?" + target.toString(), req.url), 307);
    }

    const lead = await resolveLead(slug);

    if (lead.url.startsWith("http")) {
      return NextResponse.redirect(lead.url, 307);
    }

    return NextResponse.redirect(new URL(lead.url, originFromRequest(req)), 307);
  } catch (err) {
    console.error("Short link redirect error:", err);
    return NextResponse.redirect(new URL("/?demo=1", req.url), 307);
  }
}

