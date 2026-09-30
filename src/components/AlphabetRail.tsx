import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface AlphabetRailProps {
  availableLetters: Set<string>;
  activeLetter: string | null;
  onActivate: (letter: string, options: { userInitiated: boolean }) => void;
  className?: string;
}

const vibrate = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10);
  }
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Ported from the prototype's bumpShapeD: a blob silhouette flush with the
// rail's left edge, bulging to full width for one row's height, easing in
// and out over transitionHeight px above and below.
const bumpShapeD = (
  centerY: number,
  height: number,
  width: number,
  rowHeight: number,
  transitionHeight: number
) => {
  const half = rowHeight / 2;
  const top = centerY - half;
  const bottom = centerY + half;

  const t1 = Math.max(0, top - transitionHeight);
  const t2 = top;
  const t3 = bottom;
  const t4 = Math.min(height, bottom + transitionHeight);

  return `
    M 0,${t1.toFixed(1)}
    C 0,${(t1 + transitionHeight * 0.5).toFixed(1)} ${width},${(t2 - transitionHeight * 0.5).toFixed(1)} ${width},${t2.toFixed(1)}
    L ${width},${t3.toFixed(1)}
    C ${width},${(t3 + transitionHeight * 0.5).toFixed(1)} 0,${(t4 - transitionHeight * 0.5).toFixed(1)} 0,${t4.toFixed(1)}
    Z
  `.trim();
};

