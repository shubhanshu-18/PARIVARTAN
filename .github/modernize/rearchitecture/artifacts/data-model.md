# Data Model

Entities observed: entrepreneur profile, district reference, business/competitor observation,
scheme record, financial assessment, advisory result, and saved assessment/report payload.

Relationships: an assessment embeds one profile, market result, advisory result, financial result,
and ranked schemes. A market result references one location and many nearby businesses. A scheme
contains eligibility and document metadata.

Persistence note: all server entities are process-local arrays; restart loses assessments. District
population values are historical reference indicators and must be labeled as such.
