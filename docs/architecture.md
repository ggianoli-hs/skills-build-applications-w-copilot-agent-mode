# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the four capability pages as routed React components. Use the shared API client with relative `/api` paths (and its existing `VITE_API_BASE_URL` override); each page handles loading, API-error, and meaningful empty states without implementing domain rules.
- Logic tier decision: Keep HTTP handling in Express routes and capability behavior in the service layer. Validate inputs and referenced records before writes, return deliberate 4xx responses for invalid or unknown resources, and avoid exposing database cast errors as 500s.
- Data tier decision: Use the existing Mongoose models and references for users, teams, activities, and workouts. Seed representative fixtures idempotently without deleting or rewriting unrelated records.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and positive `minutes`; require valid IDs referencing existing user and team records. Compute `points` and `occurredAt` on the server and persist them with the activity.
- Team management approach: Require a non-empty team name, preserve the submitted name and mascot, and store members as user references; list and create teams through the API.
- Leaderboard approach: Sum activity points per team, sort by total points descending, and return each team name, total, and 1-based rank.
- Workout suggestions approach: Look up the user by email and use the user's fitness goal and recent activity to order matching workouts. Include a reason with each suggestion, ensure the first suggestion reflects the goal or recent activity, and return a deliberate 4xx when the user is unknown.

## Test plan

- `npm run test:data --prefix octofit-tracker/backend` — checks Mongoose required fields, references/defaults, and safe, idempotent seeding. A failure points to schema or seed behavior.
- `npm run test:api --prefix octofit-tracker/backend` — checks activity and team validation and persistence, leaderboard totals/order/ranks, and user-specific workout suggestions including unknown-user handling. A failure points to route/service behavior or its API contract.
- `npm test --prefix octofit-tracker/frontend` — checks that routed pages render API data and provide accessible loading, empty, and error states. A failure points to presentation or API-client integration.
- `npm run build --prefix octofit-tracker/backend` — runs the backend TypeScript type check; a failure indicates backend types or imports do not compile.
- `npm run build --prefix octofit-tracker/frontend` — runs the frontend TypeScript check and Vite production build; a failure indicates frontend type or production-bundling issues.
