import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = Record<string, unknown>;

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ teams?: Team[] }>('/api/teams')
      .then((response) => {
        if (active) setTeams(Array.isArray(response.teams) ? response.teams : []);
      })
      .catch(() => {
        if (active) setError('Unable to load data. Please try again.');
      });
    return () => { active = false; };
  }, []);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Teams</h2>
    <p>Manage teams and members.</p>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {!error && teams === null && <p role="status">Loading teams...</p>}
    {!error && teams !== null && teams.length === 0 && <p>No teams found.</p>}
    {!error && teams !== null && teams.length > 0 && <ul className="list-group">
      {teams.map((team, index) => <li className="list-group-item" key={index}>
        {`${String(team.name)}${team.mascot ? ` - ${String(team.mascot)}` : ''}`}
      </li>)}
    </ul>}
  </div></section>;
}
