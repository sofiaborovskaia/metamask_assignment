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
       `aria-disabled`), each letter its own tab stop (with a skip link ahead of the rail), arrow keys/Home/End as shortcuts, type-to-jump, drag-to-scrub
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
       `linear()` technique) (the underline was later removed, see `NOTES.md`),
       animating a dedicated inner glyph span so the heading's own
       fade-gradient background stays fixed instead of jumping with it.
       Later round: sticky title + search (jumps land under them), the rail
       made `position: fixed` at full screen height, activation on pointer
       release so slightly drifting clicks hit the pressed letter, a
       keyboard tip (announced once to screen readers), and Right/Left arrow
       shortcuts between the list and the rail.
6. [x] Wired to real filtered data end-to-end; "No results" empty state
       added (see the search bar redesign note above). Verified: rapid
       typing, clearing, no-match → match again, and special/HTML-like
       characters in the query (React's JSX escaping handles this safely,
       confirmed no console errors). Reduced-motion audit across every
       Phase 2 animation — rail bump, rail scroll, heading bounce (all
       JS-driven, checked via a `matchMedia` override: each confirmed to
       skip its tween/animation entirely, not just speed it up) and the
       search bar slide + empty-state fade (CSS-driven, confirmed the
       `@media (prefers-reduced-motion: reduce)` rule compiles and
       correctly targets both). No code changes needed — everything already
       passed.

**Phase 2 complete.**

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

- [x] Improve search and filtering — kept the existing scope (name only,
      case-insensitive substring), confirmed while building match
      highlighting rather than silently expanded to address/city.
- [x] Add interface states and feedback — empty state, focus states (the
      Kaede-style search bar redesign), live region for result count.
- [x] Wire the prototype's interactions to real application state — grouping,
      filtering, and counts all derived from context data + live search
      state, not a static mock array.

**Priority breakdown for phases 3-4** (folded in from the earlier
`ROADMAP.md`, scope target: 3-4 hours per the brief, judgment over quantity):

*Do well first:*
1. [x] Expand the mock dataset (~15-20 entries, ended up at 35 per explicit
   request) — 5 items can't demonstrate a filtering experience; this is
   prep work, not a feature.
2. [ ] **Animated filter transitions on the list — dropped on scope.** An
   AddressItem entrance animation was built early on, then explicitly
   reverted per direction to go back to Phase 1 in order. Rebuilt a second
   time (entrance-only, `prefers-reduced-motion` respected, applied to both
   cards and newly-appearing letter headings) — then deliberately reverted
   again, this time on scope grounds: exit felt noticeably asymmetric next
   to the smooth entrance, but fixing that needs real state management (or
   a library) to keep filtered-out items mounted while they animate away,
   which wasn't judged worth it against the remaining time budget. Recorded
   in `NOTES.md`'s "what I'd do with more time." Still the one open item
   from the original "do well first" list.
3. [x] Match highlighting — real `<mark>` elements, regex-escaped query,
   color matched exactly to the search input's active tint (commit
   `fa2103f`).
4. [x] Accessible search input — label, live region announcing result
   count, visible focus (now via the Kaede-style redesign's active-state
   color+shape change plus a lighter persistent indicator, not a ring).
5. [ ] `prefers-reduced-motion` handling for whatever lands in (2) — moot,
   nothing was built.
6. [x] Empty state ("No results for '{query}'"), with a friendlier tone
   than originally scripted, fade-in animated (reduced-motion respected).

*If time remains:*
7. Debounce the live-region announcement (not necessarily the filter itself —
   moot performance-wise at this data size).
8. Clear ("×") button in the search input.
9. Press/hover state on result cards.
10. Keyboard roving between results (arrow keys) — nice-to-have.

*Explicitly out of scope* (would be over-engineering at this data size): full
CRUD/maps/auth/large routing changes (excluded by the brief), virtualization.

## 4. Polish the experience

- [x] Refine visual hierarchy and spacing at the mobile widths that are the
      actual design target (see Decisions log) — no separate desktop layout
      work here beyond confirming the width-constraint still reads fine.
      (Done iteratively and checked at 390px wide; no separate formal pass.)
- [x] Add purposeful micro-interactions and motion — list filter
      enter/exit, match highlighting, press/hover states.
      (Search bar effect, rail tab glide, match highlighting, page slide and
      back-button hover are in. List enter/exit and card press states were
      not built.)
- [x] Handle `prefers-reduced-motion` and layout stability (no unexpected
      shift/jank when the list re-filters) — build this in from the start
      this time, not bolted on after, per what we relearned on the prototype.
      (Reduced motion is respected for every animation. Re-filter jank was
      not formally measured.)

