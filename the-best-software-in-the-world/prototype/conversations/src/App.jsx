import { useMemo, useState } from 'preact/hooks';

const suggestions = [
  {
    title: 'Traceability',
    body: 'Explain how this insight was produced and link to the underlying evidence.',
  },
  {
    title: 'Human Loop',
    body: 'Ask who should review this decision before it proceeds.',
  },
  {
    title: 'Impact Check',
    body: 'Model downstream effects on affected communities.',
  },
];

function ConversationCard({ entry }) {
  return (
    <article class="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3">
      <div class="text-accent text-xl">✺</div>
      <div>
        <p class="text-sm uppercase tracking-wider text-white/60">{entry.actor}</p>
        <p class="text-lg text-white/90">{entry.text}</p>
        <p class="text-xs text-white/40">{entry.timestamp}</p>
      </div>
    </article>
  );
}

export default function App() {
  const [entries, setEntries] = useState([
    {
      actor: 'Raab',
      text: 'How can we onboard 100 collaborators without diluting our ethos?',
      timestamp: 'Today · 10:02',
    },
    {
      actor: 'Lumen',
      text: 'Propose a ritual-based onboarding that layers context before permissions.',
      timestamp: 'Today · 10:03',
    },
  ]);
  const [draft, setDraft] = useState('');

  const curated = useMemo(() => suggestions.slice(0, 2), []);

  function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setEntries([
      ...entries,
      {
        actor: 'You',
        text: draft.trim(),
        timestamp: 'Now',
      },
    ]);
    setDraft('');
  }

  return (
    <div class="min-h-screen px-6 py-10 flex flex-col gap-8 max-w-5xl mx-auto">
      <header class="space-y-3">
        <p class="uppercase tracking-[0.4em] text-xs text-accent">Best Software Initiative</p>
        <h1 class="text-4xl font-semibold">Conversations Prototype</h1>
        <p class="text-lg text-white/70">
          Shared canvas where humans + AI braid context, decisions, and next steps.
        </p>
      </header>

      <section class="grid gap-4">
        {entries.map((entry) => (
          <ConversationCard entry={entry} />
        ))}
      </section>

      <form
        class="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <label class="text-sm uppercase text-white/60">Add to the thread</label>
        <textarea
          class="w-full mt-2 bg-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent"
          rows="4"
          placeholder="Capture a signal, a friction, or a next step…"
          value={draft}
          onInput={(e) => setDraft(e.target.value)}
        />
        <div class="mt-3 flex items-center justify-between text-sm text-white/60">
          <span>Suggestions auto-update as context grows.</span>
          <button
            type="submit"
            class="px-4 py-2 rounded-full bg-accent text-canvas font-semibold"
          >
            Publish insight
          </button>
        </div>
      </form>

      <aside class="grid gap-3 md:grid-cols-2">
        {curated.map((card) => (
          <div class="p-4 rounded-2xl border border-white/10 bg-white/5" key={card.title}>
            <p class="text-xs uppercase text-white/50">AI prompt</p>
            <h2 class="text-white text-lg font-semibold">{card.title}</h2>
            <p class="text-white/80 text-sm">{card.body}</p>
          </div>
        ))}
      </aside>
    </div>
  );
}
