import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type EventCreateSuccessDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const copy = {
  ua: {
    close: "Закрити",
    title: "Дякуємо, що створили нову подію!",
    description:
      "Подія зʼявиться на сайті після схвалення адміністратором",
  },
  en: {
    close: "Close",
    title: "Thank you for creating a new event!",
    description: "The event will appear on the site after administrator approval",
  },
} as const;

export function EventCreateSuccessDialog({
  isOpen,
  onClose,
}: EventCreateSuccessDialogProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
  const text = copy[lang];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[240] flex items-start justify-center bg-[#1C100E]/25 px-4 pt-[150px] backdrop-blur-[1px] min-[744px]:pt-[170px] min-[1023px]:pt-[150px] min-[1420px]:pt-[180px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-create-success-title"
        aria-describedby="event-create-success-description"
        className="relative flex w-full max-w-[270px] flex-col items-center rounded-[20px] bg-secondary px-6 pb-10 pt-8 text-center font-montserrat text-[#1C100E] shadow-[0_20px_70px_rgba(28,16,14,0.16)] min-[744px]:max-w-[430px] min-[744px]:rounded-[18px] min-[744px]:px-10 min-[744px]:pb-14 min-[744px]:pt-11 min-[1420px]:max-w-[475px] min-[1420px]:px-12 min-[1420px]:pb-16 min-[1420px]:pt-12"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={text.close}
          className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full text-[16px] leading-none text-[#1C100E]/35 transition hover:text-[#1C100E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
        >
          ×
        </button>

        <img
          src="/Logo1.png"
          alt=""
          aria-hidden="true"
          className="h-[92px] w-[120px] object-contain min-[744px]:h-[105px] min-[744px]:w-[140px] min-[1420px]:h-[112px] min-[1420px]:w-[150px]"
        />

        <h2
          id="event-create-success-title"
          className="mt-2 max-w-[250px] text-[15px] font-medium leading-[1.18] min-[744px]:max-w-[320px] min-[744px]:text-[18px] min-[1420px]:text-[20px]"
        >
          {text.title}
        </h2>

        <p
          id="event-create-success-description"
          className="mt-5 max-w-[230px] text-[10px] font-normal leading-[1.25] text-[#1C100E]/70 min-[744px]:max-w-[280px] min-[744px]:text-[11px] min-[1420px]:text-[12px]"
        >
          {text.description}
        </p>
      </section>
    </div>
  );
}
