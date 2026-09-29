# Plan — Address Book redesign

Shared working plan for both of us to track progress through the assignment.
This is the single source of truth for the plan (folded in what was
previously a separate `ROADMAP.md`).

**Standing rule for every step below:** before we treat any piece of code as
done or commit it, review it for accessibility as an expert would — semantic
HTML, correct labeling, keyboard operability, focus/reading order, ARIA
correctness. Flag issues or possible improvements before finalizing; don't
silently fix or silently let something slide. See `CLAUDE.md` for the full
standing instruction.

---

## 1. Understand the baseline

- [x] Read every component: `AddressBook.tsx`, `AddressList.tsx`,
      `AddressItem.tsx`, `SearchBar.tsx`, `AddressContext.tsx`,
      `data/addresses.ts`, `pages/AddressItemPage.tsx`.
- [ ] Actually run `yarn dev` and click through the live app — we've only read
      the code so far, never run it. Confirm it matches what the source
      implies (plain input, plain filtering, plain card links, no styling
      beyond base Tailwind, no accessibility affordances, no motion).
- [ ] Confirm what must be preserved: the route structure (`/` and `/:id`),
      `AddressProvider`/context shape, the `Address` interface fields
      (`id, name, address, city, state, zip` — no separate first/last name,
      no phone/"mobile" field like the prototype assumed).

## 2. Translate the prototype

- [ ] **Map prototype → real components.** `contacts/index.html`'s pieces and
      where they'd land:
      - WeMate brand/header block → new header markup inside `AddressBook.tsx`.
      - Search input treatment → `SearchBar.tsx`.
      - Avatar + initials + contact row → `AddressItem.tsx`.
      - Letter-grouped sections with sticky headers → grouping logic in
        `AddressList.tsx` (new — doesn't exist today, list is currently flat).
      - The A-Z drag-to-scrub rail → **not mapped yet, decision below.**
- [ ] **Decide what's reused vs. changed vs. created** — the one real
      trade-off call, flag before deciding rather than assuming:
      - Letter-grouped sticky headers: reuse the *pattern*, worth it even at
        15-20 items (still legible, still the requested "contact
        organisation").
      - The full drag-scrub A-Z rail: this earns its complexity at hundreds
        of contacts, not 15-20. Recommend leaving it out of the interactive
        build and mentioning it in `NOTES.md` as a scale-dependent idea for
        "what I'd do with more time" — but this is your call, not mine to
        make silently.
      - Avatar color/initials logic: portable almost as-is (same hash → palette
        approach), just re-fed from `name` instead of `first`/`last`.
- [ ] **Establish the styling system.** Port the prototype's design tokens
      (`--ink`, `--ink-soft`, `--line`, `--accent`, the avatar palette, the
      type scale) into the real app — either Tailwind theme extension
      (`tailwind.config`) or CSS custom properties in `index.css`, replacing
      the current one-off Tailwind utility classes (`border-gray-300`, etc.).
- [ ] **Implement layout, responsive behavior, contact organisation.** The
      prototype was a fixed 390px phone-frame mockup; the real app needs an
      actual responsive layout (currently just `max-w-lg` centered). Build
      the letter-grouped list against real, variable-length data.
- [ ] **Adapt anything that conflicts with accessibility or the available
      data.** Concretely: the prototype's secondary line under each name was
      static placeholder text ("mobile") — this app's data has no such field,
      so decide what real secondary text shows (street address is the obvious
      candidate). Also: prototype's rail interaction pattern has real
      keyboard/reduced-motion gaps we already found — don't port those gaps
      forward.

## 3. Complete the product behavior

- [ ] Improve search and filtering — decide scope (name only, matching
      current behavior, vs. name + address/city).
- [ ] Add interface states and feedback — empty state, focus states, live
      region for result count.
- [ ] Wire the prototype's interactions to real application state — grouping,
      filtering, and counts all derived from context data + live search
      state, not a static mock array.

**Priority breakdown for phases 3-4** (folded in from the earlier
`ROADMAP.md`, scope target: 3-4 hours per the brief, judgment over quantity):

*Do well first:*
1. Expand the mock dataset (~15-20 entries) — 5 items can't demonstrate a
   filtering experience; this is prep work, not a feature.
2. Animated filter transitions on the list — the highest-value item, since
   it's the one place in the current app with literally zero motion.
3. Match highlighting — bold/mark the matched substring in each result.
4. Accessible search input — label, live region announcing result count,
   visible focus rings on input and card links.
5. `prefers-reduced-motion` handling for everything added in (2).
6. Empty state ("No results for '{query}'"), animated consistently with (2),
   not a hard cut.

*If time remains:*
7. Debounce the live-region announcement (not necessarily the filter itself —
   moot performance-wise at this data size).
8. Clear ("×") button in the search input.
9. Press/hover state on result cards.
10. Keyboard roving between results (arrow keys) — nice-to-have.

*Explicitly out of scope* (would be over-engineering at this data size): full
CRUD/maps/auth/large routing changes (excluded by the brief), virtualization.

## 4. Polish the experience

- [ ] Refine visual hierarchy, spacing, responsive behavior.
- [ ] Add purposeful micro-interactions and motion — list filter
      enter/exit, match highlighting, press/hover states.
- [ ] Handle `prefers-reduced-motion` and layout stability (no unexpected
      shift/jank when the list re-filters) — build this in from the start
      this time, not bolted on after, per what we relearned on the prototype.

## 5. Think about the contact detail

- [ ] `AddressItemPage.tsx` is currently bare — decide how much it deserves
      relative to the list (brief excludes large routing changes, so: keep
      the route/structure, but bring visual consistency — shared avatar/color
      logic, maybe a simple entrance transition). Don't over-invest here; the
      brief's focus is search/filtering, not the detail view.

## 6. Verify the result

- [ ] Accessibility review across the full flow: search → filtered list →
      detail page → back.
- [ ] Test keyboard navigation, responsive behavior at a few widths, and
      search/filter behavior (including empty query, no-match query, rapid
      typing).
- [ ] Run the build (`yarn build`) and typecheck; inspect the console for
      warnings/errors.
- [ ] Review the final diff end to end before calling it done.

## 7. Document

- [ ] Complete `NOTES.md`'s four sections: what I focused on and why, what I
      changed, accessibility considerations, tradeoffs/decisions, what I'd
      improve with more time (include the A-Z rail idea here if we cut it).
- [ ] Record decisions/tradeoffs/limitations as we go, not all at the end —
      easier to write NOTES.md accurately that way.
- [ ] Push to a new repo via "Use this template," add `georgewrmarshall`,
      `n3ps`, `AndyMBridges` as collaborators, and share the link (per the
      README — no PR against the template repo).
