interface SearchBarProps {
  search: string;
  setSearch: (search: string) => void;
  resultCount: number;
}

const SearchBar = ({ search, setSearch, resultCount }: SearchBarProps) => {
  const resultMessage =
    resultCount === 1 ? "1 result found" : `${resultCount} results found`;

  return (
    <div className="mb-4">
      <label htmlFor="address-search" className="block mb-1 font-medium">
        Search addresses
      </label>
      <input
        id="address-search"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for an address..."
        className="w-full p-3 text-base border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      />
      <p role="status" aria-live="polite" className="sr-only">
        {resultMessage}
      </p>
    </div>
  );
};

export default SearchBar;
