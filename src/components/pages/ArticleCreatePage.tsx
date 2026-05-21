import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { createEducationArticle } from "../../api/educationMaterials";
import { useCanCreateEvents } from "../../hooks/useCanCreateEvents";
import { ArticleCreateStatusDialog } from "./ArticleCreateStatusDialog";

const inputClass =
  "h-8 w-full rounded-[30px] border border-[#402940] bg-transparent px-3 text-[12px] font-normal text-[#1C100E] outline-none placeholder:text-[#1C100E]/55 focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:h-9 min-[1023px]:h-10 min-[1420px]:text-[14px]";

const labelClass =
  "w-full text-[15px] font-medium leading-[1.2] min-[744px]:text-[16px]";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] disabled:opacity-70";

const articleCreateCopy = {
  ua: {
    title: "Створити статтю",
    fields: {
      title: "Заголовок",
      titlePlaceholder: "Введіть заголовок статті",
      content: "Основний текст",
      contentPlaceholder: "Введіть основний текст статті",
      date: "Дата",
      time: "Час",
      image: "Додати зображення",
    },
    errors: {
      titleRequired: "Введіть заголовок статті.",
      contentRequired: "Введіть основний текст статті.",
      authRequired: "Увійдіть як спеціаліст, щоб створити статтю.",
      permissionDenied:
        "Створювати статті можуть лише підтверджені спеціалісти або адміністратори.",
      imageType: "Оберіть зображення у форматі JPEG, PNG або WEBP.",
      imageSize: "Зображення має бути меншим за 5 MB.",
      server:
        "Сервер не зміг зберегти статтю. Перевірте обов'язкові поля та спробуйте ще раз.",
      network:
        "Немає зв'язку із сервером. Перевірте, чи запущено бекенд, і спробуйте ще раз.",
      generic: "Не вдалося зберегти статтю. Спробуйте ще раз.",
    },
    denied:
      "Додавати статті можуть лише спеціалісти з підтвердженим профілем або адміністратори.",
    selectedImage: "Обране зображення",
    saving: "Зберігаємо...",
    save: "Зберегти статтю",
    back: "Повернутися до статей",
  },
  en: {
    title: "Create an article",
    fields: {
      title: "Title",
      titlePlaceholder: "Enter the article title",
      content: "Main text",
      contentPlaceholder: "Enter the main article text",
      date: "Date",
      time: "Time",
      image: "Add image",
    },
    errors: {
      titleRequired: "Enter the article title.",
      contentRequired: "Enter the main article text.",
      authRequired: "Sign in as a specialist to create an article.",
      permissionDenied:
        "Only verified specialists or administrators can create articles.",
      imageType: "Choose an image in JPEG, PNG, or WEBP format.",
      imageSize: "The image must be smaller than 5 MB.",
      server:
        "The server could not save the article. Check the required fields and try again.",
      network:
        "Cannot reach the server. Check that the backend is running and try again.",
      generic: "Could not save the article. Try again.",
    },
    denied:
      "Only specialists with a verified profile or administrators can add articles.",
    selectedImage: "Selected image",
    saving: "Saving...",
    save: "Save article",
    back: "Back to articles",
  },
} as const;

type ArticleCreateCopy = (typeof articleCreateCopy)[keyof typeof articleCreateCopy];

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const normalizePublishedAt = (date: string, time: string) => {
  const trimmedDate = date.trim();
  const trimmedTime = time.trim();

  if (!trimmedDate) return "";

  const isoDateMatch = trimmedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const uaDateMatch = trimmedDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  const dateValue = isoDateMatch
    ? trimmedDate
    : uaDateMatch
      ? `${uaDateMatch[3]}-${uaDateMatch[2]}-${uaDateMatch[1]}`
      : "";

  if (!dateValue) return "";

  const timeValue = trimmedTime.match(/^\d{2}:\d{2}$/) ? trimmedTime : "09:00";
  return new Date(`${dateValue}T${timeValue}:00`).toISOString();
};

const getLocalizedCreateError = (error: unknown, copy: ArticleCreateCopy) => {
  if (!(error instanceof Error)) return copy.errors.generic;

  const message = error.message.toLowerCase();

  if (message.includes("authentication") || message.includes("token")) {
    return copy.errors.authRequired;
  }

  if (
    message.includes("permission") ||
    message.includes("forbidden") ||
    message.includes("not allowed")
  ) {
    return copy.errors.permissionDenied;
  }

  if (message.includes("jpeg") || message.includes("png") || message.includes("webp")) {
    return copy.errors.imageType;
  }

  if (message.includes("5 mb") || message.includes("too large")) {
    return copy.errors.imageSize;
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return copy.errors.network;
  }

  if (message.includes("request failed") || message.includes("required")) {
    return copy.errors.server;
  }

  return copy.errors.generic;
};

