import { Camera } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { notifyAuthChanged } from "../../api/auth";
import {
  ensureAccountProfile,
  getUserCabinetData,
  updateProfileAvatar,
  updateUserProfile,
  type CabinetProfile,
} from "../../api/userCabinet";
import { LogIn } from "./LogIn";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  about: string;
};

const copy = {
  ua: {
    loading: "Завантажуємо профіль...",
    authRequired: "Увійдіть, щоб редагувати профіль.",
    userRequired: "Редагування профілю користувача недоступне для цього облікового запису.",
    firstName: "Ім'я*",
    firstNamePlaceholder: "Ім'я..",
    lastName: "Прізвище*",
    lastNamePlaceholder: "Прізвище..",
    phone: "Телефон",
    phonePlaceholder: "Телефон",
    city: "Місто",
    cityPlaceholder: "Місто",
    about: "Про себе",
    aboutPlaceholder: "Коротка інформація про себе",
    chooseAvatar: "Змінити фото",
    save: "Зберегти зміни",
    saving: "Зберігаємо...",
    cancel: "Скасувати",
    saveError: "Не вдалося зберегти зміни. Перевірте поля та спробуйте ще раз.",
  },
  en: {
    loading: "Loading profile...",
    authRequired: "Log in to edit your profile.",
    userRequired: "User profile editing is unavailable for this account.",
    firstName: "First name*",
    firstNamePlaceholder: "First name..",
    lastName: "Last name*",
    lastNamePlaceholder: "Last name..",
    phone: "Phone",
    phonePlaceholder: "Phone",
    city: "City",
    cityPlaceholder: "City",
    about: "About",
    aboutPlaceholder: "Short information about yourself",
    chooseAvatar: "Change photo",
    save: "Save changes",
    saving: "Saving...",
    cancel: "Cancel",
    saveError: "Could not save changes. Check the fields and try again.",
  },
};

const pageMaxWidth =
  "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn";

const whiteButton = "rounded-[30px] bg-white font-montserrat font-medium text-[#1C100E]";
const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const splitFullName = (profile: CabinetProfile | null) => {
  if (!profile) return { firstName: "", lastName: "" };

  return {
    firstName: profile.firstName || profile.fullName.split(" ")[0] || "",
    lastName: profile.lastName || profile.fullName.split(" ").slice(1).join(" "),
  };
};

const toFormState = (profile: CabinetProfile | null): FormState => {
  const name = splitFullName(profile);

  return {
    firstName: name.firstName,
    lastName: name.lastName,
    phone: profile?.phone || "",
    city: profile?.city || "",
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
        className="h-[34px] w-full rounded-[18px] border border-[#40213F] bg-[#F0E8F0] px-3 font-montserrat text-[12px] text-[#1C100E] outline-none transition placeholder:text-[#1C100E]/45 focus:ring-2 focus:ring-[#B34D8D]/30 min-[744px]:h-[37px]"
      />
    </label>
  );
}

export function UserProfileEditPage() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getUserCabinetData(controller.signal);
        const profile =
          data.profile && data.profile.profileKind !== "specialist" && !data.profile.userProfileId
            ? await ensureAccountProfile("user")
            : data.profile;
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile?.userProfileId || profile.profileKind === "specialist") return;

    setIsSaving(true);
    setError("");

    try {
      await updateUserProfile(profile.userProfileId, form);
      if (avatarFile) await updateProfileAvatar(profile, avatarFile);
      notifyAuthChanged();
      navigate("/profile");
    } catch (error) {
      console.error(error);
      const details = error instanceof Error && error.message ? ` (${error.message})` : "";
      setError(`${labels.saveError}${details}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[1420px]:pt-20`}>
        <p className="text-center font-montserrat text-[16px] text-[#1C100E]">{labels.loading}</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[1420px]:pt-20`}>
        <div className="mx-auto max-w-[520px] rounded-[22px] bg-[#F8F8F8] px-6 py-10 text-center font-montserrat">
          <p className="text-[14px] text-[#1C100E]/70">{labels.authRequired}</p>
          <div className="mx-auto mt-6 max-w-[220px] [&_button]:w-full">
            <LogIn variant="menu" text="Вхід" />
          </div>
        </div>
      </section>
    );
  }

  if (!profile.userProfileId || profile.profileKind === "specialist") {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[1420px]:pt-20`}>
        <div className="mx-auto max-w-[520px] rounded-[22px] bg-[#F8F8F8] px-6 py-10 text-center font-montserrat text-[14px] text-[#1C100E]/70">
          {labels.userRequired}
        </div>
      </section>
    );
  }

  return (
    <section className={`${pageMaxWidth} pt-4 pb-16 min-[744px]:pt-7 min-[1023px]:pt-8 min-[1420px]:pt-12`}>
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
              src={avatarPreview || "/user.jpg"}
              alt={profile.fullName}
              className="h-full w-full rounded-full object-cover"
            />
            <span className="absolute right-1 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#E8DCE8]">
              <Camera className="h-4 w-4 text-[#1C100E]" />
            </span>
            <span className="sr-only">{labels.chooseAvatar}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setAvatarFile(event.target.files?.[0] || null)
              }
            />
          </label>
          <h1 className="mt-5 text-[18px] font-medium leading-[1.2] min-[744px]:text-[20px]">
            {profile.fullName}
          </h1>
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
          <Field
            label={labels.phone}
            placeholder={labels.phonePlaceholder}
            value={form.phone}
            onChange={updateField("phone")}
          />
          <Field
            label={labels.city}
            placeholder={labels.cityPlaceholder}
            value={form.city}
            onChange={updateField("city")}
          />

          <label className="block font-montserrat text-[#1C100E]">
            <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">{labels.about}</span>
            <textarea
              value={form.about}
              onChange={(event) => updateField("about")(event.target.value)}
              placeholder={labels.aboutPlaceholder}
              rows={3}
              className="w-full resize-y rounded-[18px] border border-[#40213F] bg-[#F0E8F0] px-3 py-2 font-montserrat text-[12px] text-[#1C100E] outline-none transition placeholder:text-[#1C100E]/45 focus:ring-2 focus:ring-[#B34D8D]/30"
            />
          </label>

          {error ? (
            <p className="text-center text-[12px] leading-[1.3] text-[#83105F]">{error}</p>
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
    </section>
  );
}
