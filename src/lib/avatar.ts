// Shared with AddressItem (list) and AddressItemPage (detail) so a
// contact's avatar color and initials are always identical between the two.
//
// Colors are sourced only from colors actually named in the brand's
// reference illustration — no invented shades, and nothing pulled from
// incidental illustration detail (a prior version used the caterpillar's
// yellow highlight; dropped, since it isn't a named color). See index.css
// for the per-color reasoning on the few that are darkened/nudged from
// their exact reference hex to clear WCAG AA's 4.5:1 — none of that
// reference palette's mid-toned colors (blue, green, olive, purple,
// orange-red) has enough lightness range to pair with another reference
// color unmodified. Each background is paired with a text color from
// that same set (no black or white) — the pairs below are hand-picked,
// and every ratio in the comments is computed from the actual hex values
// in index.css (WCAG relative luminance), all above the 4.5:1 AA minimum.
// (Pale pink was dropped — leaving light pink as the only pink, per
// request, rather than two near-identical pinks.)
interface AvatarColor {
  bg: string;
  text: string;
}

const AVATAR_COLORS: AvatarColor[] = [
  { bg: "bg-avatar-green", text: "text-avatar-pink" }, // 4.80:1
  { bg: "bg-avatar-blue", text: "text-ink-maroon" }, // 4.85:1
  { bg: "bg-avatar-purple", text: "text-avatar-lime" }, // 5.43:1
  { bg: "bg-avatar-olive", text: "text-avatar-lime" }, // 5.13:1
  { bg: "bg-avatar-maroon", text: "text-avatar-pink" }, // 5.49:1
  { bg: "bg-avatar-pink", text: "text-avatar-purple" }, // 4.85:1
];

const avatarFor = (name: string) => {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last =
    parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? "");
  return (first + last).toUpperCase();
};

export const avatarColorFor = (name: string) => avatarFor(name).bg;

export const avatarTextColorFor = (name: string) => avatarFor(name).text;
