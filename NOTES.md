# Notes

## What I focused on and why

I focused on one simple layout that works consistently across mobile and desktop rather than designing separate experiences for each.

When I first read the task, I thought of traditional address and contact books. That became the main idea behind the design: an alphabetical rail gives the interface some of the character of a physical address book while also supporting navigation and filtering.

I gave it a playful, almost children’s-book-like typeface and colour palette. I wanted the experience to have a little life without becoming overly decorative.

I used AI-assisted development within the boundaries defined in `PLAN.md` and `CLAUDE.md`. I worked in small, reviewable steps, checked the resulting code and verified each interaction in the browser.

## What I changed

- Introduced a small visual system based on the prototype’s colour palette and typography.
- Added an interactive A–Z rail with tap, drag, keyboard and scroll-linked behaviour. Letters unavailable in the filtered results are disabled.
- Added visible highlighting for search matches and clear feedback when no contacts are found.
- Added restrained interaction feedback to the selected letter, search bar and page transition.
- Preserved the existing filtering logic and data structure, focusing instead on the experience around them.

The application is small, so I avoided optimisation and abstraction without a concrete need. The scroll-linked alphabet state uses `IntersectionObserver` rather than a continuous scroll listener, animations use inexpensive visual properties, and I avoided adding a dedicated animation library.

## Accessibility considerations

Accessibility was treated as an implementation criterion throughout the work rather than as a final review step. This included a labelled search control, announced result count, keyboard access, visible focus, semantic navigation, `<mark>` for search matches, reduced-motion support, contrast checks and understandable empty states.

The rail presented a challenge: there is no official ARIA pattern for an A–Z index, and placing two interactive columns side by side raises keyboard, pointer and focus questions. I checked WCAG and the ARIA Authoring Practices, then iterated through manual keyboard and pointer testing.

- The rail uses native buttons, supports arrow-key shortcuts and includes a skip link. Normal list scrolling remains available.
- Every letter works with a simple press; dragging is an optional enhancement rather than the only way to operate it.
- Focus remains visible on the highlighted letter, while scroll padding prevents focused contacts from being hidden beneath the sticky header.
- Scroll-linked highlighting pauses during programmatic jumps to avoid activating the wrong letter.

One known limitation remains: below approximately 624px viewport height, some rail targets fall under the recommended 24px minimum.

## Tradeoffs and decisions

- I kept Tailwind because it was already part of the project and worked well for moving quickly. The tradeoff is that some visual logic remains inside utility-heavy markup. In a longer-lived product, I would extract the rail, controls and surfaces into clearer reusable components and tokens.
- It gives the experience its identity, but introduces additional keyboard behaviour and uses horizontal space at smaller sizes. Normal list navigation remains available, so the rail is an enhancement rather than a requirement.
- I manually tested keyboard navigation, responsive layouts, contrast and reduced motion in Chrome. I did not test other browsers, screen readers or physical touch devices.

## What I’d do with more time

- Improve state persistence when returning from a contact detail, preserving the search query, active alphabet filter and scroll position so the user can continue where they left off.
- Give the rail more of the physical address-book character I originally imagined: stacked tabs, cleaner dividing lines and subtle depth that makes the selected section feel like an open page.
- Explore subtle haptic feedback on supported mobile devices, so moving across the rail produces a small physical response each time the active letter changes. This would remain a progressive enhancement, with complete visual feedback on unsupported devices.
- Extract repeated visual patterns into clearer reusable components and design tokens.
- Review the generated markup and component structure more deeply, removing unnecessary wrappers or ARIA and keeping the implementation as simple and semantic as the interaction allows.
- Add targeted tests around the main journey.
- Test the interface with a larger and more varied dataset, including long content, diacritics and missing fields.
- Test with screen readers, physical touch devices, Safari and Firefox, then refine the interaction based on what those tests reveal.
