import { useTranslation } from "react-i18next";
import { MapPin, Phone } from "lucide-react";

const PHONE_NUMBER = "+380971476397";
const TELEGRAM_URL = "https://t.me/svity_pokrov";
const INSTAGRAM_URL = "https://instagram.com/svity_pokrov";
const FACEBOOK_URL = "https://facebook.com/svity.pokrov";
const MAP_ADDRESS = "Heroiv Ukrainy Street, 13, Pokrov, Ukraine";
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  MAP_ADDRESS,
)}`;

const contactIconClass =
  "flex size-8 shrink-0 items-center justify-center rounded-full border border-[#1C100E] text-[#1C100E] min-[744px]:size-[34px]";
const socialIconClass =
  "size-8 shrink-0 object-contain filter-[brightness(0)_saturate(100%)_invert(7%)_sepia(22%)_saturate(1564%)_hue-rotate(329deg)_brightness(94%)_contrast(95%)] min-[744px]:size-[34px]";
const contactLinkClass =
  "flex items-center gap-3.5 text-[16px] leading-[1.35] text-[#1C100E] transition hover:text-[#83105F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:text-[20px]";

function MapPreview({ address }: { address: string }) {
  return (
    <a
      href={MAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={address}
      className="relative left-1/2 block h-[250px] w-[calc(100vw-32px)] -translate-x-1/2 overflow-hidden rounded-[10px] outline-none transition focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:h-[422px] min-[744px]:w-[calc(100vw-80px)] min-[1023px]:left-auto min-[1023px]:w-[436px] min-[1023px]:translate-x-0 min-[1440px]:w-[628px] min-[1900px]:w-[585px]"
    >
      <img
        src="/map.png"
        alt={address}
        className="h-full w-full object-fill"
      />
    </a>
  );
}

export function Contacts() {
  const { t } = useTranslation();

  return (
    <section className="bg-secondary px-4 pb-12 pt-0 font-montserrat text-[#1C100E] min-[744px]:px-10 min-[744px]:pb-16 min-[1023px]:px-8 min-[1023px]:py-[100px] min-[1440px]:px-20 min-[1900px]:px-[399px] min-[1920px]:py-[120px]">
      <div className="grid w-full gap-8 min-[1023px]:grid-cols-[minmax(0,1fr)_436px] min-[1023px]:items-center min-[1023px]:gap-12 min-[1440px]:grid-cols-[minmax(0,1fr)_628px] min-[1440px]:gap-20 min-[1900px]:grid-cols-[464px_585px] min-[1900px]:gap-[133px]">
        <div>
          <h1 className="text-center text-[32px] font-medium leading-[1.2] min-[744px]:text-[56px] min-[1023px]:text-left">
            {t("contactTitle")}
          </h1>

          <address className="mt-7 flex flex-col gap-4 not-italic min-[744px]:mx-auto min-[744px]:mt-8 min-[744px]:max-w-[664px] min-[744px]:gap-5 min-[1023px]:mx-0 min-[1023px]:max-w-none">
            <a href={`tel:${PHONE_NUMBER}`} className={contactLinkClass}>
              <span className={contactIconClass}>
                <Phone
                  className="size-[18px] min-[744px]:size-5"
                  aria-hidden="true"
                />
              </span>
              {t("contactNumber")}
            </a>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
            >
              <img
                src="/telega.png"
                alt=""
                className={socialIconClass}
                aria-hidden="true"
              />
              {t("telegram")}
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
            >
              <img
                src="/inst.png"
                alt=""
                className={socialIconClass}
                aria-hidden="true"
              />
              {t("inst")}
            </a>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
            >
              <img
                src="/fb.png"
                alt=""
                className={socialIconClass}
                aria-hidden="true"
              />
              {t("facebook")}
            </a>

            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${contactLinkClass} items-start`}
            >
              <span className={contactIconClass}>
                <MapPin
                  className="size-[18px] min-[744px]:size-5"
                  aria-hidden="true"
                />
              </span>
              {t("contactAddress")}
            </a>
          </address>
        </div>

        <div className="w-full justify-self-end">
          <MapPreview address={t("contactAddress")} />
        </div>
      </div>
    </section>
  );
}
