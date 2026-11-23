import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = Record<string, unknown>;

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ activities?: Activity[] }>('/api/activities')
      .then((response) => {
        if (active) setActivities(Array.isArray(response.activities) ? response.activities : []);
      })
      .catch(() => {
        if (active) setError('Unable to load data. Please try again.');
      });
    return () => { active = false; };
  }, []);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">Activities</h2>
    <p>Track student activity minutes and points.</p>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {!error && activities === null && <p role="status">Loading activities...</p>}
    {!error && activities !== null && activities.length === 0 && <p>No activities found.</p>}
    {!error && activities !== null && activities.length > 0 && <ul className="list-group">
      {activities.map((activity, index) => <li className="list-group-item" key={index}>
        {`${String(activity.type)} - ${String(activity.minutes)} minutes, ${String(activity.points)} points`}
      </li>)}
    </ul>}
  </div></section>;
}
