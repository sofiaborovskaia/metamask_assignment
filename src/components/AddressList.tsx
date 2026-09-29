import AddressItem from "./AddressItem";
import { Address } from "../data/addresses";

interface AddressListProps {
  addresses: Address[];
}

const groupByLetter = (addresses: Address[]) => {
  const sorted = [...addresses].sort((a, b) => a.name.localeCompare(b.name));
  const groups = new Map<string, Address[]>();

  sorted.forEach((address) => {
    const letter = address.name[0]?.toUpperCase() ?? "#";
    if (!groups.has(letter)) {
      groups.set(letter, []);
    }
    groups.get(letter)!.push(address);
  });

  return groups;
};

const AddressList = ({ addresses }: AddressListProps) => {
  const groups = groupByLetter(addresses);

  return (
    <div>
      {Array.from(groups.entries()).map(([letter, group]) => (
        <section key={letter} aria-labelledby={`letter-${letter}`}>
          <h2
            id={`letter-${letter}`}
            className="sticky top-0 z-10 bg-page py-1 font-display text-2xl font-extrabold text-accent"
          >
            {letter}
          </h2>
          {group.map((address) => (
            <AddressItem key={address.id} address={address} />
          ))}
        </section>
      ))}
    </div>
  );
};

export default AddressList;
