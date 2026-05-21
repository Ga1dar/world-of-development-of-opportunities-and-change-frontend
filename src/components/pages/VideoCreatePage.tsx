import {
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { createEducationVideo } from "../../api/educationMaterials";
import { useCanCreateEvents } from "../../hooks/useCanCreateEvents";
import { VideoCreateStatusDialog } from "./VideoCreateStatusDialog";

const inputClass =
  "h-8 w-full rounded-[30px] border border-[#402940] bg-transparent px-3 text-[12px] font-normal text-[#1C100E] outline-none placeholder:text-[#1C100E]/55 focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:h-9 min-[1023px]:h-10 min-[1420px]:text-[14px]";

const labelClass =
  "w-full text-[15px] font-medium leading-[1.2] min-[744px]:text-[16px] min-[1023px]:text-[18px] min-[1420px]:text-[16px]";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] disabled:opacity-70";

const videoCreateCopy = {
  ua: {
    title: "Створити відео",
    fields: {
      title: "Назва відео",
      titlePlaceholder: "Введіть назву відео",
      description: "Короткий опис",
      descriptionPlaceholder: "Введіть короткий опис відео (якщо потрібно)",
      date: "Дата",
      upload: "Завантажити відео",
    },
    errors: {
      titleRequired: "Введіть назву відео.",
      videoRequired: "Додайте відеофайл.",
      authRequired: "Увійдіть як спеціаліст, щоб створити відео.",
      permissionDenied:
        "Створювати відео можуть лише підтверджені спеціалісти або адміністратори.",
      videoType: "Оберіть відео у форматі MP4, MOV, AVI, MKV або WEBM.",
      server:
        "Сервер не зміг зберегти відео. Перевірте обов'язкові поля та спробуйте ще раз.",
      network:
        "Немає зв'язку із сервером. Перевірте, чи запущено бекенд, і спробуйте ще раз.",
      generic: "Не вдалося зберегти відео. Спробуйте ще раз.",
    },
    denied:
      "Додавати відео можуть лише спеціалісти з підтвердженим профілем або адміністратори.",
    selectedVideo: "Обране відео",
    saving: "Зберігаємо...",
    save: "Зберегти відео",
    back: "Повернутися до відео",
  },
  en: {
    title: "Create video",
    fields: {
      title: "Video title",
      titlePlaceholder: "Enter the video title",
      description: "Short description",
      descriptionPlaceholder: "Enter a short video description (optional)",
      date: "Date",
      upload: "Upload video",
    },
    errors: {
      titleRequired: "Enter the video title.",
      videoRequired: "Add a video file.",
      authRequired: "Sign in as a specialist to create a video.",
      permissionDenied:
        "Only verified specialists or administrators can create videos.",
      videoType: "Choose a video in MP4, MOV, AVI, MKV, or WEBM format.",
      server:
        "The server could not save the video. Check the required fields and try again.",
      network:
        "Cannot reach the server. Check that the backend is running and try again.",
      generic: "Could not save the video. Try again.",
    },
    denied:
      "Only specialists with a verified profile or administrators can add videos.",
    selectedVideo: "Selected video",
    saving: "Saving...",
    save: "Save video",
    back: "Back to videos",
  },
} as const;

type VideoCreateCopy = (typeof videoCreateCopy)[keyof typeof videoCreateCopy];

const allowedVideoExtensions = new Set(["mp4", "mov", "avi", "mkv", "webm"]);

const checkerboardStyle: CSSProperties = {
  backgroundColor: "#E8E8E8",
  backgroundImage:
    "linear-gradient(45deg, #F8F8F8 25%, transparent 25%), linear-gradient(-45deg, #F8F8F8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F8F8F8 75%), linear-gradient(-45deg, transparent 75%, #F8F8F8 75%)",
  backgroundPosition: "0 0, 0 24px, 24px -24px, -24px 0",
  backgroundSize: "48px 48px",
};

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const normalizePublishedAt = (date: string) => {
  const trimmedDate = date.trim();

  if (!trimmedDate) return "";

  const isoDateMatch = trimmedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const uaDateMatch = trimmedDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  const dateValue = isoDateMatch
    ? trimmedDate
    : uaDateMatch
      ? `${uaDateMatch[3]}-${uaDateMatch[2]}-${uaDateMatch[1]}`
      : "";

  return dateValue ? new Date(`${dateValue}T09:00:00`).toISOString() : "";
};

const getVideoExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

const getLocalizedCreateError = (error: unknown, copy: VideoCreateCopy) => {
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
    message.includes("mp4") ||
    message.includes("mov") ||
    message.includes("avi") ||
    message.includes("mkv") ||
    message.includes("webm")
  ) {
    return copy.errors.videoType;
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return copy.errors.network;
  }

  if (message.includes("request failed") || message.includes("required")) {
    return copy.errors.server;
  }

  return copy.errors.generic;
};

