import { Link } from "react-router-dom";
import { Address } from "../data/addresses";

interface AddressItemProps {
  address: Address;
}

const AddressItem = ({ address }: AddressItemProps) => {
  const { id, name, address: street, city, state, zip } = address;

  return (
    <Link to={`/${id}`}>
      <div className="border border-gray-300 rounded p-4 mb-3">
        <p className="font-semibold">{name}</p>
        <p className="text-gray-600">{street}</p>
        <p className="text-gray-600">
          {city}, {state} {zip}
        </p>
      </div>
    </Link>
  );
};

export default AddressItem;
