import { confirmPasswordReset } from "@/api/passwordReset"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useSearchParams } from "react-router-dom"

export function PasswordResetConfirm() {
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  const uid = searchParams.get("uid") || ""
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!uid || !token) {
      setError(t("resetPasswordMissingToken"))
      return
    }

    if (password.length < 8) {
      setError(t("passwordMinLength"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("registerPasswordMismatch"))
      return
    }

    setIsLoading(true)

    try {
      await confirmPasswordReset(
        {
          uid,
          token,
          password,
          confirm_password: confirmPassword,
        },
        t("resetPasswordError")
      )
      setPassword("")
      setConfirmPassword("")
      setMessage(t("resetPasswordSuccess"))
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resetPasswordError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[600px] items-center px-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-[24px] bg-[#F0E8F0] px-5 py-8 shadow-md sm:px-[95px] sm:py-9"
      >
        <div className="mb-6 flex flex-col items-center">
          <img src="/Logo1.png" alt="Logo" className="h-20 w-20 sm:w-30" />
          <h1 className="mt-3 text-center font-montserrat text-[24px] font-medium leading-[1.2] text-[#2D302D] sm:text-[32px]">
            {t("resetPasswordTitle")}
          </h1>
        </div>

        <FieldGroup className="gap-y-4">
          <Field className="flex flex-col gap-y-2">
            <Label
              htmlFor="new-password"
              className="font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] sm:text-[16px]"
            >
              {t("newPassword")}
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                name="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="h-10 w-full rounded-[30px] border border-primary bg-[#F0E8F0] px-10 font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] sm:h-12 sm:text-[16px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 left-3 flex -translate-y-1/2 cursor-pointer text-[#1C100E]"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>

          <Field className="flex flex-col gap-y-2">
            <Label
              htmlFor="confirm-new-password"
              className="font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] sm:text-[16px]"
            >
              {t("repeatPassword")}
            </Label>
            <div className="relative">
              <Input
                id="confirm-new-password"
                name="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError("")
                }}
                className="h-10 w-full rounded-[30px] border border-primary bg-[#F0E8F0] px-10 font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] sm:h-12 sm:text-[16px]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute top-1/2 left-3 flex -translate-y-1/2 cursor-pointer text-[#1C100E]"
                aria-label={
                  showConfirmPassword ? t("hidePassword") : t("showPassword")
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>
        </FieldGroup>

        {error && (
          <p className="mt-3 font-montserrat text-[12px] text-red-500 sm:text-sm">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-3 font-montserrat text-[12px] text-green-700 sm:text-sm">
            {message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading || Boolean(message)}
          className="mt-5 h-12 w-full cursor-pointer rounded-[30px] border-2 border-[#FEF85C] text-center font-montserrat text-[14px] leading-12 text-[#1C100E] shadow-btn sm:h-14 sm:text-[18px]"
          style={{
            background:
              "linear-gradient(180deg, #FFC401 0%, #FFC021 45%, #FEFA8B 100%)",
          }}
        >
          {isLoading ? t("buttonSubmit.sending") : t("confirmResetPassword")}
        </Button>

        {message && (
          <Link
            to="/"
            className="mt-5 block text-center font-montserrat text-[14px] text-[#B03E8A] sm:text-[16px]"
          >
            {t("headerTitle.login")}
          </Link>
        )}
      </form>
    </section>
  )
}
