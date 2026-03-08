# System Blueprint

```
┌──────────────────────────────────────────────┐
│ USER SURFACES                                │
│  - Weaver Journal (web, mobile)              │
│  - Ritual Studio (scheduled briefings)       │
│  - Graph Explorer (3D, CLI)                  │
├──────────────────────────────────────────────┤
│ EXPERIENCE ENGINE                            │
│  - Presence + co-editing layer               │
│  - Narrative compiler                        │
│  - Ritual scheduler                          │
├───────────────┬──────────────────────────────┤
│ CONTEXT GRAPH │ INTERFACES                   │
│  - Entities: people, artifacts, principles   │
│  - Relations: influenced, depends_on, etc.   │
│  - Event log (event sourcing)                │
│  - Time slicing views                        │
│                                               │
│  - API gateways (GraphQL + gRPC)             │
│  - Stream adapters (webhooks, Kafka, Matrix) │
├───────────────┴──────────────────────────────┤
│ PLATFORM CORE                                │
│  - Identity / consent service                │
│  - Policy + ethics engine                    │
│  - Observability + carbon meter              │
│  - Storage (append-only + columnar lake)     │
└──────────────────────────────────────────────┘
```

## New Supporting Services
- **Asset Registry** – normalizes metadata for any URI (Drive, IPFS, S3, Notion) and keeps checksums, previews, and provider permissions.
- **Link Orchestrator** – stores relations as first-class nodes with intent (`supports`, `contradicts`, `depends_on`), evidence, and verification states.
- **Context Curator API** – GraphQL/JSON-LD responses optimized for AI traversal with embeddings, citations, and access guards.
- **Consent Token Vault** – issues auditable capability tokens so automations/LLMs only traverse approved subgraphs.

## Data Model Snapshot
See `docs/architecture/data-model.md` for the full schema spanning people, workspaces, artifacts, assets, principles, events, threads, knowledge nodes, automations, and consent tokens—each with ownership + accessibility baked in.

Relations carry provenance (who asserted, when, confidence) plus consent token references and verification status.

## Technical Bets
- **Rust-based event store** with CRDT support for offline capture.
- **GraphQL Federation** so third-party tools can extend the schema safely.
- **Local-first clients** using IndexedDB/SQLite replicas + background sync.
- **WebGL/WebGPU graph renderer** powering both the 2D dashboard and future 3D loom explorer.
