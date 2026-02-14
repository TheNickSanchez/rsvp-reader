# RSVP Reader — Project Report

## Overview

RSVP Reader is a speed reading application built on Rapid Serial Visual Presentation (RSVP), a technique developed by psychology professor Mary Potter. The app flashes words one at a time at a user-controlled pace, with a red "anchor letter" (the Optimal Recognition Point) that keeps the reader's eyes fixed in place — eliminating the saccadic eye movements that slow down traditional reading.

What makes this app different from basic RSVP demos is its training feedback loop: you read, you get quizzed, you see your *effective* speed (raw WPM × comprehension %), and you adjust. Speed without comprehension is meaningless, and this app makes that visible.

---

## Origin

Inspired by a Substack post by James Lucas (@jameslucasit) asking "Can you read 900 words per minute?" — which went viral in January 2026 alongside coverage from My Modern Met and Upworthy about RSVP reading techniques. The concept resonated because it makes an abstract skill (speed reading) immediately tangible and testable.

---

## Core Philosophy

### Speed is nothing without comprehension

The average person reads at 200–300 WPM. RSVP can push that to 600–900+ WPM by eliminating eye movement overhead. But the dirty secret of speed reading apps is that they rarely verify whether you actually *understood* what you read. Reading 900 words per minute while retaining 20% of the content gives you an effective speed of 180 WPM — worse than just reading normally.

This app introduces the concept of **Effective Reading Speed**: `raw WPM × comprehension %`. It's the metric that actually matters. The comprehension quiz after every session makes this real and honest.

### Training should feel like training

The adaptive speed training system is modeled after interval training in athletics. You start at a comfortable pace, and the app automatically ramps your WPM at configurable intervals — like a treadmill that gradually increases speed. The five training modes (Off, Gentle, Moderate, Aggressive, Sprint) let you calibrate the intensity.

The key insight: your brain adapts faster when pushed slightly beyond comfort. The quiz at the end tells you whether you pushed too far or found a productive edge.

### The feedback loop is the product

Read → Quiz → Score → Adjust → Repeat. This loop is the entire value proposition. Each session generates data: your WPM, comprehension %, effective speed, and training mode. Over multiple sessions, the history chart reveals your trajectory — are you getting faster while maintaining comprehension? That's the signal.

---

## Technical Architecture

### Component — Single-file React JSX

The app is a single React component (`rsvp-reader.jsx`) with no external dependencies beyond React itself. This was an intentional choice for portability — it can be dropped into any React project, rendered as a Claude artifact, or scaffolded into a standalone app with minimal setup.

**File:** `rsvp-reader.jsx`
**Framework:** React (hooks-based functional components)
**External dependencies:** None (just React)
**Fonts:** Google Fonts (Libre Baskerville, DM Mono) loaded via `<link>` tag
**API (optional):** Anthropic Messages API for AI-generated quiz questions on custom text

### Key Technical Decisions

**Optimal Recognition Point (ORP)**
Each word has an optimal fixation point — the letter your eye should focus on for fastest recognition. The algorithm maps word length to ORP position:
- 1–3 letters → position 0
- 4–5 letters → position 1
- 6–9 letters → position 2
- 10–13 letters → position 3
- 14+ letters → position 4

