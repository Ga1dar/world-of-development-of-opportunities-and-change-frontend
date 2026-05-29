import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ImageIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createEvent,
  getEventCategories,
  type EventCategory,
} from "../../api/events";
import { useCanCreateEvents } from "../../hooks/useCanCreateEvents";
import { EventCreateSuccessDialog } from "./EventCreateSuccessDialog";

const MAX_DESCRIPTION_LENGTH = 300;
const MAX_EVENT_IMAGES = 6;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const inputClass =
  "h-8 w-full rounded-[30px] border border-[#402940] bg-transparent px-3 text-[12px] font-normal text-[#1C100E] outline-none placeholder:text-[#1C100E]/55 focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:h-9 min-[1023px]:h-10 min-[1420px]:text-[14px]";

const labelClass =
  "w-full text-[15px] font-medium leading-[1.2] min-[744px]:text-[16px]";

const helperClass =
  "mt-2 hidden text-[11px] leading-[1.25] text-[#1C100E]/70 min-[1900px]:block";

const getFileList = (files: FileList | null) => Array.from(files || []);

const eventCreateCopy = {
  ua: {
    errors: {
      imageLimit: "Можна додати не більше 6 зображень.",
      imageType: "Оберіть зображення у форматі JPEG, PNG або WEBP.",
      imageSize: "Кожне зображення має бути меншим за 5 MB.",
      categoryMissing: "Не вдалося визначити категорію події.",
      titleRequired: "Введіть заголовок події.",
      descriptionRequired: "Введіть основний текст події.",
      categoryInvalid:
        "Цю категорію ще не створено на сервері. Спочатку додайте категорію в адмінці або через кнопку «Додати категорію», а потім створіть подію.",
      authRequired: "Увійдіть у профіль спеціаліста, щоб створити подію.",
      permissionDenied:
        "Створювати події можуть тільки підтверджені спеціалісти або адміністратори.",
      descriptionLimit: "Опис події не може бути довшим за 300 символів.",
      server:
        "Сервер не зміг зберегти подію. Перевірте обовʼязкові поля та спробуйте ще раз.",
      network:
        "Немає звʼязку із сервером. Перевірте, чи запущено бекенд, і спробуйте ще раз.",
      generic: "Не вдалося зберегти подію. Спробуйте ще раз.",
    },
    denied:
      "Додавати події можуть тільки спеціалісти з профілем або адміністратори.",
    saving: "Зберігаємо...",
    save: "Зберегти подію",
    selectedImages: "Обрано зображень",
    backToCategory: "Повернутися до категорії",
  },
  en: {
    errors: {
      imageLimit: "You can add up to 6 images.",
      imageType: "Choose images in JPEG, PNG, or WEBP format.",
      imageSize: "Each image must be smaller than 5 MB.",
      categoryMissing: "Could not determine the event category.",
      titleRequired: "Enter the event title.",
      descriptionRequired: "Enter the event description.",
      categoryInvalid:
        "This category has not been created on the server yet. Add the category in admin or through Add category first, then create the event.",
      authRequired: "Sign in as a specialist to create an event.",
      permissionDenied:
        "Only verified specialists or administrators can create events.",
      descriptionLimit: "The event description cannot be longer than 300 characters.",
      server:
        "The server could not save the event. Check the required fields and try again.",
      network:
        "Cannot reach the server. Check that the backend is running and try again.",
      generic: "Could not save the event. Try again.",
    },
    denied: "Only specialists with a profile or administrators can add events.",
    saving: "Saving...",
    save: "Save event",
    selectedImages: "Selected images",
    backToCategory: "Back to category",
  },
} as const;

type EventCreateCopy = (typeof eventCreateCopy)[keyof typeof eventCreateCopy];

const getLocalizedCreateError = (error: unknown, copy: EventCreateCopy) => {
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

  if (
    message.includes("invalid pk") ||
    message.includes("object does not exist") ||
    (message.includes("category") && message.includes("does not exist"))
  ) {
    return copy.errors.categoryInvalid;
  }

  if (message.includes("300") || message.includes("description")) {
    return copy.errors.descriptionLimit;
  }

  if (message.includes("6") && message.includes("image")) {
    return copy.errors.imageLimit;
  }

  if (
    message.includes("jpeg") ||
    message.includes("png") ||
    message.includes("webp") ||
    message.includes("image type")
  ) {
    return copy.errors.imageType;
  }

  if (message.includes("5 mb") || message.includes("smaller than 5")) {
    return copy.errors.imageSize;
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return copy.errors.network;
  }

  if (message.includes("failed to create") || message.includes("failed to save")) {
    return copy.errors.server;
  }

  return copy.errors.generic;
};

