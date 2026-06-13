import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getConsultationSlots,
  rescheduleConsultationAppointment,
  type ConsultationMutationResult,
  type ConsultationSlot,
} from "../../api/consultations";
import type { CabinetAppointment } from "../../api/userCabinet";

type RescheduleAppointmentDialogProps = {
  open: boolean;
  appointment: CabinetAppointment | null;
  specialistId: number;
  language: string;
  onOpenChange: (open: boolean) => void;
  onRescheduled: (appointmentId: string, slot: ConsultationSlot) => void;
};

const copy = {
  ua: {
    title: "Обрати дату та час",
    description: "Оберіть зручну для вас дату та час.",
    time: "Час",
    move: "Перенести запис",
    submitting: "Переносимо...",
    loadingSlots: "Завантажуємо доступний час...",
    slotsLoadFailed: "Не вдалося завантажити доступний час.",
    noSlots: "На цю дату немає вільного часу.",
    previousMonth: "Попередній місяць",
    nextMonth: "Наступний місяць",
    successTitle: "Запис перенесено",
    busyTitle: "Цей час уже зайнятий",
    errorTitle: "Не вдалося перенести запис",
    chooseAnotherTime: "Обрати інший час",
    close: "Закрити",
  },
  en: {
    title: "Choose date and time",
    description: "Choose a convenient date and time.",
    time: "Time",
    move: "Reschedule booking",
    submitting: "Rescheduling...",
    loadingSlots: "Loading available time...",
    slotsLoadFailed: "Could not load available time.",
    noSlots: "No available time for this date.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    successTitle: "Booking rescheduled",
    busyTitle: "This time is already booked",
    errorTitle: "Could not reschedule booking",
    chooseAnotherTime: "Choose another time",
    close: "Close",
  },
};

type DialogStep = "calendar" | ConsultationMutationResult["status"];

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

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

