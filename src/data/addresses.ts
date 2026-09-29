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
  },
  {
    id: 6,
    name: "Johnny Appleseed",
    address: "12 Orchard Ln",
    city: "Portland",
    state: "OR",
    zip: "97201"
  },
  {
    id: 7,
    name: "Janet Malone",
    address: "88 Birch Ave",
    city: "Seattle",
    state: "WA",
    zip: "98101"
  },
  {
    id: 8,
    name: "Johanna Reyes",
    address: "45 Cedar Ct",
    city: "Austin",
    state: "TX",
    zip: "73301"
  },
  {
    id: 9,
    name: "Marcus Johnson",
    address: "901 Walnut St",
    city: "Denver",
    state: "CO",
    zip: "80201"
  },
  {
    id: 10,
    name: "Anna Fernandez",
    address: "22 Spruce Rd",
    city: "Miami",
    state: "FL",
    zip: "33101"
  },
  {
    id: 11,
    name: "Diana Chen",
    address: "300 Aspen Dr",
    city: "Boston",
    state: "MA",
    zip: "02101"
  },
  {
    id: 12,
    name: "Brianna Cole",
    address: "17 Willow Way",
    city: "Nashville",
    state: "TN",
    zip: "37201"
  },
  {
    id: 13,
    name: "Samantha Ortiz",
    address: "58 Poplar Pl",
    city: "Denver",
    state: "CO",
    zip: "80202"
  },
  {
    id: 14,
    name: "Grace Bannon",
    address: "9 Magnolia Blvd",
    city: "Atlanta",
    state: "GA",
    zip: "30301"
  },
  {
    id: 15,
    name: "Daniel Park",
    address: "141 Chestnut St",
    city: "San Diego",
    state: "CA",
    zip: "92101"
  },
  {
    id: 16,
    name: "Nathaniel Shaw",
    address: "63 Sycamore Ter",
    city: "Minneapolis",
    state: "MN",
    zip: "55401"
  },
  {
    id: 17,
    name: "Ivy Jansen",
    address: "27 Hickory Ct",
    city: "Salt Lake City",
    state: "UT",
    zip: "84101"
  },
  {
    id: 18,
    name: "Owen Banner",
    address: "5 Redwood Cir",
    city: "Portland",
    state: "OR",
    zip: "97202"
  },
  {
    id: 19,
    name: "Priya Nair",
    address: "14 Elmwood Ave",
    city: "San Jose",
    state: "CA",
    zip: "95101"
  },
  {
    id: 20,
    name: "Marcus Bell",
    address: "76 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    zip: "90002"
  },
  {
    id: 21,
    name: "Eleanor Fitzgerald",
    address: "3 Harbor St",
    city: "Boston",
    state: "MA",
    zip: "02102"
  },
  {
    id: 22,
    name: "Marco Diaz",
    address: "210 Lakeview Dr",
    city: "Chicago",
    state: "IL",
    zip: "60602"
  },
  {
    id: 23,
    name: "Sofia Marchetti",
    address: "19 Vine St",
    city: "New York",
    state: "NY",
    zip: "10002"
  },
  {
    id: 24,
    name: "Tyler Johansson",
    address: "402 River Rd",
    city: "Minneapolis",
    state: "MN",
    zip: "55402"
  },
  {
    id: 25,
    name: "Ruth Okafor",
    address: "8 Garden Ct",
    city: "Houston",
    state: "TX",
    zip: "77003"
  },
  {
    id: 26,
    name: "Marianne Kowalski",
    address: "55 Fairview Ter",
    city: "Milwaukee",
    state: "WI",
    zip: "53201"
  },
  {
    id: 27,
    name: "Hassan Malik",
    address: "31 Brookside Way",
    city: "Detroit",
    state: "MI",
    zip: "48201"
  },
  {
    id: 28,
    name: "Johan Petersen",
    address: "6 Meadow Ln",
    city: "Seattle",
    state: "WA",
    zip: "98102"
  },
  {
    id: 29,
    name: "Isabella Marchese",
    address: "128 Crescent Ave",
    city: "Phoenix",
    state: "AZ",
    zip: "85002"
  },
  {
    id: 30,
    name: "Deandre Johnson",
    address: "47 Hillcrest Rd",
    city: "Atlanta",
    state: "GA",
    zip: "30302"
  },
  {
    id: 31,
    name: "Marisol Vega",
    address: "10 Cypress Ct",
    city: "Miami",
    state: "FL",
    zip: "33102"
  },
  {
    id: 32,
    name: "Nolan McAllister",
    address: "82 Birchwood Dr",
    city: "Denver",
    state: "CO",
    zip: "80203"
  },
  {
    id: 33,
    name: "Johnathan Reid",
    address: "3 Pinecrest Ave",
    city: "Nashville",
    state: "TN",
    zip: "37202"
  },
  {
    id: 34,
    name: "Yara Haddad",
    address: "61 Laurel St",
    city: "Austin",
    state: "TX",
    zip: "73302"
  },
  {
    id: 35,
    name: "Marcella Rossi",
    address: "24 Summit Ave",
    city: "San Diego",
    state: "CA",
    zip: "92102"
  }
];

export default addresses;
