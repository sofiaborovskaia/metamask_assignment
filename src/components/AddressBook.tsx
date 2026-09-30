import { useContext, useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import AddressList from "./AddressList";
import { AddressContext } from "../context/AddressContext";

const AddressBook = () => {
  const [search, setSearch] = useState("");
  const { addresses } = useContext(AddressContext);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // The title + search bar are sticky, so everything that scrolls under or
  // snaps to the top of the page needs to know how tall they are: the
  // sticky letter headings (via --header-h), the rail's jump targets and
  // scroll-spy (via the prop below), and the browser's own
  // scroll-into-view for keyboard focus (scroll-padding-top — the extra
  // 96px is the sticky letter heading, so a tabbed-to card isn't hidden
  // behind either layer).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const update = () => {
      const h = header.getBoundingClientRect().height;
      setHeaderHeight(h);
      root.style.setProperty("--header-h", `${h}px`);
      root.style.scrollPaddingTop = `${h + 96}px`;
      // Bottom clearance for the keyboard hint pill that floats over the list.
      root.style.scrollPaddingBottom = "84px";
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--header-h");
      root.style.removeProperty("scroll-padding-top");
      root.style.removeProperty("scroll-padding-bottom");
    };
  }, []);

  const filteredAddresses = addresses.filter((address) =>
    address.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-lg bg-page p-4">
      {/*
        Sticky so the title and search are always reachable while scrolling.
        -ml-4/-mt-4 + matching padding stretch its background over the
        container's left and top padding (so scrolled content can't peek
        out there), while mr-3 stops it exactly where the alphabet rail
        begins (the rail is 28px wide and runs the full height of the page;
        a header that reached the container edge would paint over its top
        letters). flow-root keeps
        the search bar's bottom margin inside the header's own box, so the
        opaque background covers that gap too. z-30 is above focused cards
        (z-20) and the sticky letter headings (z-10).
      */}
      <div
        ref={headerRef}
        className="sticky top-0 z-30 -mt-4 -ml-4 mr-3 flow-root bg-page pt-4 pl-4"
      >
        <h1 className="font-display text-[32px] font-extrabold tracking-[-0.2px] text-ink mb-3 outline-none">
          Address Book
        </h1>
        <SearchBar
          search={search}
          setSearch={setSearch}
          resultCount={filteredAddresses.length}
        />
      </div>
      <AddressList
        addresses={filteredAddresses}
        search={search}
        headerHeight={headerHeight}
      />
    </div>
  );
};

export default AddressBook;
