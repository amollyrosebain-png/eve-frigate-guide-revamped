import { createFileRoute } from "@tanstack/react-router";
import FrigateGuide from "@/features/guide/FrigateGuide";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "EVE Frigate Damage Guide v01 — Yearbook Enhanced" },
    { name: "description", content: "Explore 101 EVE Online frigates with CCP SDE resistances, Faction Warfare Yearbook profiles, and weakness-aware ammunition recommendations." },
    { property: "og:title", content: "EVE Frigate Damage Guide — Yearbook Enhanced" },
    { property: "og:description", content: "Compare frigate resistances and find ammunition recommendations backed by CCP SDE and the Faction Warfare Yearbook." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FrigateGuide,
});
