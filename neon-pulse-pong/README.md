# Neon Pulse Pong

A tiny retro, neon-themed Pong clone for the browser.

## How to Run
Open `index.html` in any modern browser. No build tools required.

## Controls
- **Player Left (W/S)**: Move paddle up/down
- **Player Right (Up/Down arrows)**: Move paddle up/down
- **Space**: Start or pause the game
- **R**: Reset scores
- **Ball Speed Selector / Keys 1–5**: Choose how fast the ball should travel (Chill → Chaos)

## Notes
- Ball speeds up slightly after each paddle hit.
- Matches are first to 10 by default; tweak `WIN_SCORE` in `main.js` to change it.
- Speed selector rescales the ball velocity live (no refresh needed). Number keys 1–5 map to the same presets for fast toggling.
