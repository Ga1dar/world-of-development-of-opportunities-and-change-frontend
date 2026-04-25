import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import { Header } from "./components/Header.tsx";
import { Menu } from "./components/Menu.tsx";
import { Home } from "./components/pages/Home.tsx";
import { Aboutus } from "./components/pages/Aboutus.tsx";
import { Contacts } from "./components/pages/Contacts.tsx";
import { Events } from "./components/pages/Events.tsx";
import { Specialists } from "./components/pages/Specialists.tsx";
import { Footer } from "./components/Footer.tsx";
import "./App.css";
import { Edukationmaterial } from "./components/pages/EducationMaterial.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  

  return (
    <div className="flex min-h-screen flex-col bg-secondary ">
      <Header isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="relative flex-1 xl:flex">
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className={`${isOpen ? "hidden" : "block"} xl:block flex-1`}>
           <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Aboutus />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/events" element={<Events />} />
            <Route path="/materials" element={<Edukationmaterial />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
