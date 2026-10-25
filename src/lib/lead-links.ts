import { getDatabase, getDatabaseAsync } from "@/lib/db";
import { getDemoLead, demoPath, DemoLead } from "@/lib/demo-links";

export interface ResolvedLead {
  slug: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  phoneRaw: string;
  logo: string;
  map: string;
  url: string;
}

function fromStoredUrl(slug: string, url: string, fallbackName?: string): ResolvedLead {
  let name = fallbackName || "Автосервис";
  let city = "";
  let address = "";
  let phone = "";
  let logo = "";
  let map = "";

  try {
    const parsed = new URL(url, "http://localhost");
    name = parsed.searchParams.get("name") || name;
    city = parsed.searchParams.get("city") || "";
    address = parsed.searchParams.get("address") || "";
    phone = parsed.searchParams.get("phone") || "";
    logo = parsed.searchParams.get("logo") || "";
    map = parsed.searchParams.get("map") || "";
  } catch (e) {}

  return {
    slug,
    name,
    city,
    address,
    phone,
    phoneRaw: phone.replace(/\D/g, "").replace(/^8(?=\d{10}$)/, "7"),
    logo,
    map,
    url,
  };
}

function fromRegistry(lead: DemoLead): ResolvedLead {
  return {
    slug: lead.slug,
    name: lead.name,
    city: lead.city,
    address: lead.address,
    phone: lead.phone,
    phoneRaw: lead.phoneRaw,
    logo: lead.logo,
    map: lead.map,
    url: demoPath(lead),
  };
}

function titleFromSlug(slug: string): string {
  return (slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Ищет персональный демо-сайт: статический реестр → база → умный фолбэк.
 * Реестр гарантирует, что все ссылки из таблицы открываются корректно.
 */
export async function resolveLead(slugRaw: string): Promise<ResolvedLead> {
  const slug = decodeURIComponent(slugRaw || "").toLowerCase().trim();

  const registry = getDemoLead(slug);
  if (registry) return fromRegistry(registry);

  const local = getDatabase();
  const foundLocal = local.shortLinks?.find((l) => l.slug.toLowerCase() === slug);
  if (foundLocal?.url) return fromStoredUrl(slug, foundLocal.url, foundLocal.name);

  try {
    const remote = await Promise.race([
      getDatabaseAsync(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 1500)),
    ]);
    const foundRemote = remote?.shortLinks?.find((l) => l.slug.toLowerCase() === slug);
    if (foundRemote?.url) return fromStoredUrl(slug, foundRemote.url, foundRemote.name);
  } catch (e) {}

  const name = titleFromSlug(slug) || "Автосервис";
  return {
    slug,
    name,
    city: "",
    address: "",
    phone: "",
    phoneRaw: "",
    logo: "",
    map: "",
    url: "/?demo=1&name=" + encodeURIComponent(name),
  };
}

export function originFromRequest(req: Request): string {
  try {
    const url = new URL(req.url);
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto");
    if (forwardedHost) {
      return (forwardedProto || "https") + "://" + forwardedHost;
    }
    return url.origin;
  } catch (e) {
    return "https://vibe-rho-bay.vercel.app";
  }
}

