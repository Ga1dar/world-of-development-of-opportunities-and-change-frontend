import { Camera, Upload } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { notifyAuthChanged } from "../../api/auth";
import {
  getCurrentCabinetProfile,
  getUserCabinetData,
  updateProfileAvatar,
  updateSpecialistProfile,
  uploadSpecialistDocuments,
  type CabinetProfile,
} from "../../api/userCabinet";
import { getFriendlyProfileError } from "../../utils/friendlyErrors";
import { LogIn } from "./LogIn";
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

const copy = {
  ua: {
    loading: "Завантажуємо профіль...",
    authRequired: "Увійдіть як спеціаліст, щоб редагувати профіль.",
    specialistRequired: "Редагування доступне тільки спеціалісту.",
    firstName: "Ім'я*",
    firstNamePlaceholder: "Ім'я..",
    lastName: "Прізвище*",
    lastNamePlaceholder: "Прізвище..",
    phone: "Телефон*",
    phonePlaceholder: "Телефон",
    city: "Місто*",
    cityPlaceholder: "Місто",
    specialization: "Спеціальність*",
    specializationPlaceholder: "Психолог",
    education: "Освіта*",
    educationPlaceholder: "Вища",
    experience: "Стаж роботи*",
    experiencePlaceholder: "Стаж",
    about: "Про себе",
    aboutPlaceholder: "Коротка інформація про себе",
    optional: "Не обов'язково*",
    consent: "Я надаю згоду на обробку персональних даних",
    uploadDocs: "Завантажити документи",
    save: "Зберегти зміни",
    cancel: "Скасувати",
    chooseAvatar: "Змінити фото",
    saving: "Зберігаємо...",
    success: "Зміни збережено.",
    consentError: "Підтвердіть згоду на обробку персональних даних.",
    saveError: "Не вдалося зберегти зміни. Перевірте поля та спробуйте ще раз.",
    selectedDocs: "Обрано документів:",
  },
  en: {
    loading: "Loading profile...",
    authRequired: "Log in as a specialist to edit your profile.",
    specialistRequired: "Editing is available only for specialists.",
    firstName: "First name*",
    firstNamePlaceholder: "First name..",
    lastName: "Last name*",
    lastNamePlaceholder: "Last name..",
    phone: "Phone*",
    phonePlaceholder: "Phone",
    city: "City*",
    cityPlaceholder: "City",
    specialization: "Specialization*",
    specializationPlaceholder: "Psychologist",
    education: "Education*",
    educationPlaceholder: "Higher education",
    experience: "Work experience*",
    experiencePlaceholder: "Experience",
    about: "About",
    aboutPlaceholder: "Short information about yourself",
    optional: "Optional*",
    consent: "I consent to personal data processing",
    uploadDocs: "Upload documents",
    save: "Save changes",
    cancel: "Cancel",
    chooseAvatar: "Change photo",
    saving: "Saving...",
    success: "Changes saved.",
    consentError: "Confirm personal data processing consent.",
    saveError: "Could not save changes. Check the fields and try again.",
    selectedDocs: "Selected documents:",
  },
};

const pageMaxWidth =
  "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn";

const whiteButton = "rounded-[30px] bg-white font-montserrat font-medium text-[#1C100E]";
const darkButton = "rounded-[30px] bg-[#1C100E] font-montserrat font-medium text-white";

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const splitFullName = (profile: CabinetProfile | null) => {
  if (!profile) return { firstName: "", lastName: "" };

  const fullName = profile.fullName.trim();
  const canUseFullName = fullName && fullName !== profile.email && fullName !== "Profile";
  const firstName = profile.firstName || (canUseFullName ? fullName.split(" ")[0] : "");
  const lastName = profile.lastName || (canUseFullName ? fullName.split(" ").slice(1).join(" ") : "");

  return { firstName, lastName };
};

const toFormState = (profile: CabinetProfile | null): FormState => {
  const name = splitFullName(profile);

  return {
    firstName: name.firstName,
    lastName: name.lastName,
    phone: profile?.phone || "",
    city: profile?.city || "",
    specialization: profile?.profession || "",
    education: profile?.education || "",
    experience: profile?.experience || "",
    about: profile?.about || "",
  };
};

