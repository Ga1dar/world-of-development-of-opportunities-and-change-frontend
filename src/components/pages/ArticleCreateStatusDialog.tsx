import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type ArticleCreateStatusDialogProps = {
  isOpen: boolean;
  status: "success" | "error";
  onClose: () => void;
};

const copy = {
  ua: {
    close: "Закрити",
    successTitle: "Дякуємо, що створили нову статтю!",
    successDescription:
      "Стаття з'явиться на сайті після схвалення адміністратором",
    errorTitle: "Статтю не вдалося створити",
    errorDescription: "Спробуйте пізніше або перевірте з'єднання із сервером",
  },
  en: {
    close: "Close",
    successTitle: "Thank you for creating a new article!",
    successDescription:
      "The article will appear on the site after administrator approval",
    errorTitle: "Could not create the article",
    errorDescription: "Try again later or check the server connection",
  },
} as const;

export function ArticleCreateStatusDialog({
  isOpen,
  status,
  onClose,
}: ArticleCreateStatusDialogProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
  const text = copy[lang];
  const isSuccess = status === "success";

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
      className="fixed inset-0 z-[240] flex items-start justify-center bg-[#1C100E]/25 px-4 pt-[108px] backdrop-blur-[1px] min-[744px]:pt-[145px] min-[1023px]:pt-[138px] min-[1420px]:pt-[170px] min-[1900px]:pt-[185px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-create-status-title"
        aria-describedby="article-create-status-description"
        className="relative flex w-full max-w-[358px] flex-col items-center rounded-[20px] bg-secondary px-6 pb-10 pt-8 text-center font-montserrat text-[#1C100E] shadow-[0_20px_70px_rgba(28,16,14,0.16)] min-[744px]:max-w-[600px] min-[744px]:rounded-[18px] min-[744px]:px-10 min-[744px]:pb-14 min-[744px]:pt-11 min-[1420px]:pb-16 min-[1420px]:pt-12 min-[1900px]:max-w-[825px]"
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
          className="h-[92px] w-[120px] object-contain min-[744px]:h-[112px] min-[744px]:w-[150px] min-[1900px]:h-[128px] min-[1900px]:w-[170px]"
        />

        <h2
          id="article-create-status-title"
          className="mt-2 max-w-[270px] text-[15px] font-medium leading-[1.18] min-[744px]:max-w-[360px] min-[744px]:text-[18px] min-[1420px]:text-[24px] min-[1900px]:max-w-[520px] min-[1900px]:text-[28px]"
        >
          {isSuccess ? text.successTitle : text.errorTitle}
        </h2>

        <p
          id="article-create-status-description"
          className="mt-5 max-w-[245px] text-[10px] font-normal leading-[1.25] text-[#1C100E]/70 min-[744px]:max-w-[310px] min-[744px]:text-[11px] min-[1420px]:max-w-[360px] min-[1420px]:text-[12px] min-[1900px]:max-w-[460px] min-[1900px]:text-[14px]"
        >
          {isSuccess ? text.successDescription : text.errorDescription}
        </p>
      </section>
    </div>
  );
}
