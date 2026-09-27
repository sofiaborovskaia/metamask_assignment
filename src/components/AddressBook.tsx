import { useState } from "react";
import SearchBar from "./SearchBar";
import AddressList from "./AddressList";

const AddressBook = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-2xl font-bold mb-4">Address Book</h1>
      <SearchBar search={search} setSearch={setSearch} />
      <AddressList search={search} />
    </div>
  );
};

export default AddressBook;
