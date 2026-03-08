# Context Graph Data Model

Tapestry OS treats every captured signal as an entity with explicit ownership, accessibility, provenance, and AI-readable metadata. The model remains append-only (event sourced) so we can always reconstruct why a link exists.

## Core Entities

| Entity | Purpose | Key Fields |
| --- | --- | --- |
| **Person** | Humans or AI agents participating in the tapestry | `handle`, `roles[]`, `consent_profile`, `owners[]`, `visibility`, `presence_status`, `llm_hints` |
| **Workspace** | Containers for initiatives, collectives, or personal gardens | `name`, `purpose`, `owners[]`, `access_policy`, `attention_budget`, `rituals[]` |
| **Artifact** | Conceptual objects (products, specs, prototypes) | `title`, `kind`, `uri`, `checksum`, `linked_assets[]`, `stewards[]`, `maturity_level`, `llm_hints` |
| **Asset** | Concrete files or external links | `label`, `uri`, `provider`, `media_type`, `size`, `checksum`, `owners[]`, `retention`, `ai_readability_score` |
| **Principle** | Beliefs, heuristics, or guardrails | `statement`, `steward`, `maturity`, `exceptions`, `owners[]`, `visibility` |
| **Event** | Time-bound happenings | `title`, `ritual`, `window`, `participants[]`, `summary`, `outcomes[]`, `owners[]`, `visibility` |
| **Thread** | Conversational streams (Matrix, email, Signal) | `channel_type`, `uri`, `workspace`, `participants[]`, `message_count`, `last_activity`, `owners[]` |
| **Knowledge Node** | Synthesized insight, brief, or decision reenactment | `title`, `source_refs[]`, `confidence`, `steward`, `revision_chain`, `owners[]`, `visibility`, `llm_hints` |
| **Automation** | Bot or workflow acting inside the tapestry | `name`, `capabilities`, `triggers`, `owners[]`, `audit_log_uri`, `risk_level`, `safeguards[]` |
| **Consent Token** | Grant of scoped access to agents or collaborators | `grantee`, `scope`, `expires_at`, `revocations[]`, `audit_ref`, `issued_by`, `owners[]` |

All entities include:

- `id` (stable ULID)
- `created_at`, `updated_at`
- `owners[]` (person ids)
- `visibility` (`private`, `shared`, `public`, or policy reference)
- `access_matrix` (read/reference/remix/automate tiers)
- `lineage` (`created_by`, `derived_from[]`)
- `annotations[]` (LLM-system notes or human comments)

## Relations (Edges)

Edges are first-class objects so we can attach provenance and AI hints:

| Relation | Description | Example Metadata |
| --- | --- | --- |
| `influences` | Entity A shaped Entity B | `confidence`, `asserted_by`, `evidence[]` |
| `depends_on` | B cannot proceed without A | `criticality`, `fallbacks[]` |
| `references` | Narrative cites an asset/thread | `quoted_text`, `context_window` |
| `belongs_to` | Membership in workspace or ritual | `since`, `role` |
| `contradicts` | Two knowledge nodes disagree | `resolution_status`, `mediator` |
| `supersedes` | New commitment replaces old | `effective_at`, `reason` |

Every edge log entry captures:

- `timestamp`
- `who asserted`
- `consent_token` used
- `verification_state` (`draft`, `verified`, `stale`)
- `llm_hints` so agents can explain why the link exists.

## Metadata for AI Traversal

- **Embeddings**: store per entity + per narrative chunk with model fingerprint + dimensionality.
- **Facet tags**: controlled vocabulary (e.g., `ritual:daily-weave`, `energy:low`).
- **AI notes**: plain-text rationale for why data matters; LLMs surface this as citations.
- **Attention signals**: `last_reviewed`, `pending_questions`, `open_loops`.

## Ownership & Accessibility

Use policy objects so anything can reference a reusable access rule:

```json
{
  "policy_id": "workspace:neon-pulse",
  "read": ["person:rk", "workspace:neon-pulse"],
  "reference": ["person:lumen"],
  "remix": ["automation:context-curator"],
  "automate": ["automation:context-curator"],
  "notes": "Public excerpts allowed; raw assets stay internal."
}
```

Entities reference either inline `visibility` (`public`, `shared`, `private`) or a `policy_id` for fine-grained control.

## Event Sourcing & Storage

- Append-only `event_store` logs changes.
- CRDT snapshots provide local-first operation.
- Columnar lake (Iceberg/Delta) stores materialized views for analytics + AI training windows.

This model keeps humans in control (owners + policies), while giving AI context (llm hints, annotations, embeddings) to navigate and explain the graph.