export function RescheduleAppointmentDialog({
  open,
  appointment,
  specialistId,
  language,
  onOpenChange,
  onRescheduled,
}: RescheduleAppointmentDialogProps) {
  const labels = isEnglishLanguage(language) ? copy.en : copy.ua;
  const today = useMemo(() => new Date(), []);
  const calendarLocale = isEnglishLanguage(language) ? "en-US" : "uk-UA";
  const [step, setStep] = useState<DialogStep>("calendar");
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(today));
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [slotsLoadFailed, setSlotsLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeScrollerRef = useRef<HTMLDivElement | null>(null);
  const timeDragRef = useRef({
    isDragging: false,
    hasMoved: false,
    startScrollLeft: 0,
    startX: 0,
  });
  const suppressTimeClickRef = useRef(false);
  const weekDays = useMemo(() => getWeekDays(calendarLocale), [calendarLocale]);
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const minDate = toDateInputValue(today);
  const availableDates = useMemo(() => new Set(slots.map((slot) => slot.date)), [slots]);
  const selectedDaySlots = useMemo(
    () => slots.filter((slot) => slot.date === selectedDate),
    [selectedDate, slots],
  );
  const selectedDaySlotByTime = useMemo(
    () => new Map(selectedDaySlots.map((slot) => [slot.time, slot])),
    [selectedDaySlots],
  );
  const selectedSlot = useMemo(
    () => selectedDaySlotByTime.get(selectedTime) || null,
    [selectedDaySlotByTime, selectedTime],
  );

  useEffect(() => {
    if (!open || !Number.isInteger(specialistId) || specialistId <= 0) return;

    const controller = new AbortController();
    setStep("calendar");
    setIsSlotsLoading(true);
    setSlotsLoadFailed(false);

    getConsultationSlots(specialistId, controller.signal)
      .then((items) => {
        setSlots(items);

        const firstSlot = items[0];
        if (firstSlot) {
          const firstDate = new Date(firstSlot.date);
          setSelectedDate(firstSlot.date);
          setSelectedTime(firstSlot.time);
          setVisibleMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
        } else {
          setSelectedTime("");
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSlotsLoadFailed(true);
        setSlots([]);
        setSelectedTime("");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsSlotsLoading(false);
        }
      });

    return () => controller.abort();
  }, [open, specialistId]);

  useEffect(() => {
    if (!selectedDaySlots.length) {
      setSelectedTime("");
      return;
    }

    if (!selectedDaySlots.some((slot) => slot.time === selectedTime)) {
      setSelectedTime(selectedDaySlots[0].time);
    }
  }, [selectedDate, selectedDaySlots, selectedTime]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setStep("calendar");
      setSelectedDate(toDateInputValue(today));
      setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedTime("");
      setSlots([]);
      setSlotsLoadFailed(false);
      setIsSubmitting(false);
    }
  };

  const moveMonth = (direction: -1 | 1) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting || !appointment) return;

    if (!selectedSlot) {
      setStep("busy");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await rescheduleConsultationAppointment(
        appointment.id,
        selectedSlot.id,
      );
      setStep(result.status);

      if (result.status === "success") {
        onRescheduled(appointment.id, selectedSlot);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("button")) return;

    const scroller = timeScrollerRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;

    timeDragRef.current = {
      isDragging: true,
      hasMoved: false,
      startScrollLeft: scroller.scrollLeft,
      startX: event.clientX,
    };

    scroller.setPointerCapture(event.pointerId);
  };

  const handleTimePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = timeScrollerRef.current;
    const drag = timeDragRef.current;

    if (!scroller || !drag.isDragging) return;

    const deltaX = event.clientX - drag.startX;

    if (Math.abs(deltaX) > 4) {
      drag.hasMoved = true;
    }

    scroller.scrollLeft = drag.startScrollLeft - deltaX;
  };

  const finishTimeDrag = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = timeScrollerRef.current;
    const drag = timeDragRef.current;

    if (!drag.isDragging) return;

    if (drag.hasMoved) {
      suppressTimeClickRef.current = true;
    }

    drag.isDragging = false;

    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
  };

  const handleTimeClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressTimeClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressTimeClickRef.current = false;
  };

  const renderStatus = () => {
    const isSuccess = step === "success";
    const title = isSuccess
      ? labels.successTitle
      : step === "busy"
        ? labels.busyTitle
        : labels.errorTitle;

    return (
      <div className="flex flex-col items-center px-2 pb-5 pt-3 text-center sm:px-8 sm:pb-8">
        <img src="/Logo1.png" alt="" className="mx-auto h-auto w-21 object-contain sm:w-24" />
        <DialogTitle className="mt-6 font-montserrat text-[24px] font-medium leading-[1.2] text-[#1C100E] sm:text-[28px]">
          {title}
        </DialogTitle>
        <Button
          type="button"
          onClick={() => (isSuccess ? handleOpenChange(false) : setStep("calendar"))}
          className="mt-6 h-10 w-full max-w-84 rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] shadow-btn hover:brightness-105"
        >
          {isSuccess ? labels.close : labels.chooseAnotherTime}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby="reschedule-dialog-description"
        className="max-h-[calc(100dvh-24px)] w-[min(calc(100vw-24px),390px)] max-w-[min(calc(100vw-24px),390px)] overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-[#FFF7FF] px-5 py-5 text-[#1C100E] shadow-none ring-0 min-[744px]:w-[600px] min-[744px]:max-w-[600px] min-[1023px]:w-[600px] min-[1900px]:w-[825px] min-[1900px]:max-w-[825px] min-[1900px]:px-8"
      >
        {step === "calendar" ? (
          <div className="flex w-full min-w-0 flex-col items-center overflow-hidden px-1 pb-2 pt-3 text-center sm:px-4 sm:pb-5">
            <img src="/Logo1.png" alt="" className="mx-auto h-auto w-21 object-contain sm:w-24" />
            <DialogTitle className="mt-5 max-w-full font-montserrat text-[22px] font-medium leading-[1.2] text-[#1C100E] sm:text-[28px]">
              {labels.title}
            </DialogTitle>
            <DialogDescription
              id="reschedule-dialog-description"
              className="mt-4 max-w-full font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/70 sm:text-[13px]"
            >
              {labels.description}
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
                    aria-label={labels.previousMonth}
                    onClick={() => moveMonth(-1)}
                    className="size-7 rounded-full text-[#1C100E] hover:bg-[#F0E8F0]"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={labels.nextMonth}
                    onClick={() => moveMonth(1)}
                    className="size-7 rounded-full text-[#1C100E] hover:bg-[#F0E8F0]"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <span key={day} className="font-montserrat text-[11px] font-medium text-[#1C100E]">
                    {day}
                  </span>
                ))}

                {monthDays.map(({ date, currentMonth }) => {
                  const value = toDateInputValue(date);
                  const isSelected = value === selectedDate;
                  const hasSlot = availableDates.has(value);
                  const isDisabled = value < minDate || !hasSlot || isSlotsLoading;

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
                            : hasSlot
                              ? "text-[#1C100E]/25"
                              : "text-[#1C100E]/15"
                      } ${isDisabled ? "cursor-not-allowed opacity-30 hover:bg-transparent" : ""}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex w-full max-w-full items-center justify-between sm:max-w-[340px]">
              <p className="font-montserrat text-[14px] text-[#1C100E]">{labels.time}</p>
              <div className="flex gap-1">
                <ChevronLeft className="size-4 text-[#1C100E]" />
                <ChevronRight className="size-4 text-[#1C100E]" />
              </div>
            </div>
            {isSlotsLoading && (
              <p className="mt-3 font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/65">
                {labels.loadingSlots}
              </p>
            )}
            {!isSlotsLoading && slotsLoadFailed && (
              <p className="mt-3 font-montserrat text-[12px] leading-[1.35] text-[#83105F]">
                {labels.slotsLoadFailed}
              </p>
            )}
            {!isSlotsLoading && !slotsLoadFailed && !selectedDaySlots.length && (
              <p className="mt-3 font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/65">
                {labels.noSlots}
              </p>
            )}
            <div
              ref={timeScrollerRef}
              onPointerDown={handleTimePointerDown}
              onPointerMove={handleTimePointerMove}
              onPointerUp={finishTimeDrag}
              onPointerCancel={finishTimeDrag}
              onClickCapture={handleTimeClickCapture}
              className="mt-3 flex min-h-14 w-full cursor-grab select-none items-center gap-2 overflow-x-auto overflow-y-hidden pb-2 pl-2 active:cursor-grabbing [scrollbar-color:#402940_#F0E8F0] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#402940]/70 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F0E8F0] sm:max-w-[340px] min-[1900px]:max-w-[520px]"
            >
              {selectedDaySlots.map((slot) => {
                const isSelected = selectedTime === slot.time;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isSlotsLoading}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`flex h-8 min-w-[52px] shrink-0 select-none items-center justify-center rounded-full px-0 text-center font-montserrat text-[12px] leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] ${
                      isSelected
                        ? "bg-[#402940] text-white"
                        : "bg-white text-[#1C100E] hover:bg-[#F0E8F0]"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              disabled={isSubmitting || !selectedSlot}
              onClick={handleSubmit}
              className="mt-5 h-10 w-full max-w-full rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[14px] font-medium text-[#1C100E] shadow-btn hover:brightness-105 disabled:opacity-70 sm:max-w-[340px]"
            >
              {isSubmitting ? labels.submitting : labels.move}
            </Button>
          </div>
        ) : (
          renderStatus()
        )}
      </DialogContent>
    </Dialog>
  );
}
