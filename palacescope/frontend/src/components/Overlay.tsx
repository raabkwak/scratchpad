import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../lib/api";
import type { Memory, Room } from "../types/palace";

export function Overlay({ selected, stats }: { selected?: Room; stats?: { wings: number; halls: number; rooms: number; memories: number } }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    const { data } = await api.get<{ results: Memory[] }>("/search", { params: { q: query } });
    setResults(data.results);
    setIsSearching(false);
  }

  return (
    <div className="overlay">
      <header>
        <h1>PalaceScope</h1>
        <p>Live 3D navigator for MemPalace</p>
      </header>

      <section className="stats">
        <div>
          <strong>Wings</strong>
          <span>{stats?.wings ?? "—"}</span>
        </div>
        <div>
          <strong>Halls</strong>
          <span>{stats?.halls ?? "—"}</span>
        </div>
        <div>
          <strong>Rooms</strong>
          <span>{stats?.rooms ?? "—"}</span>
        </div>
        <div>
          <strong>Memories</strong>
          <span>{stats?.memories ?? "—"}</span>
        </div>
      </section>

      <section>
        <form onSubmit={handleSearch} className="search">
          <input value={query} placeholder="Search memories" onChange={(e) => setQuery(e.target.value)} />
          <button type="submit" disabled={isSearching}>{isSearching ? "…" : "Search"}</button>
        </form>
        {results.length > 0 && (
          <ul className="results">
            {results.map((memory) => (
              <li key={memory.id}>
                <strong>{memory.title}</strong>
                <p>{memory.summary}</p>
                <small>{new Date(memory.timestamp ?? Date.now()).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && (
        <section className="selected">
          <h2>{selected.label}</h2>
          <p>{selected.memories.length} memories</p>
          <div>
            {selected.memories.slice(-3).map((memory) => (
              <article key={memory.id}>
                <strong>{memory.title}</strong>
                <p>{memory.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