export function ArticleCreatePage() {
  const { i18n } = useTranslation();
  const canCreateArticles = useCanCreateEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const language = useMemo<"ua" | "en">(
    () => (isEnglishLanguage(i18n.language) ? "en" : "ua"),
    [i18n.language],
  );
  const copy = articleCreateCopy[language];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusDialog, setStatusDialog] = useState<"success" | "error" | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImage = event.target.files?.[0] ?? null;
    setError("");

    if (!selectedImage) {
      setImage(null);
      return;
    }

    if (!allowedImageTypes.has(selectedImage.type)) {
      setError(copy.errors.imageType);
      event.target.value = "";
      return;
    }

    if (selectedImage.size > maxImageSize) {
      setError(copy.errors.imageSize);
      event.target.value = "";
      return;
    }

    setImage(selectedImage);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(copy.errors.titleRequired);
      return;
    }

    if (!content.trim()) {
      setError(copy.errors.contentRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      await createEducationArticle(
        {
          title,
          content,
          publishedAt: normalizePublishedAt(date, time),
          coverImage: image,
        },
        language,
      );

      setTitle("");
      setContent("");
      setDate("");
      setTime("");
      setImage(null);
      setStatusDialog("success");
    } catch (err) {
      console.error(getLocalizedCreateError(err, copy));
      setStatusDialog("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateArticles) {
    return (
      <section className="-mt-14 flex min-h-[50vh] items-center justify-center bg-secondary px-5 py-12 font-montserrat text-[#1C100E] sm:-mt-20 min-[1420px]:mt-0!">
        <p className="max-w-[520px] text-center text-[16px] leading-[1.4]">
          {copy.denied}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="-mt-14 min-h-[420px] bg-secondary px-5 pb-8 pt-5 font-montserrat text-[#1C100E] sm:-mt-20 min-[390px]:px-7 min-[744px]:min-h-[714px] min-[744px]:px-10 min-[744px]:pb-12 min-[744px]:pt-6 min-[1023px]:min-h-[780px] min-[1023px]:px-[74px] min-[1023px]:pt-[34px] min-[1420px]:mt-0! min-[1420px]:min-h-[760px] min-[1420px]:px-20 min-[1420px]:pt-[145px] min-[1900px]:min-h-[840px] min-[1900px]:pt-[168px]">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-[340px] flex-col items-center min-[744px]:max-w-[641px] min-[1023px]:max-w-[884px] min-[1420px]:max-w-[800px] min-[1900px]:max-w-[1140px]"
        >
          <h1 className="text-center text-[20px] font-medium leading-[1.25] min-[744px]:text-[28px] min-[1420px]:text-[32px]">
            {copy.title}
          </h1>

          <div className="mt-7 flex w-full flex-col gap-4 min-[744px]:mt-11 min-[744px]:gap-6 min-[1023px]:mt-9 min-[1420px]:mt-12">
            <label className={labelClass}>
              {copy.fields.title}
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={copy.fields.titlePlaceholder}
                className={`${inputClass} mt-2`}
                maxLength={180}
              />
            </label>

            <label className={labelClass}>
              {copy.fields.content}
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={copy.fields.contentPlaceholder}
                className={`${inputClass} mt-2 min-h-8 resize-y py-2 min-[744px]:min-h-9 min-[1023px]:min-h-10`}
              />
            </label>

            <div className="grid w-full grid-cols-2 gap-4 min-[744px]:grid-cols-[1fr_1fr_1.55fr] min-[744px]:gap-8 min-[1023px]:grid-cols-[1fr_1fr_2.1fr] min-[1900px]:gap-10">
              <label className={labelClass}>
                {copy.fields.date}
                <input
                  type="text"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  placeholder={copy.fields.date}
                  className={`${inputClass} mt-2`}
                />
              </label>

              <label className={labelClass}>
                {copy.fields.time}
                <input
                  type="text"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  placeholder={copy.fields.time}
                  className={`${inputClass} mt-2`}
                />
              </label>

              <div className="col-span-2 flex items-end min-[744px]:col-span-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[30px] bg-[#1C100E] px-6 text-[13px] font-medium text-[#F0E8F0] transition hover:bg-[#1C100E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[1900px]:h-12"
                >
                  <ImageIcon className="size-4" aria-hidden="true" />
                  {copy.fields.image}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {image ? (
              <p className="text-[11px] leading-[1.25] text-[#1C100E]/70 min-[744px]:text-[12px]">
                {copy.selectedImage}: {image.name}
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 w-full rounded-[18px] border border-[#83105F]/30 bg-[#83105F]/8 px-4 py-3 text-center text-[12px] leading-[1.35] text-[#83105F] min-[744px]:text-[14px]"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${yellowButton} mt-7 flex h-10 w-full items-center justify-center text-[13px] min-[744px]:mt-10 min-[744px]:max-w-[310px] min-[1023px]:max-w-[436px] min-[1420px]:max-w-[390px] min-[1900px]:h-12 min-[1900px]:max-w-[550px]`}
          >
            {isSubmitting ? copy.saving : copy.save}
          </button>

          <Link
            to="/materials/articles"
            className="mt-5 text-center text-[12px] text-[#83105F] underline-offset-4 hover:underline"
          >
            {copy.back}
          </Link>
        </form>
      </section>

      <ArticleCreateStatusDialog
        isOpen={statusDialog !== null}
        status={statusDialog ?? "success"}
        onClose={() => setStatusDialog(null)}
      />
    </>
  );
}
