import { createFileRoute } from '@tanstack/react-router';
import FrigateComparison from '@/features/guide/FrigateComparison';

export const Route = createFileRoute('/compare')({
  validateSearch: (search: Record<string, unknown>): { hulls?: string | undefined } => ({ hulls: typeof search['hulls'] === 'string' ? search['hulls'] : undefined }),
  head: () => ({ meta: [
    { title: 'Frigate Comparison — EVE Frigate Damage Guide' },
    { name: 'description', content: 'Compare EVE Online frigates side by side with shared weapon damage calculations, ammunition recommendations, SDE resistances and Yearbook tactical stats.' },
    { property: 'og:title', content: 'Frigate Comparison — EVE Frigate Damage Guide' },
    { property: 'og:description', content: 'Review up to four frigates side by side with original damage calculations, resistances and tactical profiles.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: ComparisonPage,
});
function ComparisonPage() {
  const { hulls } = Route.useSearch();
  return <FrigateComparison initialIds={hulls?.split(',').map(Number) ?? []} />;
}