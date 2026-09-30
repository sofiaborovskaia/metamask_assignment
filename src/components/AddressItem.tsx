import { Link } from "react-router-dom";
import { Address } from "../data/addresses";
import { avatarColorFor, avatarTextColorFor, initialsFor } from "../lib/avatar";

interface AddressItemProps {
  address: Address;
  search: string;
}

// Wraps every occurrence of `query` in `text` with a real <mark> element —
// semantically "this is the highlighted search term", not just a styled
// span, so the emphasis isn't conveyed by color alone.
const highlightMatch = (text: string, query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-[#ebeae5] text-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

const AddressItem = ({ address, search }: AddressItemProps) => {
  const { id, name, address: street, city, state, zip } = address;

  return (
    <Link
      to={`/${id}`}
      // The focus ring is drawn *inside* the card (negative offset) rather
      // than around it, so it can't stick out under the next section's
      // sticky letter heading — which means the focused card needs no
      // z-index lift and scrolls behind the letters like any other card.
      className="-mx-2 block rounded-xl px-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-center gap-3 border-b border-line py-3">
        <div
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${avatarColorFor(
            name,
          )} ${avatarTextColorFor(name)}`}
        >
          {initialsFor(name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">
            {highlightMatch(name, search)}
          </p>
          <p className="text-sm text-ink-soft truncate">{street}</p>
          <p className="text-sm text-ink-soft truncate">
            {city}, {state} {zip}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default AddressItem;
