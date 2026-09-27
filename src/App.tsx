import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AddressProvider } from "./context/AddressContext";
import AddressBook from "./components/AddressBook";
import AddressItemPage from "./pages/AddressItemPage";

const App = () => (
  <AddressProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AddressBook />} />
        <Route path="/:id" element={<AddressItemPage />} />
      </Routes>
    </BrowserRouter>
  </AddressProvider>
);

export default App;
