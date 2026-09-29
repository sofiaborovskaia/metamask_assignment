import { Link } from "react-router-dom";
import { Address } from "../data/addresses";

interface AddressItemProps {
  address: Address;
}

const AVATAR_COLORS = [
  "bg-avatar-orange",
  "bg-avatar-purple",
  "bg-avatar-olive",
  "bg-avatar-blue",
  "bg-avatar-maroon",
  "bg-avatar-pink",
];

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? "");
  return (first + last).toUpperCase();
};

const avatarColorFor = (name: string) => {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const AddressItem = ({ address }: AddressItemProps) => {
  const { id, name, address: street, city, state, zip } = address;

  return (
    <Link to={`/${id}`}>
      <div className="flex items-center gap-3 border-b border-line py-3">
        <div
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white ${avatarColorFor(
            name
          )}`}
        >
          {initialsFor(name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{name}</p>
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
