import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PasswordRecoveryDialog } from "./PasswordRecoveryDialog"

type LogInProps = {
  variant?: "header" | "footer" | "menu"
  text?: string
}

type LoginStep = "email" | "password"

export function LogIn({ variant = "header", text }: LogInProps) {
  const [open, setOpen] = useState(false)
  const [recoveryOpen, setRecoveryOpen] = useState(false)

  const [mode, setMode] = useState<"login" | "register">("login")
  const [loginStep, setLoginStep] = useState<LoginStep>("email")

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showRecoveryLink, setShowRecoveryLink] = useState(false)

  const { t } = useTranslation()

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

  const resetForm = () => {
    setEmail("")
    setName("")
    setPassword("")
    setError("")
    setLoginStep("email")
    setShowRecoveryLink(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (mode === "login" && loginStep === "email") {
      setLoginStep("password")
      setShowRecoveryLink(false)
      return
    }

    setIsLoading(true)

    const url =
      mode === "login"
        ? `${API_URL}/users/login/`
        : `${API_URL}/users/register/`

    const payload =
      mode === "login"
        ? { email, password }
        : { email, name, password }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
        data?.detail ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        (mode === "login"
          ? t("modeError.login")
          : t("modeError.registered"))
        )
      }

      if (mode === "login") {
        localStorage.setItem("accessToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)
      }

      console.log("Success", data)

      resetForm()
      setOpen(false)
      setMode("login")
    } catch (err) {
      if (mode === "login" && loginStep === "password") {
        setShowRecoveryLink(true)
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(t("loginSetError"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => {
    resetForm()

    if (variant === "footer") {
      setMode("register")
    } else {
      setMode("login")
    }
  }

  const handleChangeMode = (newMode: "login" | "register") => {
    resetForm()
    setMode(newMode)
  }

  const fakeSocialAuth = async (provider: "google") => {
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(`${provider} auth success`)
      setOpen(false)
    } catch {
      setError("Помилка авторизації")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => fakeSocialAuth("google")

  const handleRecoverPassword = () => {
    setOpen(false)
    setRecoveryOpen(true)
  }

  const buttonText =
    text ||
    (variant === "footer"
      ? t("buttonText.footer")
      : variant === "menu"
        ? t("buttonText.header")
        : t("buttonText.header"))

  const triggerClassName =
    variant === "footer"
      ? "footerGrig order-[6] cursor-pointer justify-start rounded-none p-0 text-left"
      : variant === "menu"
        ? "mx-auto h-[60px] w-[360px] bg-[#FFFFFF] font-montserrat font-[500] text-[18px] text-black rounded-[30px] py-4 px-2 min-[744px]:h-8 min-[744px]:w-full min-[744px]:px-2 min-[744px]:py-0 min-[744px]:text-[11px]"
        : "h-[57px] w-[57px] bg-[#FFFFFF] font-montserrat font-[500] text-[18px] text-black my-auto rounded-[30px] sm:w-18.25 xl:z-51 xl:mt-16 xl:z-51"

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className={triggerClassName} onClick={handleOpen}>
            {buttonText}
          </Button>
        </DialogTrigger>

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
                {mode === "login"
                  ? t("headerTitle.login")
                  : t("headerTitle.registered")}
              </DialogTitle>

              {mode === "login" && loginStep === "email" && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10  xl:h-14 w-full text-[16px] items-center rounded-[30px] bg-[#1C100E] 
                  px-13.5 text-center font-[Montserrat] xl:text-[18px] 
                  leading-14 text-[#F3F2F3]"
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="/google.png"
                    alt="Google"
                    className="mr-auto xl:h-5 w-4.25"
                  />
                  {t("buttonGoogle")}
                </Button>
              )}
            </DialogHeader>

            <FieldGroup className="gap-y-2">
              {mode === "register" && (
                <Field className="flex flex-col gap-y-2">
                  <Label
                    htmlFor="name"
                    className="h-4 xl:h-5.5 font-montserrat text-[14px] xl:text-[16px] xl:mb-6 font-normal leading-5.5 text-[#1C100E]"
                  >
                    {t("emailFormTitleName")}
                  </Label>

                  <Input
                    className="h-10 xl:h-12 w-full rounded-[30px] border border-primary bg-[#F0E8F0] 
                    px-3 font-montserrat text-[14px] xl:text-[16px] font-normal leading-5.5 text-[#1C100E]"
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t("emailFormTitleName")}
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              )}

              {mode === "login" && loginStep === "email" && (
                <div
                  className=" h-3 xl:h-5.5 text-center font-montserrat 
                  text-[12px] xl:text-[16px] font-normal leading-5.5 text-[#1C100E]"
                >
                  {t("or")}
                </div>
              )}

              {(mode === "register" ||
                (mode === "login" && loginStep === "email")) && (
                <Field className="xl:mb-6 flex flex-col gap-y-2">
                  <Label
                    htmlFor="email"
                    className=" font-montserrat h-4 xl:h-5.5 xl:text-[16px] font-normal leading-5.5 text-[#1C100E]"
                  >
                    {t("emailFormTitle")}
                  </Label>

                  <Input
                    className="h-10 mb-4 xl:mb-[6] xl:h-12 w-full rounded-[30px] 
                      border border-primary
                    bg-[#F0E8F0] px-3 font-montserrat
                    text-[14px] xl:text-[16px] font-normal leading-5.5 text-[#1C100E]"
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("emailFormTitle")}
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                      setShowRecoveryLink(false)
                    }}
                  />
                </Field>
              )}

              {(mode === "register" ||
                (mode === "login" && loginStep === "password")) && (
                <Field className=" mb-4 xl:mb-6 flex flex-col gap-y-2">
                  <Label
                    htmlFor="password"
                    className=" h-4 xl:h-5.5 font-montserrat text-[14px] xl:text-[16px] font-normal leading-5.5 text-[#1C100E]"
                  >
                    {t("password")}
                  </Label>

                  <Input
                    className="h-10 xl:h-12 w-full rounded-[30px] 
                      border border-primary bg-[#F0E8F0]
                      px-3 font-montserrat text-[14px] xl:text-[16px] 
                      font-normal leading-5.5 text-[#1C100E]"
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t("password")}
                    required
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                      setShowRecoveryLink(false)
                    }}
                  />

                  {mode === "register" && (
                    <p className="mt-0 text-[8px] xl:text-sm text-gray-500">
                      {t("titlePassword")}
                    </p>
                  )}
                </Field>
              )}
            </FieldGroup>

            {error && (
              <p className="mt-2 text-[8px] xl:text-sm text-red-500">
                {error}
              </p>
            )}

            {mode === "login" && loginStep === "password" && !showRecoveryLink && (
              <button
                type="button"
                onClick={() => {
                  setPassword("")
                  setError("")
                  setShowRecoveryLink(false)
                  setLoginStep("email")
                }}
                className="mb-4 cursor-pointer font-montserrat text-[16px] text-[#B03E8A]"
              >
                {t("backToEmail")}
              </button>
            )}

            <div>
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
                {isLoading
                  ? t("buttonSubmit.sending")
                  : mode === "login"
                    ? t("buttonSubmit.further")
                    : t("buttonSubmit.registered")}
              </Button>

              {mode === "login" ? (
                <div className="my-[50px] flex h-[22px] justify-between font-[Montserrat] text-[16px] font-[400] leading-[22px] text-[#1C100E]">
                  {showRecoveryLink && loginStep === "password" ? (
                    <>
                      <span>{t("forgotPassword")}</span>

                      <button
                        type="button"
                        onClick={handleRecoverPassword}
                        className="cursor-pointer text-[#B03E8A]"
                      >
                        {t("recoverPassword")}
                      </button>
                    </>
                  ) : (
                    <>
                      {t("dialogTextNoneProf")}{" "}
                      <button
                        type="button"
                        onClick={() => handleChangeMode("register")}
                        className="cursor-pointer text-[#B03E8A]"
                      >
                        {t("headerTitle.registered")}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <p
                  className=" my-5 xl:my-12.5 flex h-5.5 justify-between 
                    font-montserrat text-[12px] xl:text-[16px] font-normal leading-5.5
                    text-[#1C100E]"
                >
                  {t("dialogTextProf")}{" "}
                  <button
                    type="button"
                    onClick={() => handleChangeMode("login")}
                    className="cursor-pointer text-[#B03E8A]"
                  >
                    {t("headerTitle.login")}
                  </button>
                </p>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PasswordRecoveryDialog
        open={recoveryOpen}
        onOpenChange={setRecoveryOpen}
        email={email}
        onBackToLogin={() => {
          setRecoveryOpen(false)
          setOpen(true)
          setMode("login")
          setLoginStep("email")
          setError("")
          setShowRecoveryLink(false)
        }}
      />
    </>
  )
}