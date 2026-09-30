import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import AddressItem from "./AddressItem";
import AlphabetRail from "./AlphabetRail";
import { Address } from "../data/addresses";

interface AddressListProps {
  addresses: Address[];
  search: string;
  headerHeight: number;
}

const groupByLetter = (addresses: Address[]) => {
  const sorted = [...addresses].sort((a, b) => a.name.localeCompare(b.name));
  const groups = new Map<string, Address[]>();

  sorted.forEach((address) => {
    const letter = address.name[0]?.toUpperCase() ?? "#";
    if (!groups.has(letter)) {
      groups.set(letter, []);
    }
    groups.get(letter)!.push(address);
  });

  return groups;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// easeOutQuint decelerates so aggressively that ~97% of the distance is
// covered by half the nominal duration — the remaining "tail" is
// sub-pixel and invisible, so increasing duration barely changes what's
// actually seen. easeOutCubic distributes the motion more evenly across
// the full duration, so a longer duration is actually felt throughout
// rather than mostly wasted on an imperceptible tail.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Native `scrollIntoView({behavior: "smooth"})` is unreliable on iOS
// Safari — it frequently jumps instantly regardless of the requested
// behavior. Driving the scroll manually with the same eased-tween
// technique used for the rail's bump guarantees consistent motion on
// every browser.
let scrollAnimationHandle: number | undefined;

const animateScrollTo = (targetY: number, onDone?: () => void) => {
  if (scrollAnimationHandle) cancelAnimationFrame(scrollAnimationHandle);
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(1200, Math.max(400, Math.abs(distance) * 0.55));
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + distance * easeOutCubic(t));
    if (t < 1) {
      scrollAnimationHandle = requestAnimationFrame(tick);
    } else {
      onDone?.();
    }
  };
  scrollAnimationHandle = requestAnimationFrame(tick);
};

// A springy "bounce into place" timing curve, ported from Josh Comeau's
// linear() technique (https://www.joshwcomeau.com/animation/linear-timing-function/).
const BOUNCE_EASING =
  "linear(0 0%, 0.151 8.1%, 0.223 11.7%, 0.304 15.2%, 0.392 18.4%, 0.497 21.6%, 0.619 24.8%, 0.752 27.9%, 0.999 33.3%, 0.842 37.1%, 0.79 38.6%, 0.748 40%, 0.714 41.4%, 0.691 42.7%, 0.677 44%, 0.673 44.7%, 0.672 45.3%, 0.676 46.5%, 0.69 47.8%, 0.712 49.1%, 0.743 50.4%, 0.824 53%, 0.999 57.7%, 0.927 60%, 0.883 61.8%, 0.867 62.7%, 0.856 63.6%, 0.85 64.4%, 0.848 65.3%, 0.849 66.1%, 0.855 67%, 0.865 67.9%, 0.879 68.8%, 0.911 70.5%, 0.999 74.5%, 0.97 76.2%, 0.953 77.5%, 0.943 78.8%, 0.94 80.2%, 0.942 81.4%, 0.95 82.7%, 0.989 86.9%, 1 88.2%, 0.99 90%, 0.987 91.9%, 0.989 93.5%, 0.998 97.5%, 1 100%)";

const supportsBounceEasing =
  typeof CSS !== "undefined" && CSS.supports("transition-timing-function", BOUNCE_EASING);

// Landing feedback for a letter jumped to via the rail, replacing a focus
// ring that looked rough on a 72px sticky heading. Driven imperatively via
// the Web Animations API (not a CSS class toggle) so it reliably replays
// every time, including repeat jumps to the same letter.
//
// Animates the inner glyph span, not the heading itself — the heading also
// carries the sticky fade-gradient background (masking scrolled content
// underneath it), which needs to stay put; only the letter should jump.
const bounceHeading = (heading: HTMLElement) => {
  if (prefersReducedMotion()) return;
  const glyph = heading.querySelector<HTMLElement>("[data-letter-glyph]") ?? heading;
  glyph.animate(
    [{ transform: "translateY(-14px)" }, { transform: "translateY(0)" }],
    {
      duration: supportsBounceEasing ? 1200 : 500,
      easing: supportsBounceEasing ? BOUNCE_EASING : "cubic-bezier(0.34, 1.56, 0.64, 1)",
    }
  );
};

