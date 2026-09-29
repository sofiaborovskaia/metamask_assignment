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
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold mb-4">Address Book</h1>
      <SearchBar
        search={search}
        setSearch={setSearch}
        resultCount={filteredAddresses.length}
      />
      <AddressList addresses={filteredAddresses} />
    </div>
  );
};

export default AddressBook;
