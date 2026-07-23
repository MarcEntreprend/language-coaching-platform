// components/OrganizationJsonLd.tsx
import JsonLd from "./JsonLd";

export default function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Speak with Marc",
        url: siteUrl,
        description: "Coaching d'anglais individuel pour adultes, en ligne.",
      }}
    />
  );
}
