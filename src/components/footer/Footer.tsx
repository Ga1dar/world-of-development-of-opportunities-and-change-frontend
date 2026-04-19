import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import "./Footer.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; // заменить на реальный URL из переменных окружения

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
    <footer className="footer">
      <div className="footerInfo">
        <Field className="footerSubscribe">
          <form onSubmit={handleSubscribe}>
            <Label htmlFor="footer-email" className="footerLabel">
              {t("footerLabel")}
            </Label>
            <div className="flex">
              <Input
                id="footer-email"
                type="email"
                placeholder={t("footer-email")}
                className="footerInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button className="footerButton" disabled={isLoading}>
                {isLoading
                  ? t("footerButton.sending")
                  : t("footerButton.subscribe")}
              </Button>
            </div>
            <div className="inputText">{t("inputText")}</div>
            {message && <p className="successText">{message}</p>}
            {error && <p className="errorText">{error}</p>}
          </form>
        </Field>
        <div className="contactInfo">
          <h3 className="contactTitle">{t("contactTitle")}</h3>
          <a className="contactText" href="tel:+380971476397">
            {t("contactNumber")}
          </a>
          <a
            href="https://t.me/svity_pokrov"
            className="contactText"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("telegram")}
          </a>
          <a
            href="https://instagram.com/svity_pokrov"
            className="contactText"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("inst")}
          </a>
          <a
            href="https://facebook.com/svity.pokrov"
            className="contactText"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("facebook")}
          </a>
        </div>
          {/* <img src="/Logo1.png" alt="Logo" className="footerLogo" />         */}
      </div>
      <div className="footerBottom">
        <div className="footerBottomInfo">
          <h3 className="bottomTitle"> {t("bottomTitle")}</h3>
          <div className="bottomText">{t("bottomText")}</div>
        </div>
        <nav className="footerNav">
          <Link to="/about" className="footerGrig">
            {t("aboutUs")}
          </Link>
          <Link to="/specialists" className="footerGrig">
            {t("specialistsTitle")}
          </Link>
          <Link to="/events" className="footerGrig">
            {t("events")}
          </Link>
          <Link to="/events" className="footerGrig">
             {t("materials")}
          </Link>
          <Link to="/contacts" className="footerGrig">
            {t("contacts")}
          </Link>
          
          <Link to="/" className="footerGrig">
            {t("support")}
          </Link>
          <Link to="/" className="footerGrig  order-7">
            {t("developers")}
          </Link>
          <div className="footerGrig order-8">{t("mdInUkr")}</div>
        </nav>
      </div>
    </footer>
  );
}
