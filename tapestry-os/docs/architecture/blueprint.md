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

## Data Model Snapshot
| Entity | Key Fields |
| --- | --- |
| Person | handle, roles, consent profile |
| Artifact | type, URI, checksum |
| Principle | statement, steward, maturity level |
| Moment | timestamp, location, ritual |

Relations carry provenance (who asserted, when, confidence).

## Technical Bets
- **Rust-based event store** with CRDT support for offline capture.
- **GraphQL Federation** so third-party tools can extend the schema safely.
- **Local-first clients** using IndexedDB/SQLite replicas + background sync.
