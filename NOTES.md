# Notes

## What I focused on and why

To work within the time given, I focused on one simple layout that works
consistently across mobile and desktop, rather than designing separate
experiences for each.

I wanted the interface to feel smooth and seamless, with a little bit of life,
but without overpowering it with detail. When I first read the task, I
immediately thought of traditional address and contact books. That became the
main idea behind the design: an alphabetical rail along the right edge makes
the interface feel a little more like a physical address book while also
supporting navigation and filtering.

I paired it with a playful, almost children's-book-like typeface and colour
palette to give the experience a distinct character without making it feel
overly decorative.

I used AI-assisted development within the boundaries defined in `PLAN.md` and `CLAUDE.md`. I worked in small, reviewable steps, checked the resulting code and verified each interaction in the browser.

## What I changed

- Introduced a mini-visual system based on the prototype's colour palette and
  typography.
- Added an interactive A–Z rail with tap, drag, keyboard and scroll-linked
  behaviour; letters with no contacts are disabled.
- Added visible highlighting for matching search terms.
- Added clear feedback and recovery when no contacts match.
- Added purposeful interaction feedback while keeping motion restrained: selected letter, page slide, search bar.

The application is small, so I avoided optimisation or abstraction without a concrete need. The scroll-linked alphabet state uses `IntersectionObserver` instead of a continuous scroll listener, animations use inexpensive visual properties and I avoided adding a dedicated animation library.

## Accessibility considerations

Accessibility was treated as an implementation criterion throughout the work,
not as a final review step. I paid particular attention to:

- A labelled search control, with the result count announced as you type.
- Keyboard access to the search, the contacts and the alphabet navigation.
- Visible focus indicators.
- Semantic navigation for the alphabet index.
- `<mark>` for visible search-match highlighting.
- Decorative elements hidden from assistive technology.
- Text and interface colour combinations checked against WCAG AA contrast.
- Motion adapting to `prefers-reduced-motion`.
- Dynamic and empty states that give understandable feedback.

The rail was a bit of a challenge. Two interactive columns side by side (contacts and rail) raise tab-order, keyboard and pointer questions. There's no official ARIA
pattern for an A–Z index. I checked WCAG and the ARIA Authoring Practices, then iterated by
testing with real input:

- Keyboard: The rail uses native buttons, supports arrow-key shortcuts and includes a skip link. Normal list scrolling remains available.
- Pointer: Every letter works with a simple press; dragging is an optional enhancement rather than the only way to operate the rail.
- Focus and positioning: Focus remains visible on the highlighted letter. Scroll padding prevents focused contacts from being obscured by the sticky header.
- State: Scroll-linked highlighting pauses during programmatic jumps to avoid the wrong letter becoming active.

Known gaps:

- The accent orange is only 3.37:1 on white, which
  is fine for the large letter headings and focus rings (3:1) but not for the
  small active letter in the rail (4.5:1). That's why I made the letter in the rail depper orange, even though it is different from the actual accent color.
- Rail rows drop under the 24px target size inside containers shorter than about 624px height.

## Tradeoffs and decisions

- I kept Tailwind because it was already part of the project and worked well for moving quickly. The tradeoff is that much of the visual logic remains inside utility-heavy markup, which made some parts harder to reason about and debug. In a longer-lived product, I would extract the rail, controls and surfaces into clearer reusable components and tokens. I personally prefer stronger ownership at the component level—through a design system, component-scoped styles or CSS-in-JS—but changing the styling architecture was not justified within this task.
- The alphabet rail gives the experience its identity and provides a way to filter and navigate the contacts, but also introduces complexity: two interactive columns, additional keyboard behaviour and less horizontal space at smaller sizes. I kept normal list navigation available so that the rail remains an enhancement rather than the only way to use the address book.
- I manually tested keyboard navigation, responsive layouts, contrast and reduced motion in Chrome. I did not test other browsers, screen readers or physical touch devices.

## What I'd do with more time

- Give the rail more of the physical address-book character I originally imagined: stacked tabs, cleaner dividing lines and subtle depth that makes the selected section feel like an open page.
- Explore subtle haptic feedback on supported mobile devices, so dragging across the rail produces a small physical response each time the active letter changes. I would treat this as a progressive enhancement, with the existing visual feedback remaining complete on devices and browsers that do not support vibration.
- Extract repeated visual patterns into clearer reusable components and design tokens.
- Review the generated markup and component structure more deeply, removing unnecessary wrappers or ARIA and making sure the implementation remains as simple and semantic as the interaction allows.
- Add targeted tests around the main journey.
- Test the interface with a larger and more varied dataset (long content, diacritics and missing fields).
- Test with screen readers, physical touch devices, Safari and Firefox, then refine the interaction based on what those tests reveal.
- Continue polishing the UI, visual rhythm, responsive details and transitions.

That's all :)
