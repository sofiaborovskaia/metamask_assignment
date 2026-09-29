import { useEffect, useRef, useState } from "react";
import AddressItem from "./AddressItem";
import AlphabetRail from "./AlphabetRail";
import { Address } from "../data/addresses";

interface AddressListProps {
  addresses: Address[];
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

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Native `scrollIntoView({behavior: "smooth"})` is unreliable on iOS
// Safari — it frequently jumps instantly regardless of the requested
// behavior. Driving the scroll manually with the same eased-tween
// technique used for the rail's bump guarantees consistent motion on
// every browser.
let scrollAnimationHandle: number | undefined;

const animateScrollTo = (targetY: number) => {
  if (scrollAnimationHandle) cancelAnimationFrame(scrollAnimationHandle);
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(600, Math.max(200, Math.abs(distance) * 0.3));
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + distance * easeOutCubic(t));
    if (t < 1) {
      scrollAnimationHandle = requestAnimationFrame(tick);
    }
  };
  scrollAnimationHandle = requestAnimationFrame(tick);
};

const AddressList = ({ addresses }: AddressListProps) => {
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
      { rootMargin: "0px 0px -78% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lettersKey]);

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
    if (!heading) return;

    spySuspendedRef.current = true;
    clearTimeout(spyTimerRef.current);
    spyTimerRef.current = setTimeout(() => {
      spySuspendedRef.current = false;
    }, 500);

    setActiveLetter(letter);

    const targetY = heading.getBoundingClientRect().top + window.scrollY;
    if (prefersReducedMotion() || !userInitiated) {
      window.scrollTo(0, targetY);
    } else {
      animateScrollTo(targetY);
    }

    if (userInitiated) {
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

  return (
    <div className="-mr-4 flex items-start">
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
      */}
      <AlphabetRail
        availableLetters={new Set(letters)}
        activeLetter={activeLetter}
        onActivate={activateLetter}
        className="order-2"
      />
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
              className="sticky top-0 z-10 bg-[linear-gradient(var(--color-page)_82%,transparent)] pt-1 pb-3 font-display text-[72px] leading-[1.05] font-extrabold tracking-[-1px] text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {letter}
            </h2>
            {group.map((address) => (
              <AddressItem key={address.id} address={address} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export default AddressList;
