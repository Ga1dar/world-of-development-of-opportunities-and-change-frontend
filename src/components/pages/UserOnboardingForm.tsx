import { Camera, ChevronDown } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createUserOnboardingProfile,
  type CabinetProfile,
} from "../../api/userCabinet";
import { getFriendlyProfileError } from "../../utils/friendlyErrors";
import { PhoneCountryField } from "./PhoneCountryField";

type UserOnboardingFormProps = {
  profile: CabinetProfile;
  onComplete: () => void;
  onClose: () => void;
};

type SelectOption = {
  value: string;
  label: string;
};

const copy = {
  ua: {
    photo: "Додати фото (не обов’язково)",
    displayName: "Ім’я Прізвище",
    firstName: "Ім’я*",
    firstNamePlaceholder: "Ім’я..",
    lastName: "Прізвище*",
    lastNamePlaceholder: "Прізвище..",
    phone: "Телефон*",
    phonePlaceholder: "Телефон",
    birthDate: "Дата народження*",
    gender: "Ваш гендер*",
    genderPlaceholder: "Виберіть варіант...",
    city: "Місто*",
    cityPlaceholder: "Київ",
    education: "Освіта*",
    educationPlaceholder: "Виберіть варіант...",
    educationOther: "Вкажіть освіту*",
    educationOtherPlaceholder: "Ваша освіта",
    educationOtherError: "Вкажіть вашу освіту.",
    hasChildren: "Виховую дітей*",
    hasChildrenPlaceholder: "Так/Ні",
    about: "Про себе",
    aboutPlaceholder: "Коротка інформація про себе",
    optional: "Не обов’язково*",
    consent: "Я надаю згоду на обробку персональних даних",
    consentError: "Підтвердіть згоду на обробку персональних даних.",
    save: "Зберегти",
    saving: "Зберігаємо...",
    cancel: "Скасувати",
    saveError: "Не вдалося створити профіль. Перевірте заповнені поля.",
    close: "Закрити",
  },
  en: {
    photo: "Add a photo (optional)",
    displayName: "First Last",
    firstName: "First name*",
    firstNamePlaceholder: "First name..",
    lastName: "Last name*",
    lastNamePlaceholder: "Last name..",
    phone: "Phone*",
    phonePlaceholder: "Phone",
    birthDate: "Birth date*",
    gender: "Your gender*",
    genderPlaceholder: "Choose an option...",
    city: "City*",
    cityPlaceholder: "Kyiv",
    education: "Education*",
    educationPlaceholder: "Choose an option...",
    educationOther: "Specify education*",
    educationOtherPlaceholder: "Your education",
    educationOtherError: "Specify your education.",
    hasChildren: "Raising children*",
    hasChildrenPlaceholder: "Yes/No",
    about: "About",
    aboutPlaceholder: "Short information about yourself",
    optional: "Optional*",
    consent: "I consent to personal data processing",
    consentError: "Please consent to personal data processing.",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    saveError: "Could not create the profile. Check the completed fields.",
    close: "Close",
  },
} as const;

const genderOptions = {
  ua: [
    { value: "male", label: "Чоловік" },
    { value: "female", label: "Жінка" },
    { value: "other", label: "Інший" },
    { value: "prefer_not_to_say", label: "Не хочу говорити" },
  ],
  en: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ],
} satisfies Record<"ua" | "en", SelectOption[]>;

const educationOptions = {
  ua: [
    { value: "teacher", label: "Педагог/Педагогиня" },
    { value: "psychologist", label: "Психолог/Психологиня" },
    { value: "trauma_pedagogy", label: "Травмопедагог/Травмопедагогиня" },
    { value: "other", label: "Інша освіта (вказати)" },
  ],
  en: [
    { value: "teacher", label: "Teacher" },
    { value: "psychologist", label: "Psychologist" },
    { value: "trauma_pedagogy", label: "Trauma pedagogue" },
    { value: "other", label: "Other education" },
  ],
} satisfies Record<"ua" | "en", SelectOption[]>;