const AlphabetRail = ({
  availableLetters,
  activeLetter,
  onActivate,
  className = "",
}: AlphabetRailProps) => {
  const railWrapRef = useRef<HTMLElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const bumpPathRef = useRef<SVGPathElement>(null);
  const bumpLabelRef = useRef<HTMLDivElement>(null);
  const currentCenterYRef = useRef<number | null>(null);
  const animHandleRef = useRef<number | undefined>(undefined);
  const draggingRef = useRef(false);
  const lastDragLetterRef = useRef<string | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Minimum pointer movement, in px, before a press counts as a drag rather
  // than a click. Below this, calling preventDefault() would suppress the
  // browser's own click event for a plain tap (see handlePointerDown).
  const DRAG_THRESHOLD = 6;

  const enabledLetters = ALPHABET.filter((letter) => availableLetters.has(letter));
  const activeIndex = activeLetter ? ALPHABET.indexOf(activeLetter) : -1;

  const rowHeight = () => (railWrapRef.current?.clientHeight ?? 0) / ALPHABET.length;

  const drawBumpAt = (centerY: number, letter: string) => {
    const wrap = railWrapRef.current;
    if (!wrap || !bumpPathRef.current || !bumpLabelRef.current) return;
    const height = wrap.clientHeight;
    const width = wrap.clientWidth;
    const rowH = rowHeight();
    const transitionH = Math.min(Math.max(rowH * 0.6, 9), 34);

    bumpPathRef.current.setAttribute(
      "d",
      bumpShapeD(centerY, height, width, rowH, transitionH)
    );
    bumpLabelRef.current.style.top = `${centerY}px`;
    bumpLabelRef.current.textContent = letter;
  };

  // Ported from animateBumpTo: eases the bump from its current position to
  // the new one over 320ms, rather than snapping — this continuous glide is
  // the prototype's core "delightful" motion detail.
  const animateBumpTo = (targetCenterY: number, letter: string, duration: number) => {
    if (animHandleRef.current) cancelAnimationFrame(animHandleRef.current);
    const from = currentCenterYRef.current ?? targetCenterY;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const y = from + (targetCenterY - from) * eased;
      drawBumpAt(y, letter);
      currentCenterYRef.current = y;
      if (t < 1) {
        animHandleRef.current = requestAnimationFrame(tick);
      }
    };
    animHandleRef.current = requestAnimationFrame(tick);
  };

  const moveBumpTo = (letter: string, animate: boolean) => {
    const index = ALPHABET.indexOf(letter);
    if (index === -1) return;
    const rowH = rowHeight();
    const targetCenterY = rowH * index + rowH / 2;

    if (animate && currentCenterYRef.current != null && !prefersReducedMotion()) {
      animateBumpTo(targetCenterY, letter, 320);
    } else {
      currentCenterYRef.current = targetCenterY;
      drawBumpAt(targetCenterY, letter);
    }
  };

  // The bump always follows the controlled `activeLetter` (set by the
  // parent from either a rail selection or its scroll-spy), gliding smoothly
  // between positions regardless of what triggered the change.
  useLayoutEffect(() => {
    if (activeLetter) moveBumpTo(activeLetter, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLetter]);

  useEffect(() => {
    const handleResize = () => {
      if (activeLetter) moveBumpTo(activeLetter, false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLetter]);

  // Tracks which letter currently has DOM focus while roving with the
  // arrow keys — deliberately separate from `activeLetter` (the committed
  // selection/bump position), which only changes on click or Enter/Space.
  const focusedLetterRef = useRef<string | null>(null);

  // Letter whose button has *keyboard* focus (focus-visible), if any. The
  // active letter's own button is hidden behind the bump (opacity 0) — and
  // it's also the rail's tab stop — so without this, tabbing into the rail
  // landed on an invisible button and looked like the rail was skipped
  // entirely. The bump draws the focus ring for that case instead.
  const [keyboardFocusLetter, setKeyboardFocusLetter] = useState<string | null>(null);

  const moveFocus = (direction: 1 | -1) => {
    if (enabledLetters.length === 0) return;
    const reference = focusedLetterRef.current ?? activeLetter;
    const currentIndex = reference ? enabledLetters.indexOf(reference) : -1;
    const nextIndex = Math.max(
      0,
      Math.min(enabledLetters.length - 1, currentIndex + direction)
    );
    tabRefs.current.get(enabledLetters[nextIndex])?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (enabledLetters[0]) tabRefs.current.get(enabledLetters[0])?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const last = enabledLetters[enabledLetters.length - 1];
      if (last) tabRefs.current.get(last)?.focus();
    }
  };

  const letterFromPointer = (clientY: number): string | null => {
    const wrap = railWrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const index = Math.min(ALPHABET.length - 1, Math.floor(ratio * ALPHABET.length));
    return ALPHABET[index];
  };

  const updateFromPointer = (clientY: number) => {
    const letter = letterFromPointer(clientY);
    if (!letter || !availableLetters.has(letter)) return;
    if (letter !== lastDragLetterRef.current) {
      lastDragLetterRef.current = letter;
      vibrate();
      onActivate(letter, { userInitiated: false });
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    // Deliberately no preventDefault() and no pointer capture here: either
    // one breaks plain clicks on a letter (preventDefault suppresses the
    // click event; capture retargets it to the <nav> instead of the letter
    // button, so its onClick never fires). Capture is only taken once the
    // press turns into a drag, in handlePointerMove.
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const start = pointerStartRef.current;
    if (!start) return;

    if (!draggingRef.current) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      draggingRef.current = true;
      // Keep receiving move events even if the pointer leaves the rail.
      railWrapRef.current?.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    updateFromPointer(event.clientY);
  };

  const stopDragging = (event: PointerEvent<HTMLElement>) => {
    pointerStartRef.current = null;
    draggingRef.current = false;
    lastDragLetterRef.current = null;
    if (railWrapRef.current?.hasPointerCapture(event.pointerId)) {
      railWrapRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <nav
      ref={railWrapRef}
      aria-label="Jump to letter"
      className={`fixed inset-y-0 flex w-7 touch-none overflow-hidden select-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div className="flex h-full flex-1 flex-col">
        {ALPHABET.map((letter, index) => {
          const enabled = availableLetters.has(letter);
          const isHiddenByBump = enabled && letter === activeLetter;
          const isStacked = index > activeIndex;
          const isTabStop = enabled && letter === (activeLetter ?? enabledLetters[0]);

          return (
            <button
              key={letter}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(letter, el);
                } else {
                  tabRefs.current.delete(letter);
                }
              }}
              type="button"
              disabled={!enabled}
              tabIndex={isTabStop ? 0 : -1}
              onFocus={(event) => {
                focusedLetterRef.current = letter;
                setKeyboardFocusLetter(
                  event.currentTarget.matches(":focus-visible") ? letter : null
                );
              }}
              onBlur={() => setKeyboardFocusLetter(null)}
              onClick={() => {
                vibrate();
                onActivate(letter, { userInitiated: true });
              }}
              onKeyDown={handleKeyDown}
              className={`tab flex flex-1 items-center justify-center rounded-r-lg font-display text-[12px] font-bold tracking-[0.2px] transition-[color,opacity] duration-[180ms] ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                enabled
                  ? "cursor-pointer text-ink"
                  : "disabled cursor-default text-tab-disabled-text"
              } ${isHiddenByBump ? "hidden-by-bump opacity-0" : ""} ${
                isStacked ? "stacked" : ""
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Ported from .bump-svg/.bump-label: a white blob with a soft drop
          shadow that glides between rows, with the active letter rendered on
          top of it instead of on the (now hidden) tab underneath. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      >
        <path
          ref={bumpPathRef}
          d=""
          className="fill-page drop-shadow-[2px_3px_5px_rgba(0,0,0,0.16)]"
        />
      </svg>
      <div
        ref={bumpLabelRef}
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-md px-1.5 font-display text-[15px] font-extrabold text-accent ${
          keyboardFocusLetter !== null && keyboardFocusLetter === activeLetter
            ? "ring-2 ring-accent"
            : ""
        }`}
      />
    </nav>
  );
};

export default AlphabetRail;