The ORP letter is rendered in red (#E34A39) and the entire word is translated horizontally so the ORP always aligns with the center guide line. This is the core perceptual trick that makes RSVP work.

**Punctuation-aware timing**
Not all words should display for the same duration. Sentence-ending punctuation (. ! ?) gets a 2.8× delay multiplier, semicolons/colons get 2.0×, commas get 1.6×, and dashes get 1.3×. This mimics the natural rhythm of reading and gives the brain time to process clause boundaries.

**Adaptive speed ramp**
The training modes use `setInterval` to bump the live WPM at regular intervals during reading. The ramp is displayed visually with a progress bar showing the climb from starting speed to current speed.

**AI-powered quiz generation**
For custom text, the app calls the Anthropic Messages API (Claude Sonnet) to generate 5 comprehension questions. The prompt instructs the model to return strict JSON with no markdown formatting, which is parsed client-side. Pre-built sample texts have hand-crafted questions to avoid API dependency for the default experience.

### State Management

All state is managed with React hooks (`useState`, `useRef`, `useCallback`). The app tracks:
- `wpm` / `liveWpm` — base speed vs. current speed (diverge during training ramps)
- `phase` — `"intro"` | `"reading"` | `"quiz"` controls which UI is rendered
- `sessionHistory` — array of session results for the progress chart
- Timer state via refs (`startTimeRef`, `pausedTimeRef`) for accurate elapsed time

---

## Design Language

### Aesthetic direction: Dark editorial minimalism

The visual identity draws from high-end editorial design and film title sequences. Everything serves focus — there is nothing decorative.

### Color palette

| Token | Value | Purpose |
|-------|-------|---------|
| Background | `#0D0B09` | Near-black, warmer than pure black |
| Text | `#E6E1D7` | Warm off-white, reduces contrast strain |
| Accent | `#E34A39` | Vermillion red — the ORP anchor color |
| Warm accent | `#E88C5A` | Amber — progress bars, speed ramp |
| Green | `#4ADE80` | Correct answers, high comprehension |
| Amber | `#F59E0B` | Medium comprehension |

### Typography

- **Display/reading:** DM Mono — monospace for consistent character width during RSVP (each letter occupies exactly the same space, essential for ORP alignment)
- **Body/UI copy:** Libre Baskerville — a refined serif that adds warmth and readability to the editorial feel
- **Sizing:** Uses `clamp()` for the main RSVP word to scale from mobile to desktop

### Texture and depth

- Subtle SVG noise grain overlay at 3% opacity gives the background organic texture
- The ORP guide line uses a gradient that fades from transparent to red and back, creating a subtle "notch" effect
- All transitions are eased at 0.2–0.3s for smooth state changes
- The quiz score ring uses SVG `stroke-dasharray` animation for a satisfying reveal

### Interaction patterns

- Keyboard-first: Space (play/pause), ↑↓ (speed), R (reset)
- Slider for WPM with custom-styled thumb
- Quiz answers animate green/red with 1.2s delay before advancing
- Training mode selector uses pill-style toggles

---

## App Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  INTRO   │────▶│ READING │────▶│  QUIZ   │────▶│ RESULTS │
│          │     │         │     │         │     │         │
│ Select   │     │ RSVP    │     │ 5 Qs    │     │ Score   │
│ text     │     │ display │     │ multiple│     │ ring    │
│ Set WPM  │     │ +train  │     │ choice  │     │ Eff WPM │
│ Training │     │ ramp    │     │         │     │ History │
└─────────┘     └─────────┘     └─────────┘     └────┬────┘
     ▲                                                │
     └────────────────────────────────────────────────┘
                        Continue
```

---

## Content Library

### Built-in texts (with hand-crafted quiz questions)

1. **The Great Gatsby (Opening)** — Literary prose, tests narrative comprehension
2. **Space Exploration** — Scientific exposition, tests factual recall of numbers and analogies
3. **Technology & AI** — Technical/conceptual, tests understanding of abstract ideas

### Custom text

Users can paste any text (articles, study material, documentation). If 30+ words, the app calls Claude Sonnet to generate contextual comprehension questions. This transforms it from a demo into a daily-use tool.

---

## Training Modes

| Mode | Ramp Rate | Interval | Best For |
|------|-----------|----------|----------|
| Off | — | — | Baseline measurement |
| Gentle | +25 WPM | Every 30s | Beginners, long sessions |
| Moderate | +50 WPM | Every 20s | Regular practice |
| Aggressive | +75 WPM | Every 15s | Pushing limits |
| Sprint | +100 WPM | Every 10s | Short bursts, ceiling testing |

---

## Session Metrics

Each completed session records:

- **Raw WPM** — the speed you read at (or ended at, for training mode)
- **Comprehension %** — quiz score (correct / total × 100)
- **Effective WPM** — raw WPM × comprehension %
- **Word count** — passage length
- **Training mode** — which ramp was active

The session history bar chart on the intro screen shows up to 12 recent sessions, color-coded by comprehension (green ≥80%, amber ≥60%, red <60%).

---

## Building Into a Web App

This JSX file is designed to be scaffolded into a full web app with Claude Code. Recommended approach:

### Scaffolding

```bash
# Vite + React is the fastest path
npm create vite@latest rsvp-reader -- --template react
cd rsvp-reader
# Copy rsvp-reader.jsx into src/
# Import as the default App component
```

### Enhancement roadmap

**Phase 1 — Core polish**
- Add persistent storage (localStorage or Supabase) for session history across page reloads
- URL/article import — paste a URL, extract text via readability parser
- epub/PDF import for book chapters
- PWA support for offline use

**Phase 2 — Training depth**
- Spaced repetition on comprehension errors (re-test missed concepts)
- Difficulty-adaptive WPM — auto-adjust based on rolling comprehension average
- Streak tracking and daily goals
- Multiple font/theme options for accessibility

**Phase 3 — Social/sharing**
- Shareable score cards (image export of session results)
- Leaderboards for effective WPM
- Reading challenges (e.g., "Read Pride and Prejudice in under 3 hours with 80%+ comprehension")

---

## File Structure

```
rsvp-reader/
├── rsvp-reader.jsx    # Complete app component (React)
└── README.md          # This document
```

---

## Credits

- **Concept:** Inspired by James Lucas's Substack post and the RSVP research of Mary Potter (MIT)
- **RSVP technique:** Rapid Serial Visual Presentation, coined by Mary Potter
- **ORP algorithm:** Based on Spritz reading technology research
- **Built with:** Claude (Anthropic) — design, code, and documentation
