import { useContext, useState } from "react";
import SearchBar from "./SearchBar";
import AddressList from "./AddressList";
import { AddressContext } from "../context/AddressContext";

const AddressBook = () => {
  const [search, setSearch] = useState("");
  const { addresses } = useContext(AddressContext);

  const filteredAddresses = addresses.filter((address) =>
    address.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-lg bg-page p-4">
      <h1 className="font-display text-[32px] font-extrabold tracking-[-0.2px] text-ink mb-3">
        Address Book
      </h1>
      <SearchBar
        search={search}
        setSearch={setSearch}
        resultCount={filteredAddresses.length}
      />
      <AddressList addresses={filteredAddresses} search={search} />
    </div>
  );
};

export default AddressBook;
