import { Download } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadSpecialistDocuments } from "../../api/userCabinet";

type SpecialistApplicationReviewProps = {
  onClose: () => void;
};

const copy = {
  ua: {
    title: "Ваша заявка надіслана на розгляд адміністратору",
    wait: "Орієнтовний час очікування — до 24 годин",
    documents: "Можете завантажити свої дипломи та сертифікати",
    upload: "Завантажити документи",
    uploading: "Завантажуємо...",
    success: "Документи успішно завантажено.",
    error: "Не вдалося завантажити документи. Спробуйте ще раз.",
    close: "Закрити",
  },
  en: {
    title: "Your application has been sent to the administrator for review",
    wait: "Estimated review time is up to 24 hours",
    documents: "You can upload your diplomas and certificates",
    upload: "Upload documents",
    uploading: "Uploading...",
    success: "Documents uploaded successfully.",
    error: "Could not upload the documents. Please try again.",
    close: "Close",
  },
};

export function SpecialistApplicationReview({
  onClose,
}: SpecialistApplicationReviewProps) {
  const { i18n } = useTranslation();
  const labels = i18n.language.toLowerCase().startsWith("en") ? copy.en : copy.ua;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 3);
    event.target.value = "";
    if (!files.length) return;

    setIsUploading(true);
    setMessage("");
    setError("");

    try {
      await uploadSpecialistDocuments(files);
      setMessage(labels.success);
    } catch {
      setError(labels.error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section
      className="specialist-application-review relative mx-auto flex w-full max-w-[358px] flex-col items-center bg-[#F0E8F0] px-4 pt-4 pb-8 text-center font-montserrat text-[#1C100E]
      min-[744px]:rounded-[22px] min-[744px]:pt-8 min-[744px]:pb-9
      min-[1420px]:pt-9 min-[1420px]:pb-10 min-[1900px]:pt-10 min-[1900px]:pb-12"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="absolute top-3 right-4 hidden h-6 w-6 cursor-pointer items-center justify-center text-[18px] text-[#1C100E]/35 min-[744px]:flex"
      >
        ×
      </button>

      <img src="/Logo1.png" alt="СвіТи" className="h-[92px] w-[92px] object-contain min-[744px]:h-[104px] min-[744px]:w-[104px]" />
      <h1 className="mt-2 max-w-[310px] text-[19px] font-medium leading-[1.2] min-[744px]:text-[20px]">
        {labels.title}
      </h1>
      <p className="mt-4 text-[11px] leading-[1.3] text-[#1C100E]/65">{labels.wait}</p>
      <p className="mt-5 max-w-[280px] text-[14px] leading-[1.25]">{labels.documents}</p>
      <img src="/document.png" alt="" aria-hidden="true" className="mt-3 h-[92px] w-[92px] object-contain" />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[30px] bg-[#1C100E] px-5 text-[12px] font-medium text-white disabled:cursor-wait disabled:opacity-70"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {isUploading ? labels.uploading : labels.upload}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFiles}
        className="sr-only"
      />

      {message ? <p className="mt-3 text-[11px] text-[#287D3C]">{message}</p> : null}
      {error ? <p className="mt-3 text-[11px] text-[#83105F]">{error}</p> : null}
    </section>
  );
}
