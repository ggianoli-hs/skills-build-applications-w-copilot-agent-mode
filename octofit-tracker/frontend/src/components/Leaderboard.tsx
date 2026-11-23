import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = Record<string, unknown>;

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard?: LeaderboardEntry[] }>('/api/leaderboard')
      .then((response) => {
        if (active) setEntries(Array.isArray(response.leaderboard) ? response.leaderboard : []);
      })
      .catch(() => {
        if (active) setError('Unable to load data. Please try again.');
      });
    return () => { active = false; };
  }, []);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Leaderboard</h2>
    <p>Compare team point totals.</p>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {!error && entries === null && <p role="status">Loading leaderboard...</p>}
    {!error && entries !== null && entries.length === 0 && <p>No leaderboard rankings found.</p>}
    {!error && entries !== null && entries.length > 0 && <ul className="list-group">
      {entries.map((entry, index) => <li className="list-group-item" key={index}>
        {`#${String(entry.rank)} ${String(entry.teamName)} - ${String(entry.totalPoints)} points`}
      </li>)}
    </ul>}
  </div></section>;
}
