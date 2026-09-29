# Project instructions

Follow the approved scope and sequence in `PLAN.md`.

The assignment brief is the primary source of truth. The prototype is a
directional visual reference and may be adapted to the existing architecture,
available data and accessibility requirements.

## Working boundaries

Work on one approved plan step at a time.

Before editing, briefly state:

- The objective
- The files expected to change
- Any unresolved decision

Ask before:

- Adding a dependency
- Changing routing, shared architecture or the data model
- Expanding product scope
- Adding fixture data
- Departing materially from the prototype
- Making a significant accessibility tradeoff
- Modifying unrelated files

Do not commit or push unless explicitly requested.

After each step:

- Summarize what changed and why
- List the checks actually run
- Report anything unverified
- Stop before optional work

## Accessibility at every step

Treat accessibility as an implementation criterion, not a final cleanup pass.

For every change:

- Prefer native semantic HTML over custom controls and unnecessary ARIA.
- Provide appropriate labels and accessible names.
- Ensure full keyboard operation and visible focus.
- Keep DOM, reading and visual order coherent.
- Do not rely on colour, hover or motion alone.
- Check contrast, target size, content reflow and long-content behavior.
- Respect `prefers-reduced-motion`.
- Add dynamic announcements only when they are useful and not repetitive.
- Manage focus deliberately when navigation or context changes.

Report accessibility issues and their impact. Fix obvious implementation
mistakes inline and mention them afterward. Ask before changing an approved
interaction or making a decision that involves product or design judgment.

## Verification

Run checks appropriate to the changed behavior and report only what was
actually verified:

- Build/type-check
- Browser console
- Keyboard and focus
- Responsive/zoom behavior
- Reduced motion
- Search, empty and error states

Automated checks support but do not replace manual interaction testing.
