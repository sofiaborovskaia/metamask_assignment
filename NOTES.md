# Notes

## What I focused on and why

<!-- Describe the 1–2 things you chose to prioritise and your reasoning. -->

## What I changed

<!-- Walk through the key changes you made. -->

## Accessibility considerations

<!-- How you approached accessibility — keyboard interaction, focus management, ARIA, etc. -->

## Tradeoffs and decisions

<!-- Any tradeoffs you made between UX quality, implementation complexity, or time. -->

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
