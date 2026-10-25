import React from "react";
import { resolveLead } from "@/lib/lead-links";
import { fullPitch, shortPitch } from "@/lib/pitch";
import SendHubClient from "./SendHubClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SendHubPage(props: PageProps) {
  const { slug } = await props.params;
  const lead = await resolveLead(slug);

  const shortUrl = "/d/" + lead.slug;

  return (
    <SendHubClient
      slug={lead.slug}
      name={lead.name}
      city={lead.city}
      phone={lead.phone}
      cleanPhone={lead.phoneRaw}
      address={lead.address}
      logo={lead.logo}
      shortUrl={shortUrl}
      safePitch={shortPitch(lead, shortUrl)}
      fullPitch={fullPitch(lead, shortUrl)}
    />
  );
}

