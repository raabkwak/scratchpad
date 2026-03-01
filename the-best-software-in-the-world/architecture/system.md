# System Architecture

```
┌─────────────────────────────────────────────┐
│  EXPERIENCE LAYER                           │
│  - Canvas UI                                │
│  - Conversational surfaces                  │
│  - Automation dashboards                    │
├───────────────────────────┬─────────────────┤
│  INTELLIGENCE FABRIC      │ DATA MESH       │
│  - Reasoning agents       │  - Context graph│
│  - Policy engine          │  - Memory store │
│  - Simulation sandbox     │  - Event log    │
├───────────────────────────┴─────────────────┤
│              PLATFORM SERVICES              │
│  Auth · Billing · Observability · Exports   │
└─────────────────────────────────────────────┘
```

## Key Modules
- **Reasoning Kernel:** orchestrates AI models + symbolic rules.
- **Context Graph:** captures relationships between people, topics, decisions.
- **Transparency API:** exposes every inference with citations + ethical checks.
- **Experience SDK:** allows teams to build bespoke UIs on top of the same foundation.

## Technical Bets
- Event-sourced backbone for perfect auditability.
- WASM sandbox for user-provided automations.
- Model-agnostic reasoning layer (swap GPT, Claude, local LMs seamlessly).
