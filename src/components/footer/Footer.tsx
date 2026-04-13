import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import "./Footer.css";
import { LogIn } from "../elements/Login/LogIn";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
              Будьте завжди в курсі новин
            </Label>
            <div className="flex">
              <Input
                id="footer-email"
                type="email"
                placeholder="Адреса електронної пошти ..."
                className="footerInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button className="footerButton" disabled={isLoading}>
                {isLoading ? "Відправка..." : "Підписатися"}
              </Button>
            </div>
            <div className="inputText">Без спаму. Відпишіться будь-коли.</div>
            {message && <p className="successText">{message}</p>}
            {error && <p className="errorText">{error}</p>}
          </form>
        </Field>
        <div className="contactInfo">
          <h3 className="contactTitle">Контакти:</h3>
          <a className="contactText" href="tel:+380971476397">
            Тел. 097 147 63 97
          </a>
          <a
            href="https://t.me/svity_pokrov"
            className="contactText"
            target="_blank"
            rel="noopener noreferrer"
          >
            t.me/svity_pokrov
          </a>
          <a
            href="https://instagram.com/svity_pokrov"
            className="contactText"
            target="_blank"
            rel="noopener noreferrer"
          >
            inst: svity_pokrov
          </a>
          <a
            href="https://facebook.com/svity.pokrov"
            className="contactText"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook: Світи Покров Простір Розвитку
          </a>
        </div>
        <img src="/Logo1.png" alt="Logo" className="footerLogo" />
      </div>
      <div className="footerBottom">
        <div className="footerBottomInfo">
          <h3 className="bottomTitle"> СвіTи</h3>
          <div className="bottomText">
            Простір розвитку та ментального здоров’я для дітей і дорослих
          </div>
        </div>
        <nav className="footerNav">
          <Link to="/about" className="footerGrig">
            Про нас
          </Link>
          <Link to="/specialists" className="footerGrig">
            Наші спеціалісти
          </Link>
          <Link to="/events" className="footerGrig">
            Події
          </Link>
          <Link to="/contacts" className="footerGrig">
            Контакти
          </Link>
          <LogIn variant="footer"/>
          <Link to="/" className="footerGrig">
            Підтримка
          </Link>
          <Link to="/" className="footerGrig  order-7">
            © 2026 Розробники
          </Link>
          <div className="footerGrig order-8">
            Зроблнно в Україні
          </div>
        </nav>
      </div>
    </footer>
  );
}
