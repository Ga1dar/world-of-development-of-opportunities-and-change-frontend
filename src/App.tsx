import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import { Header } from "./components/Header.tsx";
import { Menu } from "./components/Menu.tsx";
import { Home } from "./components/pages/Home.tsx";
import { Contacts } from "./components/pages/Contacts.tsx";
import { Events } from "./components/pages/Events.tsx";
import { EventCategoryPage } from "./components/pages/EventCategoryPage.tsx";
import { EventCategoryCreatePage } from "./components/pages/EventCategoryCreatePage.tsx";
import { EventCreatePage } from "./components/pages/EventCreatePage.tsx";
import { EventDetailPage } from "./components/pages/EventDetailPage.tsx";
import { Specialists } from "./components/pages/Specialists.tsx";
import { SpecialistProfil } from "./components/pages/SpecialistProfil.tsx";
import { Footer } from "./components/Footer.tsx";
import "./App.css";
import { Edukationmaterial } from "./components/pages/EducationMaterial.tsx";
import { ArticlesPage } from "./components/pages/ArticlesPage.tsx";
import { ArticleDetailPage } from "./components/pages/ArticleDetailPage.tsx";
import { ArticleCreatePage } from "./components/pages/ArticleCreatePage.tsx";
import { VideoMaterialsPage } from "./components/pages/VideoMaterialsPage.tsx";
import { VideoDetailPage } from "./components/pages/VideoDetailPage.tsx";
import { VideoCreatePage } from "./components/pages/VideoCreatePage.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";
import { PasswordResetConfirm } from "./components/pages/PasswordResetConfirm.tsx";
import { Aboutus } from "./components/pages/Aboutus.tsx";
import { UserCabinetPage } from "./components/pages/UserCabinetPage.tsx";
import { SpecialistProfileEditPage } from "./components/pages/SpecialistProfileEditPage.tsx";
import { DevelopersPage } from "./components/pages/DevelopersPage.tsx";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-secondary">
      <Header isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="relative flex-1 min-[1420px]:flex">
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />

        <div
          className={`${isOpen ? "hidden sm:block" : "block"} flex-1 min-[1420px]:block`}
        >
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Aboutus />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/specialists/:id" element={<SpecialistProfil />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/categories/new" element={<EventCategoryCreatePage />} />
            <Route path="/events/:categorySlug/new" element={<EventCreatePage />} />
            <Route path="/events/:categorySlug/:eventId" element={<EventDetailPage />} />
            <Route path="/events/:categorySlug" element={<EventCategoryPage />} />
            <Route path="/materials" element={<Edukationmaterial />} />
            <Route path="/materials/articles" element={<ArticlesPage />} />
            <Route path="/materials/articles/new" element={<ArticleCreatePage />} />
            <Route path="/materials/articles/:slug" element={<ArticleDetailPage />} />
            <Route path="/materials/videos" element={<VideoMaterialsPage />} />
            <Route path="/materials/videos/new" element={<VideoCreatePage />} />
            <Route path="/materials/videos/:slug" element={<VideoDetailPage />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/profile" element={<UserCabinetPage />} />
            <Route path="/profile/specialist/edit" element={<SpecialistProfileEditPage />} />
            <Route
              path="/password-reset/confirm"
              element={<PasswordResetConfirm />}
            />
            <Route
              path="/users/password-reset/confirm"
              element={<PasswordResetConfirm />}
            />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
