# Notes

## What I focused on and why

<!-- Describe the 1–2 things you chose to prioritise and your reasoning. -->

## What I changed

<!-- Walk through the key changes you made. -->

## Accessibility considerations

<!-- How you approached accessibility — keyboard interaction, focus management, ARIA, etc. -->

- **Avatar/detail-page colors are explicit, verified WCAG pairs sourced
  from the brand's reference illustration — no black, white, or invented
  colors, and deliberately varied rather than one dark text color doing
  all the work.** The original 6 avatar colors paired with white text
  failed 4.5:1 contrast for 4 of 6 (olive 1.71:1, pink 1.90:1 were close
  to unreadable). Rebuilt using the illustration's own listed colors
  (orange-red, periwinkle, green, olive, purple, light pink, gold, dark
  maroon), each paired with a text color also from that set. An
  intermediate version lightened 5 of the 8 to pair with one dark maroon
  tone, which left that maroon doing 6 of 8 pairings and left the
  reference's own bright green/lime unused; reworked to darken those same
  5 instead, so each pairs with a *different* bright accent from the
  illustration (lime, gold, light pink, pale pink) — green pairs with
  lime specifically, both close to the reference's exact hex. Every pair
  individually verified at 4.5:1+ (4.89–6.24:1), none guessed.
  `src/lib/avatar.ts`'s `avatarTextColorFor` returns the paired text
  class; the back button uses `border-current`/`outline-current` so its
  chrome auto-matches whichever color a given page pairs with, rather
  than a hardcoded variant per color.

## Tradeoffs and decisions

<!-- Any tradeoffs you made between UX quality, implementation complexity, or time. -->

- **No visible focus style on programmatically-focused headings.** The page
  title (after a route change) and the letter headings (after jumping via
  the A-Z rail) receive focus via script, not natural Tab navigation, so
  keyboard/screen-reader users land somewhere sensible after those actions
  instead of losing their place. I initially added a visible indicator
  (first the browser's own default outline, then a custom underline) so
  sighted keyboard/screen-magnifier users could also see where focus moved.
  Removed per explicit product direction: it read as visual noise on large
  display headings. Worth being precise about the actual trade-off, since
  it's easy to misread: screen reader users are unaffected either way — the
  announcement comes from the DOM focus event itself, not from any visual
  styling. The cost is specifically for sighted keyboard-only or
  screen-magnifier users, who no longer get a visual "you are here" cue
  after these two actions. Accepted as the right call for this app's scale
  and audience, not something I'd generalize to interactive controls
  elsewhere (buttons, links, and inputs everywhere else in the app still
  have real, visible focus indicators).

- **Back button's hover state knowingly drops below WCAG AA contrast on 3
  of 6 avatar colors.** The button's border/text/focus-ring all meet
  4.5:1 on every avatar color at rest. On hover, the background fills
  with ~10% white for a visible "slightly white" effect; this lightens
  the background enough that 3 of the 6 colors (purple, green, maroon)
  drop the button text below 4.5:1, to as low as ~3.8:1. I built a
  same-visual-intent alternative (a white glow rendered outside the
  border, so it can't touch text contrast at all) and flagged the
  trade-off explicitly; the product direction was to keep the plain
  background fill anyway, accepting the reduced contrast for this
  specific, transient, mouse-only interaction state. The resting state
  and the keyboard focus-visible outline are unaffected and remain fully
  compliant — this exception is scoped to hover only.

## What I'd do with more time

<!-- How you'd evolve this further — motion polish, accessibility, system-level thinking, etc. -->

- **Haptic feedback on the A-Z rail.** I'd like the rail to give a tactile
  tick as you drag across letters, the way native iOS pickers do. There's no
  supported way to do this on iOS Safari today — Apple has never shipped
  `navigator.vibrate()` (the standard Web Vibration API) on WebKit, on any
  iOS browser, including in home-screen-installed PWAs. The one workaround
  that gets mentioned (hiding a real native `<input type="range">` under
  custom visuals to piggyback on the OS's own built-in haptic tick for that
  control) is undocumented OS behavior rather than a supported API, and its
  native continuous-value semantics don't actually match a "jump to one of
  26 discrete letters" interaction — using it would mean fighting the
  accessibility semantics we built everything else around. This needs more
  research than fit in this pass; for now the rail uses `navigator.vibrate()`
  as a harmless, feature-detected enhancement (real effect on Android Chrome,
  silent no-op on iPhone).

- **Animated list exit transitions.** Contact cards (and letter headings)
  can animate in as they enter the filtered search results, but items that
  drop out of the results still disappear instantly rather than fading out
  — a real exit transition means keeping filtered-out items mounted briefly
  while they animate away, which needs its own bit of state management (or
  an animation library) rather than the plain CSS entrance keyframe used
  for enter. Built and then deliberately reverted for this pass: it's a
  real, noticeable asymmetry (things appear smoothly, disappear abruptly),
  but not worth the added complexity given the remaining time budget. Worth
  revisiting if there's time left at the end.
