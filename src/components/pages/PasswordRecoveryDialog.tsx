import { requestPasswordReset } from "@/api/passwordReset"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type PasswordRecoveryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onBackToLogin: () => void
}

export function PasswordRecoveryDialog({
  open,
  onOpenChange,
  email,
  onBackToLogin,
}: PasswordRecoveryDialogProps) {
  const [recoveryEmail, setRecoveryEmail] = useState(email)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const { t } = useTranslation()

  useEffect(() => {
    if (open) {
      setRecoveryEmail(email)
      setError("")
      setMessage("")
    }
  }, [email, open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      await requestPasswordReset(recoveryEmail, t("recoveryMessageError"))
      setMessage(t("recoveryMessageSent"))
    } catch (err) {
      setError(err instanceof Error ? err.message : t("recoveryMessageError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-32px)] flex-col justify-between overflow-y-auto bg-[#F0E8F0]
        px-5 py-8 md:max-w-[600px] md:rounded-[24px] md:px-[95px] md:py-9"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4 flex flex-col items-center gap-y-0 xl:mb-9">
            <img
              src="/Logo1.png"
              alt="Logo"
              className="mx-auto h-20 w-20 sm:w-30 xl:h-30.5 xl:w-46"
            />

            <DialogTitle
              className="my-1 text-center font-montserrat text-[24px]
              font-medium leading-[1.2] text-[#2D302D] xl:my-2 xl:text-[38px]"
            >
              {t("passwordRecoveryTitle")}
            </DialogTitle>
          </DialogHeader>

          <FieldGroup className="gap-y-2">
            <Field className="flex flex-col gap-y-2 xl:mb-6">
              <Label
                htmlFor="recovery-email"
                className="font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] xl:text-[16px]"
              >
                {t("emailFormTitle")}
              </Label>

              <Input
                className="mb-4 h-10 w-full rounded-[30px] border border-primary
                bg-[#F0E8F0] px-3 font-montserrat text-[14px] font-normal
                leading-5 text-[#1C100E] xl:mb-1.5 xl:h-12 xl:text-[16px]"
                id="recovery-email"
                name="recovery-email"
                type="email"
                placeholder={t("emailFormTitle")}
                autoComplete="email"
                required
                value={recoveryEmail}
                onChange={(e) => {
                  setRecoveryEmail(e.target.value)
                  setError("")
                  setMessage("")
                }}
              />
            </Field>
          </FieldGroup>

          {error && (
            <p className="mt-3 font-montserrat text-[12px] text-red-500 xl:text-sm">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-2 font-montserrat text-[12px] text-green-700 xl:text-sm">
              {message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full cursor-pointer rounded-[30px] border-2
            border-[#FEF85C] text-center font-montserrat text-[14px]
            leading-12 text-[#1C100E] shadow-btn xl:h-14 xl:text-[18px]"
            style={{
              background:
                "linear-gradient(180deg, #FFC401 0%, #FFC021 45%, #FEFA8B 100%)",
            }}
          >
            {isLoading ? t("buttonSubmit.sending") : t("sendRecoveryLink")}
          </Button>

          <p
            className="my-5 flex min-h-5.5 justify-between gap-4 font-montserrat
            text-[12px] font-normal leading-[22px] text-[#1C100E]
            xl:my-12 xl:text-[16px]"
          >
            <span>{t("rememberPassword")}</span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="cursor-pointer text-[#B03E8A]"
            >
              {t("headerTitle.login")}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
