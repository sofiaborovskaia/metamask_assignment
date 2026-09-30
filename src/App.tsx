import { useContext, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  type Location,
} from "react-router-dom";
import { AddressContext, AddressProvider } from "./context/AddressContext";
import AddressBook from "./components/AddressBook";
import AddressItemPage from "./pages/AddressItemPage";
import { avatarColorFor } from "./lib/avatar";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const AppRoutes = ({ location }: { location: Location }) => (
  <Routes location={location}>
    <Route path="/" element={<AddressBook />} />
    <Route path="/:id" element={<AddressItemPage />} />
  </Routes>
);

// The detail page is a full-bleed color card meant to read as sitting above
// the list, so it must stay the top layer regardless of whether it's the
// one entering or leaving — not whichever side happens to be "incoming".
const isDetailPath = (pathname: string) => pathname !== "/";

// A plain vertical slide, the same for both navigation directions:
// whichever page is entering slides down from the top, whichever page is
// exiting slides back up. React Router doesn't keep the outgoing route
// mounted during a navigation on its own, so this keeps it around in a
// separate layer for the duration of its exit animation
// instead of unmounting it instantly.
const AnimatedRoutes = () => {
  const location = useLocation();
  const { addresses } = useContext(AddressContext);
  const [current, setCurrent] = useState(location);
  const [outgoing, setOutgoing] = useState<Location | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // The "back" exit easing dips slightly past 0 before snapping up, which
  // briefly nudges the translated layer *down* a little. Since that layer
  // is otherwise background-less, that sliver would reveal whatever's
  // behind it. Colouring the layer itself (extended a bit above the
  // viewport, to cover the dip) instead of relying on the page it
  // contains keeps the reveal from ever showing, however far the easing
  // overshoots.
  const detailColorFor = (pathname: string) => {
    const address = addresses.find((a) => a.id === Number(pathname.slice(1)));
    return address ? avatarColorFor(address.name) : undefined;
  };

  useEffect(() => {
    if (location.pathname === current.pathname) return;

    if (prefersReducedMotion()) {
      setCurrent(location);
      return;
    }

    setOutgoing(current);
    setCurrent(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    // Move focus to the new page's heading so keyboard/screen reader users
    // land somewhere sensible after a route change, instead of focus
    // silently staying wherever it was on the page that just left.
    const heading = currentRef.current?.querySelector("h1");
    if (heading instanceof HTMLElement) {
      if (!heading.hasAttribute("tabindex")) {
        heading.setAttribute("tabindex", "-1");
      }
      heading.focus();
    }
  }, [current]);

  const outgoingZ = outgoing && isDetailPath(outgoing.pathname) ? "z-20" : "z-10";
  const currentZ = isDetailPath(current.pathname) ? "z-20" : "z-10";

  // A plain "fixed inset-0" layer for the list; a taller, colored, upward-
  // extended layer for the detail page so the exit easing's dip never
  // uncovers anything above it (see detailColorFor above).
  const layerClasses = (pathname: string) => {
    const color = detailColorFor(pathname);
    if (!color) return "fixed inset-0";
    return `fixed inset-x-0 bottom-0 -top-[15vh] h-[115vh] pt-[15vh] ${color}`;
  };

  return (
    <div className="relative">
      {outgoing && (
        <div
          aria-hidden="true"
          className={`animate-page-exit-to-top ${layerClasses(outgoing.pathname)} ${outgoingZ} overflow-y-auto`}
          onAnimationEnd={() => setOutgoing(null)}
        >
          <AppRoutes location={outgoing} />
        </div>
      )}
      {/*
        The detail page always renders as the top layer, whether it's the
        one entering or leaving — it's a full-bleed color card meant to sit
        visually above the list, not the other way around. overflow-y-auto
        lets the transitioning page's own content still scroll internally
        for the brief transition window, since it's temporarily
        fixed-height instead of normal flow.
      */}
      <div
        ref={currentRef}
        key={current.pathname}
        className={
          outgoing
            ? `animate-page-enter-from-top ${layerClasses(current.pathname)} ${currentZ} overflow-y-auto`
            : ""
        }
      >
        <AppRoutes location={current} />
      </div>
    </div>
  );
};

const App = () => (
  <AddressProvider>
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  </AddressProvider>
);

export default App;
