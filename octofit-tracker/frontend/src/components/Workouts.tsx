import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Suggestion = Record<string, unknown>;

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ suggestions?: Suggestion[] }>('/api/workouts/suggestions/mona@example.com')
      .then((response) => {
        if (active) setSuggestions(Array.isArray(response.suggestions) ? response.suggestions : []);
      })
      .catch(() => {
        if (active) setError('Unable to load data. Please try again.');
      });
    return () => { active = false; };
  }, []);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Workout suggestions</h2>
    <p>Recommend workouts from activity patterns.</p>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {!error && suggestions === null && <p role="status">Loading workout suggestions...</p>}
    {!error && suggestions !== null && suggestions.length === 0 && <p>No workout suggestions found.</p>}
    {!error && suggestions !== null && suggestions.length > 0 && <ul className="list-group">
      {suggestions.map((suggestion, index) => <li className="list-group-item" key={index}>
        {`${String(suggestion.title)} - ${String(suggestion.reason)}`}
      </li>)}
    </ul>}
  </div></section>;
}
