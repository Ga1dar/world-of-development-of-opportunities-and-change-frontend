import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createEventCategory } from "../../api/events";
import { useCanCreateEvents } from "../../hooks/useCanCreateEvents";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function EventCategoryCreatePage() {
  const navigate = useNavigate();
  const canCreateEvents = useCanCreateEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError("");

    if (!file) {
      setImage(null);
      setPreviewUrl("");
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Оберіть зображення у форматі JPEG, PNG або WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Обложка категорії має бути меншою за 5 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Введіть назву категорії.");
      return;
    }

    if (!image) {
      setError("Завантажте обложку категорії.");
      return;
    }

    setIsSubmitting(true);

    try {
      const category = await createEventCategory({
        name: name.trim(),
        image,
      });

      navigate(`/events/${category.slug}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося додати категорію. Спробуйте ще раз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateEvents) {
    return (
      <section className="-mt-14 flex min-h-[50vh] items-center justify-center bg-secondary px-5 py-12 font-montserrat text-[#1C100E] sm:-mt-20 min-[1420px]:mt-0!">
        <p className="max-w-[520px] text-center text-[16px] leading-[1.4]">
          Створювати категорії подій можуть тільки спеціалісти з профілем або
          адміністратори.
        </p>
      </section>
    );
  }

  return (
    <section className="-mt-14 bg-secondary px-5 pb-12 pt-5 font-montserrat text-[#1C100E] sm:-mt-20 min-[390px]:px-7 min-[744px]:px-10 min-[744px]:pb-14 min-[744px]:pt-8 min-[1023px]:px-12 min-[1023px]:pt-10 min-[1420px]:mt-0! min-[1420px]:px-20 min-[1420px]:pt-16 min-[1900px]:pt-20">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-[340px] flex-col items-center min-[744px]:max-w-[641px] min-[1023px]:max-w-[848px] min-[1420px]:max-w-[800px] min-[1900px]:max-w-[1140px]"
      >
        <h1 className="text-center text-[18px] font-medium leading-[1.25] min-[744px]:text-[24px] min-[1420px]:text-[32px]">
          Створити категорію подій
        </h1>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 flex h-10 items-center justify-center gap-2 rounded-[30px] bg-[#1C100E] px-6 text-[12px] font-medium text-[#F0E8F0] transition hover:bg-[#1C100E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:mt-7 min-[744px]:h-11 min-[744px]:px-8"
        >
          <Upload className="size-4" aria-hidden="true" />
          Завантажте обложенку категорії
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleImageChange}
        />

        <div className="mt-6 flex aspect-[1.85] w-full items-center justify-center overflow-hidden rounded-[20px] bg-[#F3F2F3] min-[744px]:mt-8 min-[1420px]:rounded-[24px]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Обложка категорії"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="size-12 text-[#1C100E] min-[744px]:size-16" />
          )}
        </div>

        <label className="mt-6 w-full text-[13px] font-medium min-[744px]:mt-8 min-[1420px]:text-[16px]">
          Назва категорії
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Введіть назву категорії"
            className="mt-2 h-10 w-full rounded-[30px] border border-[#402940] bg-transparent px-4 text-[12px] font-normal text-[#1C100E] outline-none placeholder:text-[#1C100E]/55 focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:h-11 min-[1420px]:text-[14px]"
            maxLength={120}
          />
        </label>

        {error && (
          <p className="mt-4 w-full text-center text-[12px] text-[#83105F] min-[744px]:text-[14px]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 flex h-10 w-full max-w-[340px] items-center justify-center rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] text-center text-[13px] font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] disabled:opacity-70 min-[744px]:ml-auto min-[744px]:mt-7 min-[744px]:max-w-[380px] min-[1420px]:max-w-[390px]"
        >
          {isSubmitting ? "Додаємо..." : "Додати категорію"}
        </button>
      </form>
    </section>
  );
}
