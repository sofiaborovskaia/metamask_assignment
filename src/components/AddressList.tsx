import { useContext } from "react";
import { AddressContext } from "../context/AddressContext";
import AddressItem from "./AddressItem";
import { Address } from "../data/addresses";

interface AddressListProps {
  search: string;
}

const AddressList = ({ search }: AddressListProps) => {
  const { addresses } = useContext(AddressContext);

  const filteredAddresses = addresses.filter((address) =>
    address.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {filteredAddresses.map((address: Address) => (
        <AddressItem key={address.id} address={address} />
      ))}
    </div>
  );
};

export default AddressList;
