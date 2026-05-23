import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import "./Footer.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { endpoints } from "../api/endpoints";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);    setError("");
    setMessage("");
    try {
      const response = await fetch(endpoints.newsletterSubscribe, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error(t("FailedSubscribe"));
      }
      setMessage(t("Thank"));
      setEmail("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("UnknownError"));
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <footer className="box-border flex w-full  flex-col gap-x-6 rounded-t-[30px] bg-primary px-4 pt-4 pb-1 text-[#F0E8F0] sm:mb-4 min-[1420px]:px-20 min-[1420px]:pt-6 min-[1420px]:pb-1">
      <div className="mb-6 flex flex-col min-[1420px]:flex-row min-[1420px]:gap-x-8">
        <Field className="flex flex-col">
          <form onSubmit={handleSubscribe} className="flex flex-col gap-y-4 mb-6">
            <Label htmlFor="footer-email" className="flex flex-col items-start font-montserrat text-lg font-medium text-[#F0E8F0] min-[1420px]:text-2xl">
              {t("footerLabel")}
            </Label>
            <div className="footer-subscribe-row flex flex-col sm:grid sm:grid-cols-[3fr_1fr] sm:gap-x-8 min-[1900px]:grid-cols-[585px_277px]">
              <Input
                id="footer-email"
                type="email"
                placeholder={t("footer-email")}
                className="mb-2 h-10 rounded-[30px] bg-[#F0E8F0] p-3 
                font-montserrat text-[#2D302D] sm:col-start-1 min-[1420px]:h-12 
                min-[1420px]:w-[410px] min-[1900px]:h-[46px] min-[1900px]:w-[585px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                 pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
              />
              <div className="font-montserrat font-normal text-[12px] text-[#F0E8F0] mb-4 sm:col-start-1 ">{t("inputText")}</div>
              <Button
                className="h-10 rounded-[30px] bg-[#F0E8F0]
                p-3 font-montserrat text-[#2D302D] sm:col-start-2 sm:row-start-1
                min-[1420px]:w-48.5 min-[1900px]:h-10 min-[1900px]:w-69.25"
                disabled={isLoading}
              >
                {isLoading
                  ? t("footerButton.sending")
                  : t("footerButton.subscribe")}
              </Button>
            </div>
            {message && <p className="font-montserrat font-normal text-[12px] text-center text-green-600">{message}</p>}
            {error && <p className="mt-3 font-montserrat text-[12px] text-red-500 xl:text-sm">{error}</p>}
          </form>
        </Field>
        <div className="sm:flex sm:w-full gap-x-6 justify-between">
          <div className="flex justify-between sm:w-[35%]">
            <div className="flex flex-col gap-y-2">
              <h3 className="font-montserrat font-medium text-2xl sm:mb-2">{t("contactTitle")}</h3>
              <a
                className="font-montserrat text-[#E8E8E8] font-normal text-[16px] sm:mb-4"
                href="tel:+380971476397">
                {t("contactNumber")}
              </a>
              <div className="flex flex-row gap-x-6 mb-6">
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
              <img src="/Logo1.png" alt="Logo" className="h-22 w-22 sm:hidden" />
            </Link>
          </div>
          <nav
            className="mb-4 grid grid-cols-2 grid-rows-3
            sm:grid-cols-[auto_auto_auto] sm:grid-rows-[25px_25px]
            min-[1420px]:grid-cols-[auto_auto] min-[1420px]:grid-rows-[25px_25px]
            font-montserrat font-normal text-xs min-[1420px]:text-sm
            justify-between gap-y-4 sm:mt-2 sm:w-full min-[1420px]:w-102.75"
          >
            <Link
              to="/about"
              className="col-start-1 row-start-1">
              {t("aboutUs")}
            </Link>
            <Link
              to="/events"
              className="col-start-1 row-start-2 sm:row-start-2 min-[1420px]:row-start-3">
              {t("events")}
            </Link>
            <Link
              to="/contacts"
              className="col-start-2 row-start-1 sm:col-start-2">
              {t("contacts")}
            </Link>
            <Link
              to="/specialists"
              className="col-start-2 row-start-3 sm:col-start-3 sm:row-start-2 min-[1420px]:col-start-1 min-[1420px]:row-start-2">
              {t("specialistsTitle")}
            </Link>
            <Link
              to="/materials"
              className="col-start-1 row-start-3 sm:col-start-3 sm:row-start-1 min-[1420px]:col-start-2 min-[1420px]:row-start-2">
              {t("materials")}
            </Link>
            <Link
              to="/"
              className="col-start-2 row-start-2 min-[1420px]:col-start-2 min-[1420px]:row-start-2">
              {t("support")}
            </Link>
          </nav>
        </div>
      </div>
      <div className="flex flex-col min-[1420px]:flex-row min-[1420px]:gap-x-6">
        <div className="w-full min-[1420px]:w-157 font-montserrat text-[#E8E8E8]">
          <h3 className="font-montserrat font-medium text-2xl mb-2">
            {t("bottomTitle")}
          </h3>
          <div className="text-sm mb-4 min-[1420px]:text-lg">
            {t("bottomText")}
          </div>
        </div>
        <div
          className="grid grid-cols-2 grid-rows-[24px_24px_24px] 
          justify-between gap-y-2 sm:grid-cols-[auto_auto_auto]
          min-[1420px]:w-[65%] min-[1420px]:grid-rows-[40px_40px_40px]">
            <Link to="" className="font-montserrat font-normal text-[#B6B6B6] text-xs row-start-2">
              {t("politics")}
            </Link>
            <Link to="" className="font-montserrat font-normal text-[#B6B6B6] text-xs col-start-2 row-start-3">
              {t("conditions")}
            </Link>
            <Link to="/" className="font-montserrat font-normal text-[#B6B6B6] text-xs col-start-1 row-start-3">
              {t("developers")}
            </Link>
            <div className="font-montserrat font-normal text-[#B6B6B6] text-xs col-start-1 row-start-2">{t("mdInUkr")}</div>
            <Link to="/" className="hidden sm:block sm:col-start-3 sm:row-start-1 sm:row-end-4 mt-0">
              <img 
              src="/Logo1.png" 
              alt="Logo" 
              className="hidden h-30 w-30 sm:col-start-3 
              sm:row-start-1 sm:row-end-4 sm:inline-block
              min-[1420px]:h-27.25 min-[1420px]:w-[108px]"
            />
            </Link>
          </div>
      </div>
    </footer>
  );
}