const AddressList = ({ addresses, search, headerHeight }: AddressListProps) => {
  const groups = groupByLetter(addresses);
  const letters = Array.from(groups.keys());
  const lettersKey = letters.join(",");

  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const headingRefs = useRef(new Map<string, HTMLHeadingElement>());
  const spySuspendedRef = useRef(false);
  const spyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [activeLetter, setActiveLetter] = useState<string | null>(letters[0] ?? null);

  // Keep the rail's active letter in sync with whichever section is
  // currently at the top of the viewport as the user free-scrolls, ported
  // from the prototype's IntersectionObserver scroll-spy — without this the
  // rail goes stale the moment you scroll manually instead of dragging it.
  useEffect(() => {
    const sections = Array.from(sectionRefs.current.values());
    if (sections.length === 0) return;

    // Detection zone: a band just below the sticky header (not the very top
    // of the viewport, which is now covered by it).
    const zoneHeight = window.innerHeight * 0.22;
    const bottomMargin = Math.max(
      0,
      window.innerHeight - headerHeight - zoneHeight
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (spySuspendedRef.current) return;
        const best = entries.reduce<{ letter: string; top: number } | null>(
          (closest, entry) => {
            if (!entry.isIntersecting) return closest;
            const letter = (entry.target as HTMLElement).dataset.letter;
            if (!letter) return closest;
            if (!closest || entry.boundingClientRect.top < closest.top) {
              return { letter, top: entry.boundingClientRect.top };
            }
            return closest;
          },
          null
        );
        if (best) setActiveLetter(best.letter);
      },
      { rootMargin: `-${headerHeight}px 0px -${bottomMargin}px 0px`, threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lettersKey, headerHeight]);

  // If the current active letter drops out of the filtered results (e.g.
  // search narrows past it), fall back to the first available one.
  useEffect(() => {
    if (activeLetter && !letters.includes(activeLetter)) {
      setActiveLetter(letters[0] ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lettersKey]);

  const activateLetter = (letter: string, { userInitiated }: { userInitiated: boolean }) => {
    const heading = headingRefs.current.get(letter);
    const section = sectionRefs.current.get(letter);
    if (!heading || !section) return;

    // The scroll-spy must stay off for the whole jump, not a fixed 500ms:
    // the animated scroll can run up to 1200ms, and if the spy wakes up
    // mid-flight it keeps overwriting the active letter with whichever
    // section is entering the top zone — on arrival that is the *next*
    // section, so the bump ended up on "I" after clicking "H". It resumes a
    // beat after the scroll actually lands (queued observer callbacks fire
    // within a frame, so they're still ignored); the long timeout is only a
    // fallback if the animation is cancelled.
    spySuspendedRef.current = true;
    const resumeSpyIn = (ms: number) => {
      clearTimeout(spyTimerRef.current);
      spyTimerRef.current = setTimeout(() => {
        spySuspendedRef.current = false;
      }, ms);
    };
    resumeSpyIn(500);

    setActiveLetter(letter);

    // Measured from the section, not the sticky heading: while a sticky
    // element is actively pinned, it reports top ≈ 0 regardless of exactly
    // where within its stuck range the scroll actually is. Landing exactly
    // at one section's top puts the *previous* section right at that
    // stuck/unstuck boundary, so reading its position was unreliable —
    // this showed up as jumping backward into a short section landing at
    // its bottom edge instead of its top. The plain <section> isn't
    // sticky, so its position always reflects the true document location.
    const targetY =
      section.getBoundingClientRect().top + window.scrollY - headerHeight;
    if (prefersReducedMotion() || !userInitiated) {
      window.scrollTo(0, targetY);
    } else {
      resumeSpyIn(1600);
      animateScrollTo(targetY, () => resumeSpyIn(150));
    }

    if (userInitiated) {
      bounceHeading(heading);
      // Deferred: the browser applies its own focus-on-activation for the
      // rail button's click *after* this handler runs, which would
      // otherwise steal focus back from the heading. Only done for
      // deliberate activations (click/keyboard) — moving focus on every
      // letter crossed during a drag would spam screen reader output.
      // preventScroll is essential here: without it, focusing the heading
      // triggers the browser's *own* corrective scroll-into-view, which
      // would fight the scroll animation already in flight.
      requestAnimationFrame(() => heading.focus({ preventScroll: true }));
    }
  };

  // Type-to-jump: pressing a letter while focus is anywhere in the list (or
  // the rail) jumps to that letter's section, like a native list/menu — so
  // keyboard users never have to travel back to the rail to use the
  // alphabet. Focus lands on the section heading, which screen readers
  // announce. Only the list/rail subtree is wired up, so typing in the
  // search field is untouched; letters with no contacts, modified keys and
  // held-down repeats are ignored (and left to the browser).
  const handleTypeToJump = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (!/^[a-z]$/i.test(event.key)) return;
    if ((event.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
    const letter = event.key.toUpperCase();
    if (!headingRefs.current.has(letter)) return;
    event.preventDefault();
    activateLetter(letter, { userInitiated: true });
  };

  if (addresses.length === 0) {
    return (
      <p className="animate-fade-in mt-12 px-6 text-center font-display text-lg font-semibold text-ink-soft">
        No results for &ldquo;{search}&rdquo; — try a different search, or make
        a new friend with that name!
      </p>
    );
  }

  return (
    <div className="-mr-4 flex items-start" onKeyDown={handleTypeToJump}>
      {/*
        The rail comes first in DOM/tab order (reachable right after the
        search input) despite rendering on the right visually (order-2) —
        otherwise a keyboard user would have to tab through every contact
        card before reaching it.

        -mr-4 cancels the page container's right padding for this row only,
        so the rail (fixed-width, at the far right) reaches the container's
        true right edge — the viewport edge on mobile, the centered box's
        edge on desktop — rather than sitting inset like the rest of the
        page content. The list column below restores that same padding
        (pr-4) for its own content so contact cards keep their right inset.

        The rail itself is position: fixed to the full height of the screen,
        so it never moves or scrolls with the page. It sits inside an
        in-flow, same-width placeholder on purpose: a fixed element with no
        left/right set stays at its static position, so the placeholder pins
        it horizontally to the list's right edge at any viewport width (no
        centering math), while the placeholder also reserves the column's
        width so the cards don't run underneath it.
      */}
      <div className="order-2 w-7 shrink-0">
        <AlphabetRail
          availableLetters={new Set(letters)}
          activeLetter={activeLetter}
          onActivate={activateLetter}
        />
      </div>
      <div className="order-1 min-w-0 flex-1 pr-4">
        {Array.from(groups.entries()).map(([letter, group]) => (
          <section
            key={letter}
            aria-labelledby={`letter-${letter}`}
            data-letter={letter}
            ref={(el) => {
              if (el) {
                sectionRefs.current.set(letter, el);
              } else {
                sectionRefs.current.delete(letter);
              }
            }}
          >
            <h2
              id={`letter-${letter}`}
              ref={(el) => {
                if (el) {
                  headingRefs.current.set(letter, el);
                } else {
                  headingRefs.current.delete(letter);
                }
              }}
              tabIndex={-1}
              className="sticky top-[var(--header-h,0px)] z-10 bg-[linear-gradient(var(--color-page)_82%,transparent)] pt-1 pb-3 font-display text-[72px] leading-[1.05] font-extrabold tracking-[-1px] text-accent outline-none"
            >
              <span data-letter-glyph className="inline-block">
                {letter}
              </span>
            </h2>
            {group.map((address) => (
              <AddressItem key={address.id} address={address} search={search} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export default AddressList;