export function EventCreatePage() {
  const { categorySlug = "" } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
  const copy = eventCreateCopy[lang];
  const canCreateEvents = useCanCreateEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [canRegister, setCanRegister] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getEventCategories().then((items) => {
      if (isMounted) setCategories(items);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const category = useMemo(
    () => categories.find((item) => item.slug === categorySlug),
    [categories, categorySlug],
  );

  const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = getFileList(event.target.files);
    setError("");

    if (!selectedFiles.length) {
      setImages([]);
      return;
    }

    if (selectedFiles.length > MAX_EVENT_IMAGES) {
      setError(copy.errors.imageLimit);
      event.target.value = "";
      return;
    }

    const unsupportedFile = selectedFiles.find(
      (file) => !ALLOWED_IMAGE_TYPES.has(file.type),
    );
    if (unsupportedFile) {
      setError(copy.errors.imageType);
      event.target.value = "";
      return;
    }

    const largeFile = selectedFiles.find((file) => file.size > MAX_IMAGE_SIZE);
    if (largeFile) {
      setError(copy.errors.imageSize);
      event.target.value = "";
      return;
    }

    setImages(selectedFiles);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value.slice(0, MAX_DESCRIPTION_LENGTH));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!category) {
      setError(copy.errors.categoryMissing);
      return;
    }

    if (!title.trim()) {
      setError(copy.errors.titleRequired);
      return;
    }

    if (!description.trim()) {
      setError(copy.errors.descriptionRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      await createEvent({
        title,
        description,
        category: category.id,
        images,
      });

      setIsSuccessDialogOpen(true);
    } catch (err) {
      setError(getLocalizedCreateError(err, copy));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateEvents) {
    return (
      <section className="-mt-14 flex min-h-[50vh] items-center justify-center bg-secondary px-5 py-12 font-montserrat text-[#1C100E] sm:-mt-20 min-[1023px]:px-16 min-[1420px]:mt-0!">
        <p className="max-w-[520px] text-center text-[16px] leading-[1.4]">
          {copy.denied}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="-mt-14 min-h-[420px] bg-secondary px-5 pb-8 pt-5 font-montserrat text-[#1C100E] sm:-mt-20 min-[390px]:px-7 min-[744px]:min-h-[714px] min-[744px]:px-10 min-[744px]:pb-12 min-[744px]:pt-6 min-[1023px]:min-h-[780px] min-[1023px]:px-16 min-[1023px]:pt-[34px] min-[1420px]:mt-0! min-[1420px]:min-h-[815px] min-[1420px]:px-20 min-[1420px]:pt-[145px] min-[1900px]:min-h-[930px] min-[1900px]:pt-[168px]">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-[340px] flex-col items-center min-[744px]:max-w-[641px] min-[1023px]:max-w-[884px] min-[1420px]:max-w-[800px] min-[1900px]:max-w-[1140px]"
        >
          <h1 className="text-center text-[20px] font-medium leading-[1.25] min-[744px]:text-[28px] min-[1420px]:text-[32px]">
            Створити подію
          </h1>

          <div className="mt-7 flex w-full flex-col gap-4 min-[744px]:mt-11 min-[744px]:gap-6 min-[1023px]:mt-9 min-[1420px]:mt-12">
            <label className={labelClass}>
              Заголовок
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Введіть заголовок події"
                className={`${inputClass} mt-2`}
                maxLength={120}
              />
            </label>

            <label className={labelClass}>
              Основний текст
              <input
                type="text"
                value={description}
                onChange={(event) => handleDescriptionChange(event.target.value)}
                placeholder="Введіть основний текст події"
                className={`${inputClass} mt-2`}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              <span className={helperClass}>*Обмеження у 300 символів</span>
            </label>

            <div className="grid w-full grid-cols-2 gap-4 min-[744px]:grid-cols-[1fr_1fr_1.2fr] min-[744px]:gap-8 min-[1023px]:grid-cols-[1fr_1fr_2.3fr] min-[1900px]:gap-10">
              <label className={labelClass}>
                Дата
                <input
                  type="text"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  placeholder="Дата"
                  className={`${inputClass} mt-2`}
                />
              </label>

              <label className={labelClass}>
                Час
                <input
                  type="text"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  placeholder="Час"
                  className={`${inputClass} mt-2`}
                />
              </label>

              <label className={`${labelClass} col-span-2 min-[744px]:col-span-1`}>
                Місце
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Місце події"
                  className={`${inputClass} mt-2`}
                />
              </label>
            </div>

            <label className="flex w-full items-center gap-3 text-[12px] font-normal leading-[1.2] text-[#1C100E]/75 min-[744px]:text-[14px]">
              <input
                type="checkbox"
                checked={canRegister}
                onChange={(event) => setCanRegister(event.target.checked)}
                className="size-4 shrink-0 appearance-none border border-[#1C100E] bg-transparent checked:bg-[#1C100E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
              />
              Можливість записатися на подію
            </label>

            <div className="w-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[30px] bg-[#1C100E] px-6 text-[13px] font-medium text-[#F0E8F0] transition hover:bg-[#1C100E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:w-[310px] min-[1023px]:w-[436px] min-[1420px]:w-[390px] min-[1900px]:h-12 min-[1900px]:w-[550px]"
              >
                <ImageIcon className="size-4" aria-hidden="true" />
                Додати зображення
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleImagesChange}
              />

              <p className={helperClass}>*Обмеження до 6 зображень</p>
              {images.length > 0 && (
                <p className="mt-2 text-[11px] leading-[1.25] text-[#1C100E]/70 min-[744px]:text-[12px]">
                  {copy.selectedImages}: {images.length}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 w-full rounded-[18px] border border-[#83105F]/30 bg-[#83105F]/8 px-4 py-3 text-center text-[12px] leading-[1.35] text-[#83105F] min-[744px]:text-[14px]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 flex h-10 w-full items-center justify-center rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] text-center text-[13px] font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] disabled:opacity-70 min-[744px]:mt-10 min-[744px]:max-w-[310px] min-[1023px]:max-w-[436px] min-[1420px]:max-w-[390px] min-[1900px]:h-12 min-[1900px]:max-w-[550px]"
          >
            {isSubmitting ? copy.saving : copy.save}
          </button>

          {!category && (
            <Link
              to={`/events/${categorySlug}`}
              className="mt-5 text-center text-[12px] text-[#83105F] underline-offset-4 hover:underline"
            >
              {copy.backToCategory}
            </Link>
          )}
        </form>
      </section>

      <EventCreateSuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
      />
    </>
  );
}
