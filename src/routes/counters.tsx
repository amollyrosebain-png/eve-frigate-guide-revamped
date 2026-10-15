import { createFileRoute } from '@tanstack/react-router';
import FrigateCounters from '@/features/guide/FrigateCounters';

export const Route = createFileRoute('/counters')({
  validateSearch: (search: Record<string, unknown>): { ship?: string | undefined } => ({ ship: search['ship'] != null ? String(search['ship']) : undefined }),
  head: () => ({ meta: [
    { title: 'Counter Selector — EVE Frigate Damage Guide' },
    { name: 'description', content: 'Find the best frigate to fight any EVE Online frigate, based on live zKillboard solo kill data.' },
    { property: 'og:title', content: 'Counter Selector — EVE Frigate Damage Guide' },
    { property: 'og:description', content: 'See which hulls win most solo fights against your target frigate.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: CountersPage,
});
function CountersPage() {
  const { ship } = Route.useSearch();
  return <FrigateCounters targetId={ship ? Number(ship) : undefined} />;
}
