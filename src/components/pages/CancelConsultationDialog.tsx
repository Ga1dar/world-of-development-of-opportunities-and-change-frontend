import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CabinetAppointment } from "../../api/userCabinet";

type CancelConsultationDialogProps = {
  open: boolean;
  appointment: CabinetAppointment | null;
  language: string;
  isSubmitting: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

const copy = {
  ua: {
    title: "Відміна запису на консультацію",
    description: "Ви впевнені, що хочете відмінити запис?",
    action: "Відмінити запис",
    submitting: "Відміняємо...",
  },
  en: {
    title: "Cancel consultation booking",
    description: "Are you sure you want to cancel this booking?",
    action: "Cancel booking",
    submitting: "Cancelling...",
  },
};

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

export function CancelConsultationDialog({
  open,
  appointment,
  language,
  isSubmitting,
  error,
  onOpenChange,
  onConfirm,
}: CancelConsultationDialogProps) {
  const labels = useMemo(
    () => (isEnglishLanguage(language) ? copy.en : copy.ua),
    [language],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="cancel-consultation-dialog-description"
        className="min-h-[431px] w-[min(calc(100vw-20px),390px)] max-w-[min(calc(100vw-20px),390px)] content-start rounded-xl border-0 bg-[#FFF7FF] px-5 py-8 text-center text-[#1C100E] shadow-none ring-0
        min-[744px]:min-h-[432px] min-[744px]:w-[600px] min-[744px]:max-w-[600px] min-[744px]:px-20 min-[744px]:py-12
        min-[1023px]:min-h-[443px]
        min-[1420px]:min-h-[454px]
        min-[1900px]:min-h-[472px] min-[1900px]:w-[825px] min-[1900px]:max-w-[825px] min-[1900px]:px-40"
      >
        <div className="flex min-h-[350px] flex-col items-center justify-center min-[744px]:min-h-[330px] min-[1900px]:min-h-[360px]">
          <img
            src="/Logo1.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-[112px] object-contain min-[744px]:w-[124px] min-[1900px]:w-[132px]"
          />

          <DialogTitle className="mt-7 max-w-[270px] font-montserrat text-[20px] font-medium leading-[1.08] text-[#1C100E] min-[744px]:max-w-[330px] min-[744px]:text-[22px] min-[1900px]:max-w-[460px] min-[1900px]:text-[24px]">
            {labels.title}
          </DialogTitle>

          <DialogDescription
            id="cancel-consultation-dialog-description"
            className="mt-6 max-w-[280px] font-montserrat text-[12px] leading-[1.3] text-[#1C100E]/70 min-[744px]:max-w-[360px] min-[744px]:text-[13px]"
          >
            {labels.description}
          </DialogDescription>

          {error ? (
            <p className="mt-4 max-w-[280px] font-montserrat text-[12px] leading-[1.3] text-[#83105F]">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            disabled={isSubmitting || !appointment}
            onClick={onConfirm}
            className="mt-6 h-11 w-full max-w-[300px] rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat text-[13px] font-medium text-[#1C100E] shadow-btn hover:brightness-105 disabled:cursor-wait disabled:opacity-70 min-[744px]:max-w-[330px] min-[744px]:text-[14px] min-[1900px]:max-w-[465px]"
          >
            {isSubmitting ? labels.submitting : labels.action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
