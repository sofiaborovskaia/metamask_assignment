import AddressItem from "./AddressItem";
import { Address } from "../data/addresses";

interface AddressListProps {
  addresses: Address[];
}

const AddressList = ({ addresses }: AddressListProps) => {
  return (
    <div>
      {addresses.map((address: Address) => (
        <AddressItem key={address.id} address={address} />
      ))}
    </div>
  );
};

export default AddressList;
