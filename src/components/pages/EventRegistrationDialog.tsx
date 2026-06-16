import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerForEvent,
  type EventRegistrationResult,
} from "../../api/events";
import { PhoneCountryField } from "./PhoneCountryField";

type EventRegistrationDialogProps = {
  eventId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EXPERIENCE_OPTIONS = [
  { value: "parents", labelUa: "\u0411\u0430\u0442\u044c\u043a\u0438", labelEn: "Parents" },
  {
    value: "teacher",
    labelUa: "\u0412\u0447\u0438\u0442\u0435\u043b\u044c / \u0412\u0447\u0438\u0442\u0435\u043b\u044c\u043a\u0430",
    labelEn: "Teacher",
  },
  {
    value: "psychologist",
    labelUa: "\u041f\u0441\u0438\u0445\u043e\u043b\u043e\u0433 / \u041f\u0441\u0438\u0445\u043e\u043b\u043e\u0433\u0438\u043d\u044f",
    labelEn: "Psychologist",
  },
  {
    value: "trauma_pedagogy",
    labelUa: "\u0422\u0440\u0430\u0432\u043c\u043e\u043f\u0435\u0434\u0430\u0433\u043e\u0433 / \u0422\u0440\u0430\u0432\u043c\u043e\u043f\u0435\u0434\u0430\u0433\u043e\u0433\u0438\u043d\u044f",
    labelEn: "Trauma pedagogy",
  },
  {
    value: "social_worker",
    labelUa: "\u0421\u043e\u0446\u0456\u0430\u043b\u044c\u043d\u0438\u0439 \u0440\u043e\u0431\u0456\u0442\u043d\u0438\u043a / \u0440\u043e\u0431\u0456\u0442\u043d\u0438\u0446\u044f",
    labelEn: "Social worker",
  },
  { value: "other", labelUa: "\u0406\u043d\u0448\u0435", labelEn: "Other" },
] as const;

const truthyMeatAnswers = [
  "yes",
  "y",
  "true",
  "1",
  "\u0442\u0430\u043a",
  "\u0442\u0430",
  "\u0457\u043c",
  "\u0435\u043c",
  "\u0432\u0436\u0438\u0432\u0430\u044e",
];

const initialForm = {
  full_name: "",
  birth_date: "",
  gender: "",
  email: "",
  phone: "",
  experience: "",
  eats_meat: "",
  consent: false,
};

const fieldClass =
  "h-[36px] rounded-[18px] border border-[#402940] bg-transparent px-3 font-montserrat text-[13px] text-[#1C100E] outline-none placeholder:text-[#1C100E]/55 focus-visible:ring-1 focus-visible:ring-[#40213F] min-[744px]:h-[38px] min-[744px]:px-3.5 min-[744px]:text-[13px]";

const labelClass =
  "mb-2 block font-montserrat text-[12px] leading-none text-[#1C100E]/85 min-[744px]:text-[13px]";

export function EventRegistrationDialog({
  eventId,
  open,
  onOpenChange,
}: EventRegistrationDialogProps) {
  const { i18n, t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<EventRegistrationResult["status"] | "idle">(
    "idle",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEnglish = i18n.language.startsWith("en");
  const modalTitle = isEnglish ? "Sign up" : "Записатися";
  const submitLabel = isEnglish ? "Send" : "Надіслати";
  const introText = isEnglish
    ? "Fill in the form and we will contact you soon"
    : "Заповніть форму і звʼяжемося із вами у найближчий час";

  const reset = () => {
    setForm(initialForm);
    setStatus("idle");
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const parseEatingMeat = (value: string) =>
    truthyMeatAnswers.includes(value.trim().toLowerCase());

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const result = await registerForEvent(eventId, {
      full_name: form.full_name,
      birth_date: form.birth_date,
      gender: form.gender,
      email: form.email,
      phone: form.phone,
      experience: form.experience,
      eating_meat: parseEatingMeat(form.eats_meat),
      is_agreed: form.consent,
    });
    setStatus(result.status);
    setIsSubmitting(false);
  };

  const renderStatus = () => {
    const isSuccess = status === "success";
    const title = isSuccess
      ? t("eventRegistration.successTitle")
      : status === "network"
        ? t("eventRegistration.networkTitle")
        : t("eventRegistration.errorTitle");
    const description = isSuccess
      ? t("eventRegistration.successDescription")
      : status === "network"
        ? t("eventRegistration.networkDescription")
        : t("eventRegistration.errorDescription");

    return (
      <div className="flex flex-col items-center px-2 py-6 text-center sm:px-8">
        <img src="/Logo1.png" alt={t("bottomTitle")} className="w-[96px]" />
        <DialogTitle className="mt-6 font-montserrat text-[26px] font-medium text-[#1C100E]">
          {title}
        </DialogTitle>
        <DialogDescription
          id="event-registration-description"
          className="mt-4 max-w-[320px] font-montserrat text-[13px] leading-[1.4] text-[#1C100E]/75"
        >
          {description}
        </DialogDescription>
        <Button
          type="button"
          onClick={() => (isSuccess ? handleOpenChange(false) : setStatus("idle"))}
          className="mt-6 h-10 w-full max-w-[336px] rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] shadow-btn hover:brightness-105"
        >
          {isSuccess ? t("eventRegistration.done") : t("eventRegistration.tryAgain")}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby="event-registration-description"
        className="w-[min(calc(100vw-24px),360px)] max-h-[calc(100dvh-24px)] max-w-[min(calc(100vw-24px),360px)]
        overflow-x-hidden overflow-y-visible rounded-[8px] border-0 bg-[#FFF7FF]
        px-7 py-6 text-[#1C100E] shadow-none ring-0
        min-[744px]:w-[360px] min-[744px]:max-w-[360px] min-[1420px]:w-[574px]
        min-[1420px]:max-w-[574px] min-[1420px]:px-[86px] min-[1420px]:py-9"
      >
        {status !== "idle" ? (
          renderStatus()
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[462px]">
            <img
              src="/Logo1.png"
              alt={t("bottomTitle")}
              className="mx-auto h-auto w-[64px] min-[744px]:w-[70px]"
            />
            <DialogTitle className="mt-3 text-center font-montserrat text-[22px] font-medium leading-[1.2] text-[#1C100E] min-[744px]:text-[24px]">
              {modalTitle}
            </DialogTitle>
            <DialogDescription
              id="event-registration-description"
              className="mx-auto mt-5 max-w-[340px] text-center font-montserrat text-[11px] leading-[1.45] text-[#1C100E]/70 min-[744px]:text-[12px]"
            >
              {introText}
            </DialogDescription>

            <div className="mt-5 grid gap-3.5">
              <div>
                <Label className={labelClass} htmlFor="event-full-name">
                  {isEnglish ? "Your full name" : "Ваше імʼя та прізвище"}
                </Label>
                <Input
                  id="event-full-name"
                  value={form.full_name}
                  onChange={(event) => updateField("full_name", event.target.value)}
                  maxLength={120}
                  required
                  placeholder={isEnglish ? "Name, Surname..." : "Імʼя, Прізвище..."}
                  className={fieldClass}
                />
              </div>

              <div>
                <Label className={labelClass} htmlFor="event-birth-date">
                  {isEnglish ? "Date of birth" : "Дата народження"}
                </Label>
                <Input
                  id="event-birth-date"
                  value={form.birth_date}
                  onChange={(event) => updateField("birth_date", event.target.value)}
                  maxLength={10}
                  required
                  placeholder={isEnglish ? "dd.mm.yyyy" : "чч.мм.рррр"}
                  className={fieldClass}
                />
              </div>

              <div>
                <Label className={labelClass} htmlFor="event-gender">
                  {isEnglish ? "Your gender" : "Ваш гендер"}
                </Label>
                <Input
                  id="event-gender"
                  value={form.gender}
                  onChange={(event) => updateField("gender", event.target.value)}
                  maxLength={80}
                  required
                  placeholder={isEnglish ? "Gender..." : "Гендер..."}
                  className={fieldClass}
                />
              </div>

              <PhoneCountryField
                label={t("eventRegistration.phone")}
                placeholder={t("eventRegistration.phone")}
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                language={i18n.language}
                required
              />

              <div>
                <Label className={labelClass} htmlFor="event-email">
                  {t("eventRegistration.email")}
                </Label>
                <Input
                  id="event-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  maxLength={160}
                  required
                  placeholder={t("eventRegistration.email")}
                  className={fieldClass}
                />
              </div>

              <div>
                <Label className={labelClass} htmlFor="event-experience">
                  {isEnglish ? "Experience" : "Досвід"}
                </Label>
                <select
                  id="event-experience"
                  value={form.experience}
                  onChange={(event) => updateField("experience", event.target.value)}
                  className={`${fieldClass} w-full appearance-auto`}
                  required
                >
                  <option value="" disabled>
                    {isEnglish ? "Choose an option" : "Виберіть варіант"}
                  </option>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {isEnglish ? option.labelEn : option.labelUa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className={labelClass} htmlFor="event-eats-meat">
                  {isEnglish ? "Do you eat meat?" : "Чи вживає мʼясо?"}
                </Label>
                <Input
                  id="event-eats-meat"
                  value={form.eats_meat}
                  onChange={(event) => updateField("eats_meat", event.target.value)}
                  maxLength={40}
                  required
                  placeholder={isEnglish ? "Yes/No" : "Так/Ні"}
                  className={fieldClass}
                />
                <p className="mt-1 font-montserrat text-[10px] leading-[1.25] text-[#1C100E]/80 min-[744px]:text-[11px]">
                  {isEnglish
                    ? "(If two-day trainings include catering)"
                    : "(Якщо тренінги дводенні передбачено кейтерінг)"}
                </p>
              </div>

              <label className="flex items-center gap-2 font-montserrat text-[10px] leading-[1.3] text-[#1C100E]/85 min-[744px]:text-[11px]">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => updateField("consent", event.target.checked)}
                  required
                  className="size-4 shrink-0 accent-[#402940]"
                />
                <span>
                  {isEnglish
                    ? "I consent to the processing of personal data"
                    : "Я надаю згоду на обробку персональних даних"}
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 h-10 w-full rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] shadow-btn hover:brightness-105 disabled:opacity-70"
            >
              {isSubmitting
                ? t("eventRegistration.submitting")
                : submitLabel}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
