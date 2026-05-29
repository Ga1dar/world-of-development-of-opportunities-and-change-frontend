import { useTranslation } from "react-i18next";
import { MapPin, Phone } from "lucide-react";

const PHONE_NUMBER = "+380971476397";
const TELEGRAM_URL = "https://t.me/svity_pokrov";
const INSTAGRAM_URL = "https://instagram.com/svity_pokrov";
const FACEBOOK_URL = "https://facebook.com/svity.pokrov";
const MAP_ADDRESS =
  "Вул. Героїв України, 13, м. Покров, Дніпропетровська область, Україна";
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  MAP_ADDRESS,
)}`;

const contactIconClass =
  "flex size-5 shrink-0 items-center justify-center rounded-full border border-[#402940]/35 text-[#402940] min-[1420px]:size-4 min-[1900px]:size-5";

function MapPreview() {
  return (
    <a
      href={MAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={MAP_ADDRESS}
      className="group relative block aspect-[1.62] w-full overflow-hidden bg-[#D9F8E8] outline-none transition focus-visible:ring-2 focus-visible:ring-[#40213F]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(112,210,178,0.28)_1px,transparent_1px),linear-gradient(0deg,rgba(112,210,178,0.28)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="absolute left-[-12%] top-[28%] h-3 w-[125%] -rotate-6 bg-white/90 shadow-[0_0_0_1px_rgba(123,198,175,0.45)]" />
      <div className="absolute left-[-8%] top-[66%] h-3 w-[120%] rotate-2 bg-white/90 shadow-[0_0_0_1px_rgba(123,198,175,0.45)]" />
      <div className="absolute left-[20%] top-[-10%] h-[120%] w-3 rotate-12 bg-white/90 shadow-[0_0_0_1px_rgba(123,198,175,0.45)]" />
      <div className="absolute left-[64%] top-[-12%] h-[125%] w-3 -rotate-8 bg-white/90 shadow-[0_0_0_1px_rgba(123,198,175,0.45)]" />
      <div className="absolute left-[40%] top-[5%] h-[90%] w-2 rotate-45 bg-white/80" />

      <span className="absolute left-[50%] top-[42%] flex size-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-[#E73C3C] text-white shadow-[0_4px_10px_rgba(64,41,64,0.25)] transition group-hover:-translate-y-[105%]">
        <MapPin className="size-5 fill-current" aria-hidden="true" />
      </span>

      <span className="absolute bottom-2 right-2 rounded-[4px] bg-white/95 px-2 py-1 font-montserrat text-[10px] font-medium text-[#1C100E]/70 shadow-sm">
        Google
      </span>
    </a>
  );
}

export function Contacts() {
  const { t } = useTranslation();

  return (
    <section className="bg-secondary px-5 pb-12 pt-0 font-montserrat text-[#1C100E] sm:px-10 sm:pb-16 min-[1023px]:px-16 min-[1420px]:px-20 min-[1420px]:pb-15 min-[1420px]:pt-[100px] min-[1900px]:pt-[120px] min-[1900px]:pb-17">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 min-[1420px]:max-w-[1200px] min-[1420px]:grid-cols-[358px_1fr] min-[1420px]:items-center min-[1420px]:gap-20 min-[1900px]:max-w-[1548px] min-[1900px]:grid-cols-[464px_1fr] min-[1900px]:gap-24">
        <div className="pt-3 sm:pt-0 min-[1420px]:pt-0">
          <h1 className="text-center text-[28px] font-medium leading-[1.2] sm:text-[32px] min-[1420px]:text-left min-[1420px]:text-[32px] min-[1900px]:text-[40px]">
            {t("contactTitle")}
          </h1>

          <address className="mt-7 flex flex-col gap-4 not-italic sm:mx-auto sm:max-w-[360px] min-[1420px]:mx-0 min-[1420px]:mt-8 min-[1420px]:max-w-none min-[1420px]:gap-4 min-[1900px]:gap-5">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-3 text-[16px] leading-[1.35] transition hover:text-[#83105F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[1420px]:text-[14px] min-[1900px]:text-[18px]"
            >
              <span className={contactIconClass}>
                <Phone className="size-3.5" aria-hidden="true" />
              </span>
              {t("contactNumber")}
            </a>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[16px] leading-[1.35] transition hover:text-[#83105F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[1420px]:text-[14px] min-[1900px]:text-[18px]"
            >
              <span className={contactIconClass}>
                <img src="/telega.png" alt="" className="size-3.5" aria-hidden="true" />
              </span>
              {t("telegram")}
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[16px] leading-[1.35] transition hover:text-[#83105F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[1420px]:text-[14px] min-[1900px]:text-[18px]"
            >
              <span className={contactIconClass}>
                <img src="/inst.png" alt="" className="size-3.5" aria-hidden="true" />
              </span>
              {t("inst")}
            </a>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[16px] leading-[1.35] transition hover:text-[#83105F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[1420px]:text-[14px] min-[1900px]:text-[18px]"
            >
              <span className={contactIconClass}>
                <img src="/fb.png" alt="" className="size-3.5" aria-hidden="true" />
              </span>
              {t("facebook")}
            </a>

            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-[16px] leading-[1.35] transition hover:text-[#83105F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[1420px]:text-[14px] min-[1900px]:text-[18px]"
            >
              <span className={contactIconClass}>
                <MapPin className="size-3.5" aria-hidden="true" />
              </span>
              {t("contactAddress")}
            </a>
          </address>
        </div>

        <div className="mx-auto w-full max-w-[620px] min-[1420px]:max-w-none">
          <MapPreview />
        </div>
      </div>
    </section>
  );
}
