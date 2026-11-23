import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  const email = 'mona@example.com';
  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    path={`/api/workouts/suggestions/${encodeURIComponent(email)}`}
    responseKey="suggestions"
    emptyText="No workout suggestions found."
    renderItem={(suggestion) => `${String(suggestion.title)} - ${String(suggestion.reason)}`}
  />;
}
