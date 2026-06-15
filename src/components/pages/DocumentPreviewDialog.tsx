import { useEffect, useMemo } from "react";
import type { CabinetDocument } from "../../api/userCabinet";

type DocumentPreviewDialogProps = {
  document: CabinetDocument | null;
  language: string;
  onOpenChange: (open: boolean) => void;
};

const copy = {
  ua: {
    title: "Перегляд документа",
    close: "Закрити",
    alt: "Документ спеціаліста",
    open: "Відкрити документ",
  },
  en: {
    title: "Document preview",
    close: "Close",
    alt: "Specialist document",
    open: "Open document",
  },
};

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

export function DocumentPreviewDialog({
  document,
  language,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  const labels = useMemo(
    () => (isEnglishLanguage(language) ? copy.en : copy.ua),
    [language],
  );
  const isOpen = Boolean(document);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpenChange]);

  if (!document) return null;

  const isImage = /\.(?:png|jpe?g|webp|gif)(?:$|[?#])/i.test(document.fileUrl);
  const isPdf = /\.pdf(?:$|[?#])/i.test(document.fileUrl);

  return (
    <div
      className="fixed inset-0 z-[280] flex items-start justify-center bg-[#1C100E]/35 px-4 pt-12 backdrop-blur-[1px]
      min-[744px]:px-8 min-[744px]:pt-14 min-[1023px]:pt-16 min-[1420px]:pt-[86px] min-[1900px]:pt-[96px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className="relative flex min-h-[416px] w-full max-w-[357px] items-center justify-center rounded-[4px] bg-[#F0E8F0] px-5 py-8 shadow-xl
        min-[744px]:min-h-[560px] min-[744px]:max-w-[664px] min-[744px]:rounded-[8px] min-[744px]:px-10 min-[744px]:py-10
        min-[1023px]:min-h-[770px] min-[1023px]:max-w-[790px]
        min-[1420px]:min-h-[640px] min-[1420px]:max-w-[825px]
        min-[1900px]:min-h-[840px] min-[1900px]:max-w-[1170px]"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center font-montserrat text-[18px] leading-none text-[#1C100E]/35 transition hover:text-[#1C100E]/70"
          aria-label={labels.close}
        >
          ×
        </button>

        {isImage ? (
          <img
            src={document.fileUrl}
            alt={document.title || labels.alt}
            className="max-h-[75vh] max-w-full rounded-[8px] object-contain drop-shadow-sm"
          />
        ) : isPdf ? (
          <iframe
            src={document.fileUrl}
            title={document.title || labels.alt}
            className="h-[72vh] w-full rounded-[8px] border-0 bg-white"
          />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <img
              src="/document.png"
              alt={document.title || labels.alt}
              className="h-auto w-[240px] object-contain drop-shadow-sm min-[744px]:w-[430px]"
            />
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#1C100E] px-8 py-3 font-montserrat text-[13px] text-white"
            >
              {labels.open}
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
