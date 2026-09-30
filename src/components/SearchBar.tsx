import { useState } from "react";

interface SearchBarProps {
  search: string;
  setSearch: (search: string) => void;
  resultCount: number;
}

// Icon reserved zone once active — needs to roughly match the icon's own
// footprint (padding + glyph) for it to land flush against the right edge
// after the slide.
const ICON_ZONE = "3rem";

const SearchBar = ({ search, setSearch, resultCount }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || search.length > 0;
  const resultMessage =
    resultCount === 1 ? "1 result found" : `${resultCount} results found`;

  return (
    <div className="mb-4">
      {/*
        Ported from Codrops' "Kaede" text input effect: the input sits
        absolutely positioned, hidden off-screen to the left at rest, and
        slides in on focus/fill while an icon+text bar on top slides the
        other way, ending up as a small chip over the wrapper's own
        (differently colored) background on the right. The wrapper's
        overflow-hidden + rounded corners clip both children automatically,
        so neither needs to match the radius individually.

        That bar is a real <label htmlFor>, not a decorative div: since the
        input itself is transformed off-screen at rest, a plain click on
        the visible pill wouldn't land on the input at all (transformed
        elements are hit-tested at their post-transform position) — a real
        label's native click-to-focus behavior redirects to the input
        regardless of where the input itself currently sits, which is
        exactly the mechanism the original effect relies on.
      */}
      <div className="relative h-12 overflow-hidden rounded-[14px] bg-page-alt">
        <label
          htmlFor="address-search"
          className={`absolute inset-0 z-10 flex cursor-text items-center gap-2 px-3 transition-transform duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] motion-reduce:transition-none ${
            isActive ? "translate-x-[calc(100%-3rem)]" : "translate-x-0"
          }`}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-ink"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path
              d="M21 21l-4.3-4.3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span
            className={`font-sans text-[15px] font-medium whitespace-nowrap text-ink transition-opacity duration-300 motion-reduce:transition-none ${
              isActive ? "opacity-0" : "opacity-100"
            }`}
          >
            Search
          </span>
        </label>

        <input
          id="address-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
          className={`absolute inset-y-0 left-0 rounded-l-[14px] border-0 bg-ink-soft/10 pl-3 font-sans text-[15px] font-medium text-ink outline-none transition-transform duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] motion-reduce:transition-none ${
            isActive ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: `calc(100% - ${ICON_ZONE})` }}
        />
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {resultMessage}
      </p>
    </div>
  );
};

export default SearchBar;