const childrenOptions = {
  ua: [
    { value: "yes", label: "Так" },
    { value: "no", label: "Ні" },
  ],
  en: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ],
} satisfies Record<"ua" | "en", SelectOption[]>;

const inputClass =
  "h-[34px] w-full rounded-[18px] border border-[#40213F] bg-[#F3F2F3] px-3 font-montserrat text-[12px] text-[#1C100E] outline-none transition placeholder:text-[#1C100E]/45 focus:ring-2 focus:ring-[#B34D8D]/30 min-[744px]:h-[37px]";

const normalizeEducationValue = (value?: string) => {
  const cleanValue = (value || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!cleanValue) return "";
  if (["teacher", "pedagogue", "педагог", "педагог/педагогиня"].includes(cleanValue)) {
    return "teacher";
  }
  if (["psychologist", "psychology", "психолог", "психолог/психологиня"].includes(cleanValue)) {
    return "psychologist";
  }
  if (
    [
      "trauma_pedagogy",
      "trauma pedagogy",
      "trauma pedagogue",
      "травмопедагог",
      "травмопедагог/травмопедагогиня",
    ].includes(cleanValue)
  ) {
    return "trauma_pedagogy";
  }
  if (["other", "other education", "інша освіта", "інша освіта (вказати)"].includes(cleanValue)) {
    return "other";
  }
  return "other";
};

function TextField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block font-montserrat text-[#1C100E]">
      <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">
        {label}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block font-montserrat text-[#1C100E]">
      <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">
        {label}
      </span>
      <span className="relative block">
        <select
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} appearance-none pr-9 ${value ? "" : "text-[#1C100E]/50"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1C100E]" />
      </span>
    </label>
  );
}

