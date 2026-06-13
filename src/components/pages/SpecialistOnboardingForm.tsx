import { Camera } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createSpecialistProfile,
  type CabinetProfile,
} from "../../api/userCabinet";
import { getFriendlyProfileError } from "../../utils/friendlyErrors";
import { PhoneCountryField } from "./PhoneCountryField";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  specialization: string;
  education: string;
  experience: string;
  about: string;
};

type SpecialistOnboardingFormProps = {
  profile: CabinetProfile;
  onComplete: () => void;
  onClose: () => void;
};

const copy = {
  ua: {
    title: "Заповніть профіль",
    photo: "Додати фото (не обов'язково)",
    firstName: "Ім'я*",
    lastName: "Прізвище*",
    phone: "Телефон*",
    city: "Місто*",
    specialization: "Спеціальність*",
    education: "Освіта*",
    experience: "Стаж роботи*",
    about: "Про себе",
    aboutPlaceholder: "Коротка інформація про себе",
    optional: "Не обов'язково*",
    consent: "Я надаю згоду на обробку персональних даних",
    review: "Після розгляду адміністратором, вам буде надано доступ до особистого кабінету",
    save: "Зберегти дані",
    saving: "Зберігаємо...",
    consentError: "Підтвердіть згоду на обробку персональних даних.",
    saveError: "Не вдалося створити профіль. Перевірте заповнені поля.",
    close: "Закрити",
  },
  en: {
    title: "Complete your profile",
    photo: "Add a photo (optional)",
    firstName: "First name*",
    lastName: "Last name*",
    phone: "Phone*",
    city: "City*",
    specialization: "Specialization*",
    education: "Education*",
    experience: "Work experience*",
    about: "About",
    aboutPlaceholder: "Short information about yourself",
    optional: "Optional*",
    consent: "I consent to personal data processing",
    review: "After administrator review, access to your personal account will be granted",
    save: "Save details",
    saving: "Saving...",
    consentError: "Please consent to personal data processing.",
    saveError: "Could not create the profile. Check the completed fields.",
    close: "Close",
  },
};

const inputClass =
  "h-9 w-full rounded-[18px] border border-[#40213F] bg-[#F0E8F0] px-3 font-montserrat text-[12px] text-[#1C100E] outline-none placeholder:text-[#1C100E]/45 focus:ring-2 focus:ring-[#B34D8D]/30 min-[744px]:h-8 min-[1900px]:h-9";

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block font-montserrat text-[#1C100E]">
      <span className="mb-1 block text-[11px] leading-none">{label}</span>
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

export function SpecialistOnboardingForm({
  profile,
  onComplete,
  onClose,
}: SpecialistOnboardingFormProps) {
  const { i18n } = useTranslation();
  const labels = i18n.language.toLowerCase().startsWith("en") ? copy.en : copy.ua;
  const [form, setForm] = useState<FormState>({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    phone: profile.phone || "",
    city: profile.city || "",
    specialization: profile.profession || "",
    education: profile.education || "",
    experience: profile.experience || "",
    about: profile.about || "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!avatar) return undefined;

    const objectUrl = URL.createObjectURL(avatar);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  const updateField = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatar(event.target.files?.[0] || null);
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasConsent) {
      setError(labels.consentError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await createSpecialistProfile({
        ...form,
        avatar,
        acceptDataProcessingConsent: hasConsent,
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
      className="specialist-onboarding-form relative mx-auto w-full max-w-[358px] bg-[#F0E8F0] px-3 pt-5 pb-6 font-montserrat text-[#1C100E]
      min-[744px]:max-h-[calc(100vh-64px)] min-[744px]:overflow-y-auto min-[744px]:rounded-[22px] min-[744px]:pt-7
      min-[1420px]:pt-[30px] min-[1900px]:pt-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="absolute top-3 right-4 hidden h-6 w-6 cursor-pointer items-center justify-center text-[18px] text-[#1C100E]/35 min-[744px]:flex"
      >
        ×
      </button>

      <h1 className="text-center text-[18px] font-medium min-[1900px]:text-[20px]">
        {labels.title}
      </h1>

      <label className="mx-auto mt-4 flex cursor-pointer flex-col items-center">
        <span className="relative flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full bg-[#C8C3C8]">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : null}
          <span className="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#E8DCE8]">
            <Camera className="h-3.5 w-3.5" />
          </span>
        </span>
        <span className="mt-3 text-[10px] text-[#1C100E]/70">{labels.photo}</span>
        <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
      </label>

      <div className="mt-4 grid gap-3 min-[1900px]:gap-3.5">
        <TextField
          label={labels.firstName}
          placeholder={labels.firstName}
          value={form.firstName}
          onChange={updateField("firstName")}
        />
        <TextField
          label={labels.lastName}
          placeholder={labels.lastName}
          value={form.lastName}
          onChange={updateField("lastName")}
        />
        <PhoneCountryField
          label={labels.phone}
          placeholder={labels.phone}
          value={form.phone}
          onChange={updateField("phone")}
          language={i18n.language}
          required
        />
        <TextField
          label={labels.city}
          placeholder={labels.city}
          value={form.city}
          onChange={updateField("city")}
        />
        <TextField
          label={labels.specialization}
          placeholder={labels.specialization}
          value={form.specialization}
          onChange={updateField("specialization")}
        />
        <TextField
          label={labels.education}
          placeholder={labels.education}
          value={form.education}
          onChange={updateField("education")}
        />
        <TextField
          label={labels.experience}
          placeholder={labels.experience}
          value={form.experience}
          onChange={updateField("experience")}
        />

        <label className="block font-montserrat text-[#1C100E]">
          <span className="mb-1 block text-[11px] leading-none">{labels.about}</span>
          <textarea
            value={form.about}
            placeholder={labels.aboutPlaceholder}
            onChange={(event) => updateField("about")(event.target.value)}
            rows={2}
            className={`${inputClass} min-h-9 resize-none py-2`}
          />
          <span className="mt-1 block text-[9px] text-[#1C100E]/55">{labels.optional}</span>
        </label>

        <label className="flex cursor-pointer items-start gap-2 text-[9px] leading-[1.25] text-[#1C100E]/75">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(event) => setHasConsent(event.target.checked)}
            className="mt-px h-3.5 w-3.5 accent-[#83105F]"
          />
          <span>{labels.consent}</span>
        </label>

        <p className="px-2 text-center text-[9px] leading-[1.25] text-[#1C100E]/65">
          {labels.review}
        </p>

        {error ? (
          <p className="text-center text-[11px] leading-[1.3] text-[#83105F]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="h-11 w-full cursor-pointer rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] text-[12px] font-medium shadow-btn disabled:cursor-wait disabled:opacity-70"
        >
          {isSaving ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