## 5. Think about the contact detail

- [x] `AddressItemPage.tsx` brought to visual consistency with the list:
      shared avatar-color/initials logic (`src/lib/avatar.ts`), page
      background set to the contact's hashed avatar color, white text,
      content centered and width-matched to the app's `max-w-lg` column, the
      avatar circle itself removed from the detail page (redundant once the
      whole page carries that color), and a route-change page transition.
      The transition went through several iterations before landing: an
      initial direction-dependent scheme modeled on tympanus.net's
      "move/scale" pattern (different pairs for forward vs. back), then a
      vertical variant, then a look at motion.dev's "Mask wipe" (dropped —
      inaccessible, paywalled source), settling on the simplest version per
      explicit product direction: a single symmetric slide-from/to-top pair
      (`animate-page-enter-from-top` / `animate-page-exit-to-top` in
      `index.css`), used identically for both navigation directions — pure
      `transform: translateY`, no scaling, no fade. Layering is keyed to
      route type, not incoming/outgoing role: the detail page is always the
      top z-index layer, whether it's entering or leaving, since it reads
      as a color card sitting above the list — an earlier version keyed
      z-index to incoming/outgoing instead, which put the list on top of
      the detail page during back navigation. Each direction has its own
      cubic-bezier easing rather than a shared linear/ease curve, like a
      roller-curtain: opening uses a hard ease-out
      (`cubic-bezier(0.16, 1, 0.3, 1)`) so the motion is front-loaded and
      settles gently; closing uses a "back" curve with anticipation
      (`cubic-bezier(0.36, 0, 0.66, -0.56)`) so it dips slightly the wrong
      way first before snapping up fast toward the end. That dip briefly
      nudges the translated layer down, which would otherwise reveal the
      list behind it since the layer itself is background-less — fixed by
      coloring the detail page's transition layer directly (looked up via
      `AddressContext` + `avatarColorFor`) and extending it ~15vh above the
      viewport, comfortably covering the dip's calculated max overshoot
      (~10% of the layer's height). Respects `prefers-reduced-motion` (skips
      the transition layers entirely, instant route swap) and moves focus
      to the new page's `<h1>` after every navigation. The back button was
      moved into the flow directly above the name (50px gap, exact
      regardless of viewport height, vs. the previous fixed-to-page-top
      position), relabeled from "← Back" to "← Back to the address book"
      for a clearer accessible name (arrow is `aria-hidden`), and restyled
      as an explicit bordered pill (was plain underlined text) at a 34px
      tap height, comfortably over the WCAG 2.5.8 24px minimum.

      **Avatar/detail-page color palette redone for contrast, three
      times.** An accessibility pass found white text on the original
      avatar colors failed WCAG AA (4.5:1) for 4 of 6 colors — olive
      1.71:1 and pink 1.90:1 were barely readable. Pass 1 fixed this with
      darkened colors + white/ink text, plus two invented colors (teal,
      gold). Pass 2 dropped the invented colors and rebuilt from the
      brand's reference illustration's own hex values instead — but
      lightening 5 of the 8 colors to pair with the reference's dark
      maroon text meant that one maroon tone did almost all the work
      (used in 6 of 8 pairs), and the reference's own bright green
      (`#1F9A6B`) and lime (`#C6E04A`) went unused. Pass 3 (current):
      darkened those same 5 colors instead of lightening them, so each
      pairs with a *different* bright accent from the illustration (lime,
      gold, light pink, pale pink) rather than all converging on one dark
      maroon — green in particular now pairs with lime, both used at
      values close to the reference's exact hex. Still zero black/white
      anywhere, still individually verified at 4.5:1+ (range 4.89–6.24:1).
      `src/lib/avatar.ts`'s `avatarTextColorFor` now returns one of five
      in-palette text classes; the back button's border/focus ring use
      `currentColor` so they automatically match whichever text color a
      given detail page pairs with, instead of a separate chrome variant
      to keep in sync by hand.

      **Pass 4: fixed color naming to match the actual rendered color.**
      The darkened "periwinkle" no longer looked periwinkle (that name
      implies pale/light) — renamed `avatar-indigo`. The darkened
      orange-red rendered as brown, indistinguishable from maroon, and the
      app already has an unrelated `--color-accent` that *is* orange
      (search icon/letter headers) — a second, browner "orange" was
      actively confusing, so that slot was dropped rather than renamed;
      maroon covers that territory. `avatar-gold` (#FFC933) renamed to
      `avatar-yellow` — "gold" isn't a name in the reference list.

      **Pass 5: removed the caterpillar's yellow entirely (not a real
      reference color — it's incidental illustration detail, not a named
      one), and replaced blue with the user's exact requested hex.** The
      reference's literal periwinkle blue (`#7B8CFF`) fails 4.5:1 against
      every other color in the set (best case 3.47:1) — none of the
      reference's mid-toned colors (blue, green, olive, purple, orange-red)
      have enough lightness range to pair with each other unmodified; this
      is a property of the source illustration, not a solvable naming
      issue. Flagged this rather than silently adjusting again; the user
      chose `#9FACFF` (a slight lightening of their own exact hex), which
      pairs with `--color-ink-maroon` at 4.85:1 — verified, not assumed.
      "Indigo" is `avatar-blue` again now that it's a genuinely blue,
      undarkened-in-spirit value. The 3 slots that used the dropped yellow
      were replaced with combinations already proven valid earlier in
      this same palette (lime, light pink, pale pink) — still 7 colors,
      all traceable to a named reference color, all individually
      contrast-checked.

      **Pass 6:** swapped `avatar-olive`'s text from lime (5.16:1) to
      white (7.61:1) by request — the app's stated allowance for
      "occasional white" applies here; used once, not as a default.

      **Pass 7: removed `avatar-pale-pink`, leaving `avatar-pink` as the
      only pink.** Also fixed two corrupted entries found in the affected
      file at the same time (an external edit had introduced `bg-`
      prefixes where `text-` classes were needed — those wouldn't set text
      color at all, they'd silently add a second, conflicting background
      class instead). Palette is 6 colors now: green+lime, blue+ink-maroon,
      purple+pink (4.85:1), olive+white, maroon+pink, pink+ink-maroon —
      every pair reverified after the change. Also found (and restored)
      the same corrupted-entry pattern reappearing once more in a later
      pass, from an edit outside this session.

      **Back button refined:** centered horizontally (dropped the
      `self-start` override so it inherits the column's centering), added
      `cursor-pointer`. First hover attempt tinted the background at 2%
      white — kept contrast safe (4.6:1+ on every color) but turned out to
      be visually imperceptible in practice. A plain visible fill (~10%
      white) would drop 3 of 6 colors' button-text contrast below 4.5:1
      (purple to 3.78:1), so instead of choosing between "invisible" and
      "sometimes fails contrast," switched to a soft white glow
      (`box-shadow`, 4px spread, 30% opacity) rendered just *outside* the
      button's border. It's clearly visible and animates in over 200ms,
      but since it never overlaps the text/background area, it can't
      affect that pair's contrast at all — solves the actual conflict
      instead of trading off between the two options.

      **Reverted to a plain white fill by explicit user request** after
      seeing the glow: the user preferred the literal "slightly white
      background" they originally asked for, knowingly accepting the
      contrast trade-off over the glow's zero-risk alternative. Final:
      `hover:bg-white/10`, text color unaffected. This is now a known,
      accepted exception — the button's *rest* state and its
      `focus-visible` outline remain fully WCAG AA compliant on all 6
      colors; only the transient, mouse-only hover fill drops button-text
      contrast below 4.5:1 on 3 of 6 (purple, green, maroon backgrounds),
      down to as low as ~3.8:1. Transition smoothed from 200ms `ease-out`
      to `ease-in-out`, duration settled at 300ms after a follow-up
      tweak (tried 500ms first, then dialed back).

## 6. Verify the result

- [x] Accessibility review across the full flow: search → filtered list →
      detail page → back. (Done piece by piece: keyboard, focus, contrast,
      reduced motion. Known gaps and the lack of screen-reader testing are
      listed in `NOTES.md`.)
- [x] Test keyboard navigation, search/filter behavior (including empty
      query, no-match query, rapid typing), and confirm the desktop
      width-constraint (see Decisions log) still looks intentional rather
      than a stretched mobile page. (Keyboard heavily tested; rapid typing
      and a desktop-width screenshot were not formally checked.)
- [x] Run the build (`yarn build`) and typecheck; inspect the console for
      warnings/errors. (Both pass; runtime errors checked with a listener on
      most navigations, no final clean-load console sweep.)
- [ ] Review the final diff end to end before calling it done.

## 7. Document

- [ ] Complete `NOTES.md`'s four sections: what I focused on and why, what I
      changed, accessibility considerations, tradeoffs/decisions, what I'd
      improve with more time (include the A-Z rail idea here if we cut it).
- [x] Record decisions/tradeoffs/limitations as we go, not all at the end —
      easier to write NOTES.md accurately that way.
- [ ] Push to a new repo via "Use this template," add `georgewrmarshall`,
      `n3ps`, `AndyMBridges` as collaborators, and share the link (per the
      README — no PR against the template repo).
