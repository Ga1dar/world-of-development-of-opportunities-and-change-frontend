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
import { useState } from "react"
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      console.log("Password recovery email:", recoveryEmail)

      // В README пока нет endpoint для восстановления пароля.
      // Когда бекенд даст endpoint, сюда добавишь fetch.
      // Например:
      //
      // await fetch(`${API_URL}/users/password-reset/`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ email: recoveryEmail }),
      // })

      setMessage(t("recoveryMessageSent"))
    } catch {
      setError(t("recoveryMessageError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col justify-between bg-[#F0E8F0]   
        md:max-w-150 md:rounded-[30px] md:px-23.75 md:py-9"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4 xl:mb-9 flex flex-col items-center gap-y-0">
            <img
              src="/Logo1.png"
              alt="Logo"
              className="mx-auto h-20 w-20 xl:h-30.5 xl:w-46 sm:w-30"
            />

            <DialogTitle
              className="font-montserrat text-[24px] my-1 xl:my-2 xl:h-13.75 text-center 
              xl:text-[38px] font-medium
              leading-13.75 text-[#2D302D]"
            >
              {t("passwordRecoveryTitle")}
            </DialogTitle>
          </DialogHeader>

          <FieldGroup className="gap-y-2">
            <Field className="xl:mb-6 flex flex-col gap-y-[8px]">
              <Label
                htmlFor="recovery-email"
                className=" font-montserrat h-4 xl:h-5.5 xl:text-[16px] font-normal leading-5.5 text-[#1C100E]"
              >
                {t("emailFormTitle")}
              </Label>

              <Input
                className="h-10 mb-4 xl:mb-[6] xl:h-12 w-full rounded-[30px] 
                  border border-primary
                bg-[#F0E8F0] px-3 font-montserrat
                text-[14px] xl:text-[16px] font-normal leading-5.5 text-[#1C100E]"
                id="recovery-email"
                name="recovery-email"
                type="email"
                placeholder={t("emailFormTitle")}
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
            <p className="mt-2 text-[8px] xl:text-sm text-red-500">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-2 text-[8px] xl:text-sm text-green-700">
              {message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 xl:h-14.25 w-full cursor-pointer rounded-[30px] 
            border-2 border-[#FEF85C] text-center font-montserrat 
            text-[14px] xl:text-[18px] leading-14.25 text-[#1C100E] 
            shadow-btn"
            style={{
              background:
                "linear-gradient(180deg, #FFC401 0%, #FFC021 45%, #FEFA8B 100%)",
            }}
          >
            {isLoading ? t("buttonSubmit.sending") : t("sendRecoveryLink")}
          </Button>

          <p
            className="my-5 xl:my-12.5 flex h-5.5 justify-between 
            font-montserrat text-[12px] xl:text-[16px] font-normal leading-5.5
            text-[#1C100E]"
          >
            {t("rememberPassword")}{" "}
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