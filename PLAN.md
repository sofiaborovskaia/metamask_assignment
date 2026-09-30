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

## Decisions log

Record scope/product decisions here as they're made, not reconstructed later
for `NOTES.md`.

- **Design target is mobile; desktop is width-constrained, not a separate
  layout.** The build is designed and tested primarily at mobile widths
  (matching the prototype's phone-frame reference). Desktop doesn't get its
  own layout (no multi-column, no different information density) — it's the
  same mobile-oriented design centered with a `max-w-*` constraint, so it
  still looks intentional rather than a stretched mobile page, without the
  added scope of a true responsive redesign. Note for `NOTES.md`: state this
  explicitly as a scoping decision, not an oversight.

## 1. Understand the baseline

- [x] Read every component: `AddressBook.tsx`, `AddressList.tsx`,
      `AddressItem.tsx`, `SearchBar.tsx`, `AddressContext.tsx`,
      `data/addresses.ts`, `pages/AddressItemPage.tsx`.
- [x] Actually run `yarn dev` and click through the live app — we've only read
      the code so far, never run it. Confirm it matches what the source
      implies (plain input, plain filtering, plain card links, no styling
      beyond base Tailwind, no accessibility affordances, no motion).
- [x] Confirm what must be preserved: the route structure (`/` and `/:id`),
      `AddressProvider`/context shape, the `Address` interface fields
      (`id, name, address, city, state, zip` — no separate first/last name,
      no phone/"mobile" field like the prototype assumed).

## 2. Translate the prototype

Sub-steps, each committed separately as it lands:

1. [x] Design tokens ported into a Tailwind v4 `@theme` block (`index.css`) —
       accent/ink/line/avatar-palette/rail colors, Baloo 2 + Inter. Fonts are
       self-hosted and preloaded (not a Google Fonts runtime link) to avoid
       font-swap layout shift.
2. [x] Header simplified — Baloo 2 title, no WeMate brand row, no phone
       status bar/battery icons, no contact-count badge (explicit decision).
3. [x] Avatar (hashed color + initials) and address-as-sub-line in
       `AddressItem.tsx`, hashed on `name` (no separate first/last field).
4. [x] Letter-grouped list with sticky `<h2>` headings in `AddressList.tsx`
       (real `section`/heading semantics, not styled `div`s), oversized
       (72px) letter treatment and fade-gradient behind the sticky heading,
       matching the prototype's exaggerated scale per explicit direction.
5. [x] **The accessible A-Z rail**, in `AlphabetRail.tsx`. Revised decision:
       the rail is in scope as a main feature (overrides the earlier
       recommendation to cut it for scale reasons). Built as a real control,
       not a copy of the prototype's mouse/touch-only version — real
       focusable `<button>`s (native `disabled` for empty letters, not just
       `aria-disabled`), arrow-key roving with Home/End, drag-to-scrub
       layered on top as a progressive enhancement, `navigator.vibrate()`
       haptics (no-op on iOS, real on Android — see `NOTES.md` for why full
       iOS haptics aren't feasible), `prefers-reduced-motion` respected.
       Ports the prototype's actual bump mechanism (SVG blob + label
       overlay, eased glide, `.tab`/`.disabled`/`.hidden-by-bump`/`.stacked`
       class hooks) and its `IntersectionObserver` scroll-spy, rather than a
       simplified stand-in. Several real bugs found and fixed along the way
       (see commit `6f724db` for the full list) — notably native
       `scrollIntoView(smooth)` not animating reliably, and
       `preventDefault()` on `pointerdown` silently breaking real mouse
       clicks by suppressing the browser's own click event.
       Follow-up polish round (commit `507253b`): fixed backward jumps
       into short sections landing at the section's bottom instead of
       its top (was measuring the scroll target from the sticky heading
       instead of the non-sticky section — see commit for the full
       explanation); replaced the rough focus ring on the 72px heading
       with a springy landing bounce (Web Animations API, Josh Comeau's
       `linear()` technique) plus a lighter persistent underline,
       animating a dedicated inner glyph span so the heading's own
       fade-gradient background stays fixed instead of jumping with it.
6. [ ] Wire everything to real filtered data end-to-end, empty state,
       motion/reduced-motion pass across all of the above.

Avatar color/initials logic ported from the prototype's `colorFor`/`initials`
functions, adapted to hash on the single `name` field (prototype had
separate `first`/`last`).

**Search bar interactive redesign (`SearchBar.tsx`, outside the original
sub-step list above, done as a follow-up pass):** ported Codrops' "Kaede"
text input effect — the input sits absolutely positioned, hidden off-screen
at rest, and slides in on focus/fill while a real `<label>` (icon + "Search"
text, not a decorative div — a plain div would silently swallow clicks
since the input is transformed off-screen at rest) slides the other way,
ending as a small icon chip over the wrapper's own background on the right.
Active-state color has gone through a few iterations (orange tint read as a
warning/alert color; a border+shadow trick was rejected in favor of a real
background-color difference; currently a neutral `ink-soft` tint).

*Future refinement ideas for this interaction (not yet built):*
- Sequence the animation rather than running both halves at once: fade the
  "Search" text out fully first, then move the background/icon after a
  short delay, instead of everything animating simultaneously.
- Add a considered cubic-bezier easing to the background/icon move
  specifically (currently reuses the same curve as the input's slide;
  worth its own tuned curve).
- Keep iterating on the active-state colors — current neutral tint is a
  placeholder, not a final answer.

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

- [ ] Refine visual hierarchy and spacing at the mobile widths that are the
      actual design target (see Decisions log) — no separate desktop layout
      work here beyond confirming the width-constraint still reads fine.
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
- [ ] Test keyboard navigation, search/filter behavior (including empty
      query, no-match query, rapid typing), and confirm the desktop
      width-constraint (see Decisions log) still looks intentional rather
      than a stretched mobile page.
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