export function UserOnboardingForm({
  profile,
  onComplete,
  onClose,
}: UserOnboardingFormProps) {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language.toLowerCase().startsWith("en");
  const localeKey = isEnglish ? "en" : "ua";
  const labels = isEnglish ? copy.en : copy.ua;
  const initialEducation = normalizeEducationValue(profile.education);
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [city, setCity] = useState(profile.city || "");
  const [birthDate, setBirthDate] = useState(profile.birthDate || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [education, setEducation] = useState(initialEducation);
  const [educationOther, setEducationOther] = useState(
    initialEducation === "other" && profile.education ? profile.education : "",
  );
  const [hasChildren, setHasChildren] = useState(profile.hasChildren || "");
  const [about, setAbout] = useState(profile.about || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const displayName = useMemo(
    () => [firstName, lastName].map((item) => item.trim()).filter(Boolean).join(" "),
    [firstName, lastName],
  );

  useEffect(() => {
    if (!avatar) return undefined;

    const objectUrl = URL.createObjectURL(avatar);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  const clearError = () => setError("");

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatar(event.currentTarget.files?.[0] || null);
    event.currentTarget.value = "";
    clearError();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasConsent) {
      setError(labels.consentError);
      return;
    }

    if (education === "other" && !educationOther.trim()) {
      setError(labels.educationOtherError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await createUserOnboardingProfile({
        firstName,
        lastName,
        phone,
        city,
        birthDate,
        gender,
        education,
        educationOther: educationOther.trim(),
        hasChildren,
        about,
        acceptDataProcessingConsent: hasConsent,
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
      className="user-onboarding-form relative mx-auto w-full max-w-[358px] rounded-[18px] bg-[#F3F2F3] px-4 pb-7 pt-5 font-montserrat text-[#1C100E]
      min-[744px]:max-h-[calc(100vh-48px)] min-[744px]:max-w-none min-[744px]:overflow-y-auto min-[744px]:rounded-[22px] min-[744px]:pb-12 min-[744px]:pt-8
      min-[1420px]:rounded-[30px] min-[1420px]:pb-14 min-[1420px]:pt-9"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="absolute right-4 top-3 hidden h-7 w-7 cursor-pointer items-center justify-center font-montserrat text-[18px] text-[#1C100E]/35 min-[744px]:flex"
      >
        ×
      </button>

      <div className="mx-auto w-full max-w-[371px]">
        <label className="mx-auto flex cursor-pointer flex-col items-center">
          <span className="relative flex h-[96px] w-[96px] items-center justify-center rounded-full bg-[#C8C3C8]">
            {avatarPreview ? (
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              </span>
            ) : null}
            <span className="absolute bottom-2 right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#F3F2F3] bg-[#E8DCE8] shadow-[0_2px_6px_rgba(64,41,64,0.18)]">
              <Camera className="h-4 w-4" />
            </span>
          </span>
          <h1 className="mt-4 text-center text-[14px] font-medium leading-[1.2] min-[744px]:text-[15px]">
            {displayName || labels.displayName}
          </h1>
          <span className="mt-3 text-center text-[10px] text-[#1C100E]/70 min-[744px]:text-[11px]">
            {labels.photo}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="sr-only"
          />
        </label>

        <div className="mt-5 grid gap-3.5 min-[744px]:mt-6 min-[744px]:gap-4">
          <TextField
            label={labels.firstName}
            placeholder={labels.firstNamePlaceholder}
            value={firstName}
            onChange={(value) => {
              setFirstName(value);
              clearError();
            }}
          />
          <TextField
            label={labels.lastName}
            placeholder={labels.lastNamePlaceholder}
            value={lastName}
            onChange={(value) => {
              setLastName(value);
              clearError();
            }}
          />
          <PhoneCountryField
            label={labels.phone}
            placeholder={labels.phonePlaceholder}
            value={phone}
            onChange={(value) => {
              setPhone(value);
              clearError();
            }}
            language={i18n.language}
            required
          />
          <TextField
            label={labels.birthDate}
            placeholder={labels.birthDate}
            value={birthDate}
            onChange={(value) => {
              setBirthDate(value);
              clearError();
            }}
            type="date"
          />
          <SelectField
            label={labels.gender}
            placeholder={labels.genderPlaceholder}
            value={gender}
            options={genderOptions[localeKey]}
            onChange={(value) => {
              setGender(value);
              clearError();
            }}
          />
          <TextField
            label={labels.city}
            placeholder={labels.cityPlaceholder}
            value={city}
            onChange={(value) => {
              setCity(value);
              clearError();
            }}
          />
          <SelectField
            label={labels.education}
            placeholder={labels.educationPlaceholder}
            value={education}
            options={educationOptions[localeKey]}
            onChange={(value) => {
              setEducation(value);
              if (value !== "other") {
                setEducationOther("");
              }
              clearError();
            }}
          />
          {education === "other" ? (
            <TextField
              label={labels.educationOther}
              placeholder={labels.educationOtherPlaceholder}
              value={educationOther}
              onChange={(value) => {
                setEducationOther(value);
                clearError();
              }}
            />
          ) : null}
          <SelectField
            label={labels.hasChildren}
            placeholder={labels.hasChildrenPlaceholder}
            value={hasChildren}
            options={childrenOptions[localeKey]}
            onChange={(value) => {
              setHasChildren(value);
              clearError();
            }}
          />

          <label className="block font-montserrat text-[#1C100E]">
            <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">
              {labels.about}
            </span>
            <input
              value={about}
              onChange={(event) => {
                setAbout(event.target.value);
                clearError();
              }}
              placeholder={labels.aboutPlaceholder}
              className={inputClass}
            />
            <span className="mt-1 block text-[10px] leading-[1.2] text-[#1C100E]/55">
              {labels.optional}
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-[1.3] text-[#1C100E]/75 min-[744px]:text-[11px]">
            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(event) => {
                setHasConsent(event.target.checked);
                clearError();
              }}
              className="mt-0.5 h-3.5 w-3.5 accent-[#83105F]"
            />
            <span>{labels.consent}</span>
          </label>

          {error ? (
            <p className="text-center text-[11px] leading-[1.3] text-[#83105F]">
              {error}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-4 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 cursor-pointer rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] text-[12px] font-medium shadow-btn disabled:cursor-wait disabled:opacity-70 min-[744px]:h-11"
            >
              {isSaving ? labels.saving : labels.save}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 cursor-pointer rounded-[30px] bg-white text-[12px] font-medium text-[#1C100E] min-[744px]:h-11"
            >
              {labels.cancel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
