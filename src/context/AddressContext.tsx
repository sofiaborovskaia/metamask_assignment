import { createContext, useState, ReactNode } from "react";
import addresses, { Address } from "../data/addresses";

interface AddressContextValue {
  addresses: Address[];
}

export const AddressContext = createContext<AddressContextValue>({
  addresses: [],
});

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addressesState] = useState(addresses);

  return (
    <AddressContext.Provider value={{ addresses: addressesState }}>
      {children}
    </AddressContext.Provider>
  );
};
