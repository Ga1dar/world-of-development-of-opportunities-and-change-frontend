import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import "./Footer.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"; // заменить на реальный URL из переменных окружения

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        // заменить на реальный эндпоинт
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Невдалося підписатися. Спробуйте ще раз.");
      }
      setMessage("Дякуємо за підписку!");
      setEmail("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Сталася невідома помилка.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="flex flex-col w-full gap-x-6 bg-primary text-[#F0E8F0] box-border p-4">
      <div className="flex flex-col mb-6">
        <Field className="flex flex-col">
          <form onSubmit={handleSubscribe} className="flex flex-col gap-y-4 mb-6">
            <Label htmlFor="footer-email" className="flex flex-col font-montserrat font-normal text-lg items-start text-[#F0E8F0]">
              {t("footerLabel")}
            </Label>
            <div className="flex flex-col sm:grid sm:grid-cols-[3fr_1fr] sm:gap-x-8">
              <Input
                id="footer-email"
                type="email"
                placeholder={t("footer-email")}
                className="bg-[#F0E8F0] text-[#2D302D] font-montserrat p-3 rounded-4xl mb-2 sm:col-start-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                 pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
              />
              <div className="font-montserrat font-normal text-[12px] text-[#F0E8F0] mb-4 sm:col-start-1 ">{t("inputText")}</div>
              <Button className="bg-[#F0E8F0] text-[#2D302D] font-montserrat p-3 rounded-4xl sm:col-start-2 sm:row-start-1" disabled={isLoading}>
                {isLoading
                  ? t("footerButton.sending")
                  : t("footerButton.subscribe")}
              </Button>
            </div>
            {message && <p className="font-montserrat font-normal text-[12px] text-center text-green-600">{message}</p>}
            {error && <p className="font-montserrat font-normal text-[12px] text-center text-red-600">{error}</p>}
          </form>
        </Field>
        <div className="sm:flex sm:w-full gap-x-6">
          <div className="flex justify-between">
            <div className="flex flex-col gap-y-2">
              <h3 className="font-montserrat font-medium text-2xl sm:mb-2">{t("contactTitle")}</h3>
              <a
                className="font-montserrat text-[#E8E8E8] font-normal text-[16px] sm:mb-4"
                href="tel:+380971476397">
                {t("contactNumber")}
              </a>
              <div className="flex flex-row gap-x-6">
                <a
                  href="https://t.me/svity_pokrov"
                  className="h-7 w-7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/telega.png" alt="Telegram"/>
                </a>
                <a
                  href="https://instagram.com/svity_pokrov"
                  className="h-7 w-7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/inst.png" alt="Instagram"/>
                </a>
                <a
                  href="https://facebook.com/svity.pokrov"
                  className="h-7 w-7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                   <img src="/fb.png" alt="Facebook"/>
                </a>
              </div>
            </div>
            <Link to="/">
              <img src="/Logo1.png" alt="Logo" className="h-21 w-21 sm:hidden" />
            </Link>
          </div>
          <nav
            className="grid grid-cols-[auto_auto_auto] grid-rows-[25px_25px]
            font-montserrat font-normal text-xs
            justify-between gap-y-4 mb-4 sm:w-full sm:mt-2"
          >
            <Link
              to="/about"
              className="col-start-1">
              {t("aboutUs")}
            </Link>
            <Link
              to="/events"
              className="col-start-1 row-start-2">
              {t("events")}
            </Link>
            <Link
              to="/contacts"
              className="col-start-2 row-start-1">
              {t("contacts")}
            </Link>
            <Link
              to="/specialists"
              className="col-start-3 row-start-2">
              {t("specialistsTitle")}
            </Link>
            <Link
              to="/events"
              className="col-start-3 row-start-1">
              {t("materials")}
            </Link>
            <Link
              to="/"
              className="col-start-2 row-start-2">
              {t("support")}
            </Link>
          </nav>
        </div>
      </div>
      <div className="flex flex-col">
        
        <div className="w-full font-montserrat text-[#E8E8E8]">
          <h3 className="font-montserrat font-medium text-2xl mb-2">
            {t("bottomTitle")}
          </h3>
          <div className="text-sm mb-4">
            {t("bottomText")}
          </div>
        </div>
          <div className="grid grid-cols-[auto_auto] grid-rows-[auto-auto] justify-between gap-y-2 mb-4">
            <Link to="" className="font-montserrat font-normal text-[#B6B6B6] text-xs">
              {t("politics")}
            </Link>
            <Link to="" className="font-montserrat font-normal text-[#B6B6B6] text-xs col-start-1 row-start-2">
              {t("conditions")}
            </Link>
            <Link to="/" className="font-montserrat font-normal text-[#B6B6B6] text-xs col-start-2 row-start-2">
              {t("developers")}
            </Link>
            <div className="font-montserrat font-normal text-[#B6B6B6] text-xs">{t("mdInUkr")}</div>
          </div>
      </div>
    </footer>
  );
}
