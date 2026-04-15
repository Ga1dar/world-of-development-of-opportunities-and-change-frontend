import { Route, Routes } from "react-router-dom";
import { Header } from "./components/header/Header.tsx";
import { Home } from "./components/pages/home/Home.tsx";
import { Aboutus } from "./components/pages/Aboutus.tsx";
import { Contacts } from "./components/pages/Contacts.tsx";
import { Events } from "./components/pages/Events.tsx";
import { Specialists } from "./components/pages/Specialists.tsx";
import { Footer } from "./components/footer/Footer.tsx";
import "./App.css";
import { Edukationmaterial } from "./components/pages/EducationMaterial.tsx";

function App() {
  return (
    <>
      <div className="bg-secondary h-full">
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/specialists" element={<Specialists />} />
          <Route path="/events" element={<Events />} />
          <Route path="/materials" element={<Edukationmaterial />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
}

export default App;
