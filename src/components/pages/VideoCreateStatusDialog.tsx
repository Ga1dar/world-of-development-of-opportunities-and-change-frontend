import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type VideoCreateStatusDialogProps = {
  isOpen: boolean;
  status: "success" | "error";
  onClose: () => void;
};

const copy = {
  ua: {
    close: "Закрити",
    successTitle: "Дякуємо, що створили нове відео!",
    successDescription:
      "Відео з'явиться на сайті після схвалення адміністратором",
    errorTitle: "Відео не вдалося створити",
    errorDescription:
      "Створити відео не получилось. Спробуйте пізніше або перевірте з'єднання із сервером",
  },
  en: {
    close: "Close",
    successTitle: "Thank you for creating a new video!",
    successDescription:
      "The video will appear on the site after administrator approval",
    errorTitle: "Could not create the video",
    errorDescription:
      "Could not create the video. Try again later or check the server connection",
  },
} as const;

export function VideoCreateStatusDialog({
  isOpen,
  status,
  onClose,
}: VideoCreateStatusDialogProps) {
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
      className="fixed inset-0 z-[240] flex items-start justify-center bg-[#1C100E]/28 px-4 pt-[108px] backdrop-blur-[1px] min-[744px]:pt-[145px] min-[1023px]:pt-[138px] min-[1420px]:pt-[170px] min-[1900px]:pt-[185px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-create-status-title"
        aria-describedby="video-create-status-description"
        className="relative flex min-h-[397px] w-full max-w-[358px] flex-col items-center rounded-[20px] bg-secondary px-6 pb-10 pt-8 text-center font-montserrat text-[#1C100E] shadow-[0_20px_70px_rgba(28,16,14,0.16)] min-[744px]:min-h-[401px] min-[744px]:max-w-[600px] min-[744px]:rounded-[18px] min-[744px]:px-10 min-[744px]:pb-12 min-[744px]:pt-11 min-[1420px]:min-h-[444px] min-[1420px]:pb-14 min-[1420px]:pt-12 min-[1900px]:min-h-[475px] min-[1900px]:max-w-[825px]"
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
          className="h-[104px] w-[136px] object-contain min-[744px]:h-[128px] min-[744px]:w-[170px] min-[1900px]:h-[148px] min-[1900px]:w-[198px]"
        />

        <h2
          id="video-create-status-title"
          className="mt-3 max-w-[270px] text-[18px] font-medium leading-[1.18] min-[744px]:max-w-[390px] min-[744px]:text-[22px] min-[1420px]:text-[25px] min-[1900px]:max-w-[560px] min-[1900px]:text-[30px]"
        >
          {isSuccess ? text.successTitle : text.errorTitle}
        </h2>

        <p
          id="video-create-status-description"
          className="mt-6 max-w-[250px] text-[11px] font-normal leading-[1.25] text-[#1C100E]/70 min-[744px]:max-w-[320px] min-[744px]:text-[12px] min-[1420px]:max-w-[365px] min-[1420px]:text-[13px] min-[1900px]:max-w-[470px] min-[1900px]:text-[15px]"
        >
          {isSuccess ? text.successDescription : text.errorDescription}
        </p>
      </section>
    </div>
  );
}
