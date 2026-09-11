# Project Structure

Project type: single-repository JavaScript application with a React/Vite browser client and an
Express HTTP server. The UI is a six-step entrepreneur assessment plus an officer dashboard.

Functional domains: onboarding/profile, geolocation and competitor discovery, market indicators,
rule-based advisory, financial structuring, scheme matching, assessment persistence, and PDF export.

Layers: `components/` and `context/` are presentation/state; `services/api.js` is the browser
client boundary; `routes/api.js` is the HTTP boundary; `db.js`, `engine.js`, and data files are
in-memory/domain services; `pdfservice.js` is document output.
