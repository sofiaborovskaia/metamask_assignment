# Notes

## What I focused on and why

I designed for mobile first. Mobile is the context where an address book is
actually used, and it let me spend the time budget on the interaction quality
rather than on multiple layouts. Desktop gets the same design in a
width-constrained, centred column. That's a scoping decision, not an oversight.

The brief asks for search and filtering that feel polished, accessible and
delightful, with judgment over volume, so I prioritised two things:

1. **Finding a contact quickly.** A redesigned search bar, live filtering with
   visible match highlighting, and an A–Z rail for jumping through the list.
   I thought about real paper address books, with their thumb index down the
   side, and that's where the rail comes from.
2. **An experience with a bit of life, without overpowering it.** The
   typography and colour are deliberately playful and children's-book-like.
   Motion is kept small: the search bar, the rail's gliding tab, and a page
   slide to the contact detail, all of which respect `prefers-reduced-motion`.

The contact detail page is intentionally light. The brief says not to spend
time on routing or CRUD, so I kept the existing route and gave it visual
consistency (same colour as the contact's avatar, a short transition).

**How I worked.** I used an AI coding assistant, working from a written plan
(`PLAN.md`) and a set of working rules (`CLAUDE.md`): one step at a time,
approve before each change, and an accessibility report before every commit.
I made the product and accessibility decisions, and checked each change in
the browser. A few real bugs surfaced that way (a Tailwind class built at
runtime that silently generated no CSS, a pointer-capture handler that
swallowed clicks on the rail, a scroll-spy race that highlighted the wrong
letter, and a layout measurement that broke under a CSS transform), and they
were caught by testing with real input, not by the type checker.

## What I changed

- **Search.** Redesigned search bar (a Codrops "Kaede"-style input effect),
  a live result count, `<mark>`-based highlighting of the matching text in
  each name, and a friendly empty state when nothing matches.
- **A–Z rail.** A full-height rail glued to the right edge of the list. The
  active letter gets a gliding "tab" that follows both clicks and scrolling
  (via an `IntersectionObserver` scroll-spy). Letters can be clicked, dragged
  across, or used from the keyboard. Letters with no contacts are disabled.
- **List.** Contacts are grouped under sticky letter headings. The title and
  search bar are sticky too, and jumping to a letter lands it directly under
  them.
- **Contact detail.** A full-bleed page in the contact's avatar colour, a
  slide-in transition, and a clear "Back to the address book" button.
- **Shared avatar colours.** One small module decides each contact's colour
  and text colour, so the list avatar and the detail page always match.
- **Keyboard model.** Covered under Accessibility below.

## Accessibility considerations

**Keyboard and focus**
- Every action is reachable by keyboard. Contacts and rail letters have a
  visible accent-orange focus ring (3.37:1 against the white page), and the
  back button's ring matches its text colour. The search field is the
  exception; see the gaps below.
- Tab order: page title (focused on load) → search → "Skip letter index" link
  → each letter that has contacts → contacts. The skip link is hidden until
  focused.
- On the rail: Up/Down arrows, Home and End move between letters; Enter jumps.
- Type-to-jump: pressing a letter anywhere in the list or rail jumps to that
  section (the type-ahead the ARIA Authoring Practices recommend for long
  listboxes). Right arrow from a contact goes to its letter on the rail, and
  Left arrow from a letter goes to that letter's first contact.
- Nothing on screen says the keyboard can do this, so a short tip appears
  only while *keyboard* focus is in the list or rail. It is also announced to
  screen readers once per page view through a polite status region, and a
  visually hidden copy stays in the page.
- The sticky header and the floating tip are accounted for with
  `scroll-padding`, so a focused item is never scrolled underneath them.
- Focus moves to the new page's heading on every route change.

**Screen readers and semantics**
- The rail is a labelled `nav` landmark with real buttons.
- The result count is announced politely as you type; matches use `<mark>`.
- Decorative elements (avatar initials, the back-arrow glyph) are `aria-hidden`.

**Pointer**
- Dragging along the rail is a convenience only. Every letter can also be
  clicked, which covers the WCAG 2.5.7 (Dragging Movements) alternative.
- A press activates the letter that was pressed, on release, even if the
  pointer drifts across a row boundary. An earlier version treated small
  drifts as drags and either did nothing or jumped to a neighbouring letter.

**Colour and contrast**
- Avatar and detail-page colours are taken from the brand illustration. The
  exact reference values can't pair with each other at 4.5:1, so a few are
  adjusted (blue lightened from `#7B8CFF` to `#9FACFF`; green, olive and
  purple darkened). Every text/background pair was computed from its real hex
  values rather than eyeballed:

  | Background | Text | Contrast |
  |---|---|---|
  | green | pink | 4.80:1 |
  | blue | dark maroon | 4.85:1 |
  | purple | lime | 5.43:1 |
  | olive | lime | 5.13:1 |
  | maroon | pink | 5.49:1 |
  | pink | purple | 4.85:1 |

- I dropped the illustration's orange-red: darkened enough to pass, it was
  indistinguishable from maroon, and the app already has its own orange accent.

**Motion**
- `prefers-reduced-motion` turns off the page transition, the rail's gliding
  tab, the animated scroll and the entrance animations; jumps become instant.

**Known gaps, stated plainly**
- The back button's hover fill (about 10% white) lowers its text contrast
  below 4.5:1 on 4 of the 6 colours (green 3.74, olive 3.96, purple 4.24,
  maroon 4.25). It's a deliberate visual choice, limited to the mouse-only
  hover state; the resting and keyboard-focus states pass.
- Rail rows are 29.5px tall at a 768px-high screen but drop under the WCAG
  2.5.8 24px minimum below about 624px of height.
- The search field has no focus ring of its own. Its focus cue is the bar
  sliding open and its background darkening slightly, which is only about
  1.1:1 against the resting bar, well under the 3:1 WCAG 1.4.11 asks of a
  focus indicator. A ring around the bar is the fix, and I'd add it first.
- Headings that receive focus programmatically (after a route change or a
  rail jump) have no visible focus style. Screen readers are unaffected, since
  the announcement comes from the focus event, but sighted keyboard users
  lose a "you are here" cue there. I removed the outline because it read as
  noise on large display type.
- I tested with automated checks and by hand with the keyboard in Chrome.
  **I have not tested with a screen reader** (VoiceOver, NVDA, TalkBack).

## Performance considerations

The dataset is 35 contacts, so the honest summary is that nothing here is a
bottleneck, and I haven't measured it with a profiler or Lighthouse.

- Scroll-spy uses one `IntersectionObserver` instead of scroll listeners.
- Animations use `transform` and `opacity` and run in CSS; the animated scroll
  is a single `requestAnimationFrame` loop.
- Fonts are self-hosted, Latin-only `woff2` with `font-display: swap`, and I
  added no dependencies beyond what the template shipped.
- Filtering and grouping run synchronously on every keystroke with no
  memoisation or debouncing. At 35 items that's imperceptible.

At real scale I'd debounce or defer the query, memoise the grouping and, for
thousands of contacts, virtualise the list. Virtualisation is not free here:
sticky letter headings, jump-to-letter and the browser's find-in-page all
assume the content is actually in the DOM.

## Tradeoffs and decisions

- **Speed over structure (code ownership).** Given the time, I planned the
  work for an AI assistant and executed it step by step. Tailwind is great for
  prototyping, but the result doesn't have clear, reusable UI components, which
  made debugging slower. I prefer full ownership of my CSS, a design system or
  CSS-in-JS, and I'm more at home with that level of clarity.
- **Chrome only.** I built and tested only in Chrome. There are no
  cross-browser or real-device checks, so Safari and Firefox behaviour
  (including focus handling and `:focus-visible`) is untested.
- **A rail means two interactive columns.** Putting an index beside the list
  creates a reading and tab-order question. The rail comes first in the DOM
  and in the tab order even though it sits on the right, which WCAG 2.4.3
  allows as long as order stays meaningful. The cost is that from deep in the
  list the rail is far behind you when tabbing backwards. I addressed that with
  type-to-jump and the Right/Left arrow shortcuts rather than restructuring
  the list into a single tab stop.
- **Every letter is its own tab stop, plus a skip link.** My first version made
  the rail a single tab stop with arrow keys. Users didn't discover the arrows,
  and a `nav` of index entries isn't a composite widget anyway, so I switched to
  the established A–Z index pattern.
- **Colours are adjusted for contrast.** Faithfully reproducing the
  illustration's palette and meeting WCAG AA can't both be done, so I kept the
  hues and moved lightness, with every pair verified.
- **Manual page transition instead of an animation library.** It avoids a new
  dependency, but it means owning edge cases such as keeping the outgoing page
  mounted and layering. A small bug remains: the list slides away when the
  detail page opens, where only the detail page should move.
- **Animated list exits were built and reverted.** Items that drop out of a
  search result still disappear instantly. A real exit animation needs state
  management or a library, which wasn't worth the complexity in this pass.

## What I'd do with more time

- **Make the rail feel like a real address book index.** I seriously considered
  a two-page spread with a ring binding in the middle. That would be overkill
  for this task, but I'd like the rail to read as a physical index: stacked
  tabs with clean lines for a little depth, and removing the shadow the
  selected tab casts on the letters below it, as if the book were open.
- **A parallax effect** on the list.
- **Accessibility follow-ups:**
  - add a proper focus ring to the search field;
  - test with real screen readers and on real phones;
  - give the rail a 24px minimum row height on short screens;
  - make the contact list a single tab stop so Shift+Tab always reaches the
    rail in one keystroke;
  - reconsider the letter sections being labelled regions, since ~20
    landmarks may be noisy for screen reader users;
  - add a `#` entry for names that don't start with a letter (the current
    data has none, so this is latent).
- **Engineering follow-ups:** extract real components and design tokens from
  the Tailwind utilities, add automated tests for filtering and the keyboard
  model, and fix the list sliding away on navigation.
- **Haptic feedback on the rail**, like native iOS pickers. Safari has never
  shipped `navigator.vibrate()`, so there's no supported way to do it on
  iPhone today. The one workaround, hiding a real `<input type="range">` to
  borrow the OS tick, is undocumented behaviour whose semantics don't match
  jumping to one of 26 letters. For now the rail calls `navigator.vibrate()` as
  a feature-detected enhancement (works on Android Chrome, a no-op on iPhone).
- **Animated list exits**, as described above.
