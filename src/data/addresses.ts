export interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const addresses: Address[] = [
  {
    id: 1,
    name: "John Doe",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001"
  },
  {
    id: 2,
    name: "Jane Smith",
    address: "456 Elm St",
    city: "Los Angeles",
    state: "CA",
    zip: "90001"
  },
  {
    id: 3,
    name: "Alice Johnson",
    address: "789 Oak St",
    city: "Chicago",
    state: "IL",
    zip: "60601"
  },
  {
    id: 4,
    name: "Bob Brown",
    address: "321 Pine St",
    city: "Houston",
    state: "TX",
    zip: "77002"
  },
  {
    id: 5,
    name: "Charlie Green",
    address: "654 Maple St",
    city: "Phoenix",
    state: "AZ",
    zip: "85001"
  }
];

export default addresses;
