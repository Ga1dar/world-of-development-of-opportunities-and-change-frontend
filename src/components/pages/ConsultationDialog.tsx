import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  bookConsultation,
  type ConsultationBookingResult,
} from "../../api/consultations";

type ConsultationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialistId: number;
};

type DialogStep = "intro" | "calendar" | ConsultationBookingResult["status"];

const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const capitalize = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

const getWeekDays = (locale: string) =>
  Array.from({ length: 7 }, (_, index) =>
    capitalize(
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
        new Date(Date.UTC(2026, 0, 5 + index)),
      ),
    ),
  );

const getMonthLabel = (date: Date, locale: string) =>
  `${capitalize(
    new Intl.DateTimeFormat(locale, { month: "long" }).format(date),
  )} ${date.getFullYear()}`;

const getMonthDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const cells: { date: Date; currentMonth: boolean }[] = [];

  for (let index = leadingDays - 1; index >= 0; index -= 1) {
    cells.push({
      date: new Date(year, month - 1, daysInPreviousMonth - index),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(year, month, day),
      currentMonth: true,
    });
  }

  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({
      date: new Date(year, month + 1, cells.length - leadingDays - daysInMonth + 1),
      currentMonth: false,
    });
  }

  return cells;
};

export function ConsultationDialog({
  open,
  onOpenChange,
  specialistId,
}: ConsultationDialogProps) {
  const { i18n, t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const [step, setStep] = useState<DialogStep>("intro");
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(today));
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedTime, setSelectedTime] = useState(TIMES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUkrainian = i18n.language === "ua" || i18n.language === "uk";
  const calendarLocale = isUkrainian ? "uk-UA" : "en-US";
  const weekDays = useMemo(() => getWeekDays(calendarLocale), [calendarLocale]);
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const minDate = toDateInputValue(today);

  const reset = () => {
    setStep("intro");
    setSelectedDate(toDateInputValue(today));
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedTime(TIMES[0]);
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const moveMonth = (direction: -1 | 1) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await bookConsultation({
        specialist: specialistId,
        date: selectedDate,
        time: selectedTime,
      });

      setStep(result.status);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLogo = () => (
    <img
      src="/Logo1.png"
      alt={t("bottomTitle")}
      className="mx-auto h-auto w-[84px] object-contain sm:w-[96px]"
    />
  );

  const renderStatus = () => {
    const isSuccess = step === "success";
    const title = isSuccess
      ? t("consultationDialog.successTitle")
      : step === "busy"
        ? t("consultationDialog.busyTitle")
        : t("consultationDialog.errorTitle");
    const description = isSuccess
      ? t("consultationDialog.successDescription")
      : step === "busy"
        ? t("consultationDialog.busyDescription")
        : t("consultationDialog.errorDescription");
    const action = isSuccess
      ? t("consultationDialog.myAppointments")
      : step === "busy"
        ? t("consultationDialog.chooseAnotherTime")
        : t("consultationDialog.tryAgain");

    return (
      <div className="flex flex-col items-center px-2 pb-5 pt-3 text-center sm:px-8 sm:pb-8">
        {renderLogo()}
        <DialogTitle className="mt-6 font-montserrat text-[24px] font-medium leading-[1.2] text-[#1C100E] sm:text-[28px]">
          {title}
        </DialogTitle>
        <DialogDescription
          id="consultation-dialog-description"
          className="mt-5 max-w-[292px] font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/75 sm:text-[13px]"
        >
          {description}
        </DialogDescription>
        <Button
          type="button"
          onClick={() => (isSuccess ? handleOpenChange(false) : setStep("calendar"))}
          className="mt-6 h-10 w-full max-w-84 rounded-[30px] 
          border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B]
           to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] 
           shadow-btn hover:brightness-105"
        >
          {action}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby="consultation-dialog-description"
        className="max-h-[calc(100dvh-24px)] w-[min(calc(100vw-24px),528px)] overflow-x-hidden overflow-y-auto rounded-[12px] border-0 bg-[#FFF7FF] px-5 py-5 text-[#1C100E] shadow-none ring-0 sm:px-8 sm:py-8 min-[1420px]:w-[490px]"
      >
        {step === "intro" && (
          <div className="flex flex-col items-center px-2 pb-5 pt-3 text-center sm:px-8 sm:pb-8">
            {renderLogo()}
            <DialogTitle className="mt-7 max-w-[360px] font-montserrat text-[22px] font-medium leading-[1.2] text-[#1C100E] sm:text-[28px]">
              {t("consultationDialog.introTitle")}
            </DialogTitle>
            <DialogDescription
              id="consultation-dialog-description"
              className="mt-6 max-w-[292px] font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/75 sm:text-[13px]"
            >
              {t("consultationDialog.introDescription")}
            </DialogDescription>
            <Button
              type="button"
              onClick={() => setStep("calendar")}
              className="mt-6 h-10 w-full max-w-[336px] rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] shadow-btn hover:brightness-105"
            >
              {t("consultationDialog.yes")}
            </Button>
          </div>
        )}

        {step === "calendar" && (
          <div className="flex w-full min-w-0 flex-col items-center overflow-hidden px-1 pb-2 pt-3 text-center sm:px-4 sm:pb-5">
            {renderLogo()}
            <DialogTitle className="mt-5 max-w-full font-montserrat text-[22px] font-medium leading-[1.2] text-[#1C100E] sm:text-[28px]">
              {t("consultationDialog.calendarTitle")}
            </DialogTitle>
            <DialogDescription
              id="consultation-dialog-description"
              className="mt-4 max-w-full font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/70 sm:text-[13px]"
            >
              {t("consultationDialog.calendarDescription")}
            </DialogDescription>

            <div className="mt-6 w-full max-w-full rounded-xl bg-white px-4 py-4 sm:max-w-85">
              <div className="flex items-center justify-between">
                <p className="font-montserrat text-[14px] font-medium text-[#1C100E]">
                  {getMonthLabel(visibleMonth, calendarLocale)}
                </p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("consultationDialog.previousMonth")}
                    onClick={() => moveMonth(-1)}
                    className="size-7 rounded-full text-[#1C100E] hover:bg-[#F0E8F0]"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("consultationDialog.nextMonth")}
                    onClick={() => moveMonth(1)}
                    className="size-7 rounded-full text-[#1C100E] hover:bg-[#F0E8F0]"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <span
                    key={day}
                    className="font-montserrat text-[11px] font-medium text-[#1C100E]"
                  >
                    {day}
                  </span>
                ))}

                {monthDays.map(({ date, currentMonth }) => {
                  const value = toDateInputValue(date);
                  const isSelected = value === selectedDate;
                  const isDisabled = value < minDate;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isDisabled}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedDate(value)}
                      className={`flex aspect-square items-center justify-center rounded-full font-montserrat text-[12px] leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] ${
                        isSelected
                          ? "bg-[#402940] text-white"
                          : currentMonth
                            ? "text-[#1C100E] hover:bg-[#F0E8F0]"
                            : "text-[#1C100E]/25"
                      } ${isDisabled ? "cursor-not-allowed opacity-30 hover:bg-transparent" : ""}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 font-montserrat text-[14px] text-[#1C100E]">
              {t("consultationDialog.time")}
            </p>
            <div
              className="mt-3 flex items-center min-h-10 w-full min-w-0 max-w-full pl-1
              gap-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none]
              sm:max-w-[340px] [&::-webkit-scrollbar]:hidden">
              {TIMES.map((time) => (
                <button
                  key={time}
                  type="button"
                  aria-pressed={selectedTime === time}
                  onClick={() => setSelectedTime(time)}
                  className={`flex h-8 min-w-[52px] shrink-0 items-center justify-center rounded-full
                     bg-white px-0 text-center font-montserrat text-[12px] leading-none text-[#1C100E] 
                     transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] ${
                    selectedTime === time
                      ? "ring-2 ring-[#402940]"
                      : "hover:bg-[#F0E8F0]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <p className="mt-4 max-w-full font-montserrat text-[11px] leading-[1.35] text-[#1C100E]/65 sm:max-w-[340px]">
              {t("consultationDialog.afterConfirmation")}
            </p>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="mt-5 h-10 w-full max-w-full rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] shadow-btn hover:brightness-105 disabled:opacity-70 sm:max-w-[340px]"
            >
              {isSubmitting
                ? t("consultationDialog.submitting")
                : t("consultationDialog.book")}
            </Button>
          </div>
        )}

        {(step === "success" || step === "busy" || step === "error") && renderStatus()}
      </DialogContent>
    </Dialog>
  );
}
