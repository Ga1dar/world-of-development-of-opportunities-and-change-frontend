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

type EventRegistrationDialogProps = {
  eventId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EXPERIENCE_OPTIONS = [
  "Батьки",
  "Вчитель/ Вчителька",
  "Психолог/Психологиня",
  "Травмопедагог/Травмопедагогиня",
  "Соціальний робітник/робітниця",
  "Інше",
];

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  experience: EXPERIENCE_OPTIONS[0],
  comment: "",
};

export function EventRegistrationDialog({
  eventId,
  open,
  onOpenChange,
}: EventRegistrationDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<EventRegistrationResult["status"] | "idle">(
    "idle",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setForm(initialForm);
    setStatus("idle");
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const result = await registerForEvent(eventId, form);
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
        className="max-h-[calc(100dvh-24px)] w-[min(calc(100vw-24px),520px)] overflow-y-auto rounded-[12px] border-0 bg-[#FFF7FF] px-5 py-5 text-[#1C100E] shadow-none ring-0 sm:px-8 sm:py-8"
      >
        {status !== "idle" ? (
          renderStatus()
        ) : (
          <form onSubmit={handleSubmit} className="px-1 pb-3 pt-2 sm:px-4">
            <img src="/Logo1.png" alt={t("bottomTitle")} className="mx-auto w-[96px]" />
            <DialogTitle className="mt-5 text-center font-montserrat text-[24px] font-medium leading-[1.2] text-[#1C100E] sm:text-[28px]">
              {t("eventRegistration.title")}
            </DialogTitle>
            <DialogDescription
              id="event-registration-description"
              className="mt-3 text-center font-montserrat text-[13px] leading-[1.4] text-[#1C100E]/70"
            >
              {t("eventRegistration.description")}
            </DialogDescription>

            <div className="mt-6 grid gap-3">
              <Label className="sr-only" htmlFor="event-full-name">
                {t("eventRegistration.fullName")}
              </Label>
              <Input
                id="event-full-name"
                value={form.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
                maxLength={120}
                required
                placeholder={t("eventRegistration.fullName")}
                className="h-11 rounded-[30px] border-0 bg-white px-4 font-montserrat text-[14px]"
              />

              <Label className="sr-only" htmlFor="event-email">
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
                className="h-11 rounded-[30px] border-0 bg-white px-4 font-montserrat text-[14px]"
              />

              <Label className="sr-only" htmlFor="event-phone">
                {t("eventRegistration.phone")}
              </Label>
              <Input
                id="event-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                maxLength={40}
                required
                placeholder={t("eventRegistration.phone")}
                className="h-11 rounded-[30px] border-0 bg-white px-4 font-montserrat text-[14px]"
              />

              <Label className="sr-only" htmlFor="event-experience">
                {t("eventRegistration.experience")}
              </Label>
              <select
                id="event-experience"
                value={form.experience}
                onChange={(event) => updateField("experience", event.target.value)}
                className="h-11 rounded-[30px] border-0 bg-white px-4 font-montserrat text-[14px] text-[#1C100E] outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
                required
              >
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <Label className="sr-only" htmlFor="event-comment">
                {t("eventRegistration.comment")}
              </Label>
              <textarea
                id="event-comment"
                value={form.comment}
                onChange={(event) => updateField("comment", event.target.value)}
                maxLength={1000}
                placeholder={t("eventRegistration.comment")}
                className="min-h-24 resize-none rounded-[18px] border-0 bg-white px-4 py-3 font-montserrat text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 h-10 w-full rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] shadow-btn hover:brightness-105 disabled:opacity-70"
            >
              {isSubmitting
                ? t("eventRegistration.submitting")
                : t("eventRegistration.submit")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
