import { Camera } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createUserOnboardingProfile,
  type CabinetProfile,
} from "../../api/userCabinet";
import { getFriendlyProfileError } from "../../utils/friendlyErrors";

type UserOnboardingFormProps = {
  profile: CabinetProfile;
  onComplete: () => void;
  onClose: () => void;
};

const copy = {
  ua: {
    title: "Заповніть профіль",
    photo: "Додати фото (не обов’язково)",
    firstName: "Ім’я*",
    firstNamePlaceholder: "Ім’я",
    lastName: "Прізвище*",
    lastNamePlaceholder: "Прізвище",
    save: "Зберегти дані",
    saving: "Зберігаємо...",
    saveError: "Не вдалося створити профіль. Перевірте заповнені поля.",
    close: "Закрити",
  },
  en: {
    title: "Complete your profile",
    photo: "Add a photo (optional)",
    firstName: "First name*",
    firstNamePlaceholder: "First name",
    lastName: "Last name*",
    lastNamePlaceholder: "Last name",
    save: "Save details",
    saving: "Saving...",
    saveError: "Could not create the profile. Check the completed fields.",
    close: "Close",
  },
} as const;

const inputClass =
  "h-10 w-full rounded-[22px] border border-[#40213F] bg-[#F0E8F0] px-3 font-montserrat text-[12px] text-[#1C100E] outline-none placeholder:text-[#1C100E]/45 focus:ring-2 focus:ring-[#B34D8D]/30 min-[744px]:h-9 min-[1023px]:h-10 min-[1420px]:h-11 min-[1900px]:h-12 min-[1900px]:text-[15px]";

function TextField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block font-montserrat text-[#1C100E]">
      <span className="mb-2 block text-[11px] leading-none min-[1023px]:text-[12px] min-[1420px]:text-[13px] min-[1900px]:text-[15px]">
        {label}
      </span>
      <input
        required
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function UserOnboardingForm({
  profile,
  onComplete,
  onClose,
}: UserOnboardingFormProps) {
  const { i18n } = useTranslation();
  const labels = i18n.language.toLowerCase().startsWith("en") ? copy.en : copy.ua;
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!avatar) return undefined;

    const objectUrl = URL.createObjectURL(avatar);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatar(event.currentTarget.files?.[0] || null);
    event.currentTarget.value = "";
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createUserOnboardingProfile({
        firstName,
        lastName,
        avatar,
      });
      onComplete();
    } catch (requestError) {
      setError(
        getFriendlyProfileError(requestError, i18n.language, labels.saveError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="user-onboarding-form relative mx-auto w-full max-w-[358px] bg-[#F0E8F0] px-3 pb-7 pt-1 font-montserrat text-[#1C100E]
      min-[744px]:max-w-none min-[744px]:rounded-[22px] min-[744px]:pb-14 min-[744px]:pt-12
      min-[1023px]:pb-14 min-[1023px]:pt-12
      min-[1420px]:pb-16 min-[1420px]:pt-14
      min-[1900px]:pb-20 min-[1900px]:pt-16"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="absolute right-4 top-3 hidden h-7 w-7 cursor-pointer items-center justify-center font-montserrat text-[18px] text-[#1C100E]/30 min-[744px]:flex min-[1420px]:right-6 min-[1420px]:top-5 min-[1900px]:text-[24px]"
      >
        ×
      </button>

      <h1 className="text-center text-[18px] font-medium leading-[1.2] min-[744px]:text-[20px] min-[1023px]:text-[22px] min-[1420px]:text-[24px] min-[1900px]:text-[30px]">
        {labels.title}
      </h1>

      <label className="mx-auto mt-5 flex cursor-pointer flex-col items-center min-[744px]:mt-6 min-[1023px]:mt-7 min-[1420px]:mt-8 min-[1900px]:mt-10">
        <span className="relative flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[#C8C3C8] min-[744px]:h-24 min-[744px]:w-24 min-[1023px]:h-26 min-[1023px]:w-26 min-[1420px]:h-28 min-[1420px]:w-28 min-[1900px]:h-36 min-[1900px]:w-36">
          {avatarPreview ? (
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            </span>
          ) : null}
          <span className="absolute bottom-0 right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#F0E8F0] bg-[#E8DCE8] shadow-[0_2px_6px_rgba(64,41,64,0.18)] min-[1420px]:h-7 min-[1420px]:w-7 min-[1900px]:h-9 min-[1900px]:w-9">
            <Camera className="h-3.5 w-3.5 min-[1420px]:h-4 min-[1420px]:w-4 min-[1900px]:h-5 min-[1900px]:w-5" />
          </span>
        </span>
        <span className="mt-3 text-[10px] text-[#1C100E]/70 min-[1023px]:text-[11px] min-[1420px]:text-[12px] min-[1900px]:mt-5 min-[1900px]:text-[15px]">
          {labels.photo}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="sr-only"
        />
      </label>

      <div className="mt-5 grid gap-4 min-[744px]:mt-7 min-[744px]:gap-6 min-[1023px]:mt-7 min-[1023px]:gap-6 min-[1420px]:mt-8 min-[1420px]:gap-7 min-[1900px]:mt-10 min-[1900px]:gap-8">
        <TextField
          label={labels.firstName}
          placeholder={labels.firstNamePlaceholder}
          value={firstName}
          onChange={(value) => {
            setFirstName(value);
            setError("");
          }}
        />
        <TextField
          label={labels.lastName}
          placeholder={labels.lastNamePlaceholder}
          value={lastName}
          onChange={(value) => {
            setLastName(value);
            setError("");
          }}
        />

        {error ? (
          <p className="text-center text-[11px] leading-[1.3] text-[#83105F] min-[1420px]:text-[13px]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-1 h-12 w-full cursor-pointer rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] text-[12px] font-medium shadow-btn disabled:cursor-wait disabled:opacity-70 min-[1023px]:h-13 min-[1023px]:text-[13px] min-[1420px]:h-14 min-[1420px]:text-[14px] min-[1900px]:h-16 min-[1900px]:text-[17px]"
        >
          {isSaving ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
