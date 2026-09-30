import { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AddressContext } from "../context/AddressContext";
import { avatarColorFor, avatarTextColorFor } from "../lib/avatar";

const AddressItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addresses } = useContext(AddressContext);
  const address = addresses.find((a) => a.id === Number(id));

  if (!address) {
    return (
      <main className="p-4">
        <p>Address not found.</p>
      </main>
    );
  }

  const { name, address: street, city, state, zip } = address;
  const textColor = avatarTextColorFor(name);

  return (
    <main className={`min-h-screen ${avatarColorFor(name)} ${textColor}`}>
      {/*
        Constrained to the same mx-auto max-w-lg width as the rest of the
        app (AddressBook's own wrapper), so the back button and content
        line up with the app's content column instead of the raw viewport
        edge — otherwise the back button sits far off to the left on wider
        screens.
      */}
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        {/*
          In the flow (not absolutely pinned to the page top) so the 50px
          gap to the name holds regardless of viewport height — the content
          column is vertically centered as a group, so a fixed top offset
          couldn't guarantee a fixed distance to the name.
        */}
        {/*
          border-current/outline-current instead of a hardcoded white/dark
          chrome: whatever text color this page's background is paired
          with, the button border and focus ring automatically match it
          and stay legible — no separate light/dark variant to keep in
          sync as the palette changes.

          Hover fills the background with ~10% white. Accepted trade-off,
          confirmed with the user: this drops button-text contrast below
          WCAG's 4.5:1 on 3 of the 6 avatar colors during hover specifically
          (purple to ~3.8:1) — the rest state and focus-visible outline are
          unaffected and stay fully compliant; only this transient,
          mouse-only hover state is a known exception.
        */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-[50px] inline-flex min-h-[24px] cursor-pointer items-center gap-1.5 rounded-full border border-current px-3 py-1.5 font-sans text-sm font-medium transition-colors duration-300 ease-in-out hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">←</span> Back to the address book
        </button>

        <h1 className="font-display text-3xl font-extrabold outline-none">
          {name}
        </h1>
        <p className="mt-3 text-lg">{street}</p>
        <p className="text-lg">
          {city}, {state} {zip}
        </p>
      </div>
    </main>
  );
};

export default AddressItemPage;
