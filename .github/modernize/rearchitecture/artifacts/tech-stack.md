# Technology Stack

- Runtime: Node.js with CommonJS server modules and browser ES modules.
- Frontend: React 18, Vite, Lucide icons, Leaflet loaded from OpenStreetMap-compatible assets.
- Backend: Express, Helmet, CORS, dotenv, jsPDF/autotable.
- Persistence: in-memory `SpatialDatabase`; no PostgreSQL/PostGIS adapter or migration exists.
- External services: Nominatim geocoding and Overpass competitor lookup are server-side and
  configurable through `.env`; Gemini is documented but no provider call is currently wired.
- Main blockers: bundled district/business catalog contains demo/reference data; official scheme
  records need periodic verification; authentication is demo-only and must not be used in production.