function Field({
  label,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block font-montserrat text-[#1C100E]">
      <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-[34px] w-full rounded-[18px] border border-[#40213F] bg-[#F0E8F0] px-3 font-montserrat text-[12px] text-[#1C100E] outline-none transition placeholder:text-[#1C100E]/45 focus:ring-2 focus:ring-[#B34D8D]/30 min-[744px]:h-[37px] min-[1420px]:h-[34px]"
      />
    </label>
  );
}

export function SpecialistProfileEditPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const labels = useMemo(
    () => (isEnglishLanguage(i18n.language) ? copy.en : copy.ua),
    [i18n.language],
  );

  const [profile, setProfile] = useState<CabinetProfile | null>(null);
  const [form, setForm] = useState<FormState>(() => toFormState(null));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const documentsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getUserCabinetData(controller.signal);
        const profile = data.profile;
        setProfile(profile);
        setForm(toFormState(profile));
        setAvatarPreview(profile?.avatar || "");
      } catch {
        setError(labels.saveError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();

    return () => controller.abort();
  }, [labels.saveError]);

  useEffect(() => {
    if (!avatarFile) return undefined;

    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const updateField = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleDocumentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDocuments(Array.from(event.target.files || []).slice(0, 3));
    event.target.value = "";
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile || profile.profileKind !== "specialist") return;

    if (!profile.specialistProfileId && !hasConsent) {
      setError(labels.consentError);
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const currentProfile = profile.specialistProfileId
        ? profile
        : await getCurrentCabinetProfile();
      const specialistProfileId =
        currentProfile?.specialistProfileId ||
        (currentProfile?.profileKind === "specialist" && currentProfile.id !== "me"
          ? currentProfile.id
          : "");

      if (!specialistProfileId) {
        throw new Error("Specialist profile id is missing");
      }

      await updateSpecialistProfile(specialistProfileId, {
        ...form,
      });
      if (avatarFile) {
        await updateProfileAvatar(currentProfile || profile, avatarFile);
      }
      await uploadSpecialistDocuments(documents);
      notifyAuthChanged();
      setNotice(labels.success);
      navigate("/profile");
    } catch (error) {
      console.error(error);
      setError(getFriendlyProfileError(error, i18n.language, labels.saveError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[744px]:pt-0 min-[1420px]:pt-20`}>
        <p className="text-center font-montserrat text-[16px] text-[#1C100E]">{labels.loading}</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[744px]:pt-0 min-[1420px]:pt-20`}>
        <div className="mx-auto max-w-[520px] rounded-[22px] bg-[#F8F8F8] px-6 py-10 text-center font-montserrat">
          <p className="text-[14px] text-[#1C100E]/70">{labels.authRequired}</p>
          <div className="mx-auto mt-6 max-w-[220px] [&_button]:w-full">
            <LogIn variant="menu" text="Вхід" />
          </div>
        </div>
      </section>
    );
  }

  if (profile.profileKind !== "specialist") {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[744px]:pt-0 min-[1420px]:pt-20`}>
        <div className="mx-auto max-w-[520px] rounded-[22px] bg-[#F8F8F8] px-6 py-10 text-center font-montserrat text-[14px] text-[#1C100E]/70">
          {labels.specialistRequired}
        </div>
      </section>
    );
  }

  return (
    <section className={`${pageMaxWidth} pt-4 pb-16 min-[744px]:pt-7 min-[1023px]:pt-8 min-[1420px]:pt-12 min-[1900px]:pt-18`}>
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto rounded-[22px] bg-[#F8F8F8] px-4 py-8 font-montserrat text-[#1C100E]
        min-[744px]:max-w-[684px] min-[744px]:px-[176px] min-[744px]:py-9
        min-[1023px]:max-w-[880px] min-[1023px]:px-[260px]
        min-[1420px]:max-w-[820px] min-[1420px]:px-[220px] min-[1420px]:py-10
        min-[1900px]:max-w-[816px] min-[1900px]:px-[160px]"
      >
        <div className="flex flex-col items-center text-center">
          <label className="group relative block h-[120px] w-[120px] cursor-pointer min-[744px]:h-[104px] min-[744px]:w-[104px] min-[1420px]:h-[116px] min-[1420px]:w-[116px]">
            <img
              src={avatarPreview || "/lashenko2.png"}
              alt={profile.fullName}
              className="h-full w-full rounded-full object-cover"
            />
            <span className="absolute right-1 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#E8DCE8]">
              <Camera className="h-4 w-4 text-[#1C100E]" />
            </span>
            <span className="sr-only">{labels.chooseAvatar}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
          </label>

          <h1 className="mt-5 text-[18px] font-medium leading-[1.2] min-[744px]:text-[20px]">
            {profile.fullName}
          </h1>
          <p className="mt-4 text-[13px] leading-[1.2] text-[#1C100E]/75">
            {form.specialization || labels.specializationPlaceholder}
          </p>
        </div>

        <div className="mt-7 grid gap-4 min-[744px]:mt-8 min-[1420px]:gap-5">
          <Field
            label={labels.firstName}
            placeholder={labels.firstNamePlaceholder}
            value={form.firstName}
            onChange={updateField("firstName")}
            required
          />
          <Field
            label={labels.lastName}
            placeholder={labels.lastNamePlaceholder}
            value={form.lastName}
            onChange={updateField("lastName")}
            required
          />
          <PhoneCountryField
            label={labels.phone}
            placeholder={labels.phonePlaceholder}
            value={form.phone}
            onChange={updateField("phone")}
            language={i18n.language}
            required
          />
          <Field
            label={labels.city}
            placeholder={labels.cityPlaceholder}
            value={form.city}
            onChange={updateField("city")}
            required
          />
          <Field
            label={labels.specialization}
            placeholder={labels.specializationPlaceholder}
            value={form.specialization}
            onChange={updateField("specialization")}
            required
          />
          <Field
            label={labels.education}
            placeholder={labels.educationPlaceholder}
            value={form.education}
            onChange={updateField("education")}
            required
          />
          <Field
            label={labels.experience}
            placeholder={labels.experiencePlaceholder}
            value={form.experience}
            onChange={updateField("experience")}
            required
          />

          <label className="block font-montserrat text-[#1C100E]">
            <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">{labels.about}</span>
            <textarea
              value={form.about}
              onChange={(event) => updateField("about")(event.target.value)}
              placeholder={labels.aboutPlaceholder}
              rows={2}
              className="min-h-[34px] w-full resize-y rounded-[18px] border border-[#40213F] bg-[#F0E8F0] px-3 py-2 font-montserrat text-[12px] text-[#1C100E] outline-none transition placeholder:text-[#1C100E]/45 focus:ring-2 focus:ring-[#B34D8D]/30"
            />
            <span className="mt-1 block text-[11px] leading-[1.2] text-[#1C100E]/55">{labels.optional}</span>
          </label>

          {!profile.specialistProfileId ? (
            <label className="flex cursor-pointer items-start gap-3 text-[11px] leading-[1.25] text-[#1C100E]/75 min-[744px]:text-[12px]">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(event) => setHasConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#83105F]"
              />
              <span>{labels.consent}</span>
            </label>
          ) : null}

          <button
            type="button"
            onClick={() => documentsInputRef.current?.click()}
            className={`${darkButton} flex h-12 cursor-pointer items-center justify-center gap-2 text-[13px] min-[744px]:h-11 min-[744px]:text-[14px]`}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {labels.uploadDocs}
          </button>
          <input
            ref={documentsInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={handleDocumentsChange}
          />

          {documents.length ? (
            <p className="text-center text-[11px] leading-[1.25] text-[#1C100E]/60">
              {labels.selectedDocs} {documents.length}
            </p>
          ) : null}

          {error ? (
            <p className="text-center text-[12px] leading-[1.3] text-[#83105F]">{error}</p>
          ) : null}
          {notice ? (
            <p className="text-center text-[12px] leading-[1.3] text-[#37A357]">{notice}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-4 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className={`${yellowButton} h-11 text-[13px] disabled:cursor-wait disabled:opacity-70 min-[744px]:text-[14px]`}
            >
              {isSaving ? labels.saving : labels.save}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className={`${whiteButton} h-11 text-[13px] min-[744px]:text-[14px]`}
            >
              {labels.cancel}
            </button>
          </div>
        </div>
      </form>

      <img
        src="/sunForPersonalOfice.png"
        alt=""
        aria-hidden="true"
        className="mx-auto mt-6 w-[126px] opacity-75 min-[744px]:w-[150px] min-[1420px]:mt-8"
      />
    </section>
  );
}
