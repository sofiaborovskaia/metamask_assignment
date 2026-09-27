interface SearchBarProps {
  search: string;
  setSearch: (search: string) => void;
}

const SearchBar = ({ search, setSearch }: SearchBarProps) => {
  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search for an address..."
      className="w-full p-3 text-base border border-gray-300 rounded mb-4"
    />
  );
};

export default SearchBar;
