import { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AddressContext } from "../context/AddressContext";

const AddressItemPage = () => {
  const { id } = useParams();
  const { addresses } = useContext(AddressContext);
  const address = addresses.find((a) => a.id === Number(id));

  if (!address) {
    return <p>Address not found.</p>;
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <Link to="/" className="text-sm mb-4 inline-block">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mb-2">{address.name}</h1>
      <p>{address.address}</p>
      <p>
        {address.city}, {address.state} {address.zip}
      </p>
    </div>
  );
};

export default AddressItemPage;