export function VideoCreatePage() {
  const { i18n } = useTranslation();
  const canCreateVideos = useCanCreateEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const language = useMemo<"ua" | "en">(
    () => (isEnglishLanguage(i18n.language) ? "en" : "ua"),
    [i18n.language],
  );
  const copy = videoCreateCopy[language];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusDialog, setStatusDialog] = useState<"success" | "error" | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedVideo = event.target.files?.[0] ?? null;
    setError("");

    if (!selectedVideo) {
      setVideo(null);
      setPreviewUrl("");
      return;
    }

    if (!allowedVideoExtensions.has(getVideoExtension(selectedVideo.name))) {
      setError(copy.errors.videoType);
      event.target.value = "";
      return;
    }

    setVideo(selectedVideo);
    setPreviewUrl((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return URL.createObjectURL(selectedVideo);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(copy.errors.titleRequired);
      return;
    }

    if (!video) {
      setError(copy.errors.videoRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      await createEducationVideo(
        {
          title,
          description,
          publishedAt: normalizePublishedAt(date),
          videoFile: video,
        },
        language,
      );

      setStatusDialog("success");
    } catch (err) {
      console.error(getLocalizedCreateError(err, copy));
      setStatusDialog("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateVideos) {
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
      <section className="-mt-14 min-h-[420px] bg-secondary px-4 pb-8 pt-5 font-montserrat text-[#1C100E] sm:-mt-20 min-[390px]:px-6 min-[744px]:min-h-[760px] min-[744px]:px-10 min-[744px]:pb-12 min-[744px]:pt-8 min-[1023px]:min-h-[780px] min-[1023px]:px-[74px] min-[1023px]:pt-[42px] min-[1420px]:mt-0! min-[1420px]:min-h-[760px] min-[1420px]:px-20 min-[1420px]:pt-[150px] min-[1900px]:min-h-[850px] min-[1900px]:pt-[178px]">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-[340px] flex-col items-center min-[744px]:max-w-[641px] min-[1023px]:max-w-[884px] min-[1420px]:max-w-[800px] min-[1900px]:max-w-[1140px]"
        >
        <h1 className="text-center text-[22px] font-medium leading-[1.25] min-[744px]:text-[32px] min-[1420px]:text-[34px]">
          {copy.title}
        </h1>

        <div className="mt-7 flex w-full flex-col gap-5 min-[744px]:mt-11 min-[744px]:gap-7 min-[1023px]:mt-10 min-[1420px]:mt-12">
          <label className={labelClass}>
            {copy.fields.title}
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={copy.fields.titlePlaceholder}
              className={`${inputClass} mt-2`}
            />
          </label>

          <label className={labelClass}>
            {copy.fields.description}
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={copy.fields.descriptionPlaceholder}
              rows={description ? 5 : 1}
              className={`${inputClass} mt-2 min-h-8 resize-y py-2 min-[744px]:min-h-9 min-[1023px]:min-h-10`}
            />
          </label>

          <div className="grid w-full grid-cols-[1fr_1.55fr] items-end gap-4 min-[744px]:grid-cols-[150px_1fr] min-[744px]:gap-6 min-[1023px]:grid-cols-[170px_1fr] min-[1420px]:grid-cols-[160px_1fr] min-[1900px]:grid-cols-[280px_1fr]">
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

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[30px] bg-[#1C100E] px-5 text-[13px] font-medium text-[#F0E8F0] transition hover:bg-[#1C100E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:h-11 min-[1023px]:text-[15px] min-[1900px]:h-12"
              >
                <Upload className="size-4" aria-hidden="true" />
                <span className="hidden min-[744px]:inline">{copy.fields.upload}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.avi,.mkv,.webm,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                className="sr-only"
                onChange={handleVideoChange}
              />
            </div>
          </div>
        </div>

        {video ? (
          <div className="mt-6 w-full overflow-hidden rounded-[20px] min-[744px]:mt-8 min-[1900px]:mt-10">
            <div
              className="mx-auto h-[236px] w-full overflow-hidden rounded-[20px] min-[744px]:h-[360px] min-[1023px]:h-[390px] min-[1420px]:h-[380px] min-[1900px]:h-[430px] min-[1900px]:max-w-[980px]"
              style={checkerboardStyle}
            >
              {previewUrl ? (
                <video
                  src={previewUrl}
                  className="h-full w-full object-contain"
                  controls
                  aria-label={video.name}
                />
              ) : null}
            </div>
            <p className="mt-2 text-[11px] leading-[1.25] text-[#1C100E]/70 min-[744px]:text-[12px]">
              {copy.selectedVideo}: {video.name}
            </p>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-5 w-full rounded-[18px] border border-[#83105F]/30 bg-[#83105F]/8 px-4 py-3 text-center text-[12px] leading-[1.35] text-[#83105F] min-[744px]:text-[14px]"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${yellowButton} mt-7 flex h-12 w-full items-center justify-center text-[15px] min-[744px]:mt-10 min-[744px]:max-w-[410px] min-[1023px]:max-w-[440px] min-[1420px]:max-w-[390px] min-[1900px]:h-14 min-[1900px]:max-w-[550px]`}
        >
          {isSubmitting ? copy.saving : copy.save}
        </button>

        <Link
          to="/materials/videos"
          className="mt-5 text-center text-[12px] text-[#83105F] underline-offset-4 hover:underline"
        >
          {copy.back}
        </Link>
        </form>
      </section>

      <VideoCreateStatusDialog
        isOpen={statusDialog !== null}
        status={statusDialog ?? "success"}
        onClose={() => setStatusDialog(null)}
      />
    </>
  );
}
