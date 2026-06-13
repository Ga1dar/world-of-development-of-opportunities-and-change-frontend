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
import { Check, Eye, EyeOff } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { PasswordRecoveryDialog } from "./PasswordRecoveryDialog"
import { endpoints } from "../../api/endpoints"
import {
  apiFetch,
  clearLocalSession,
  clearStoredCurrentUser,
  getAccessToken,
  logoutCurrentUser,
  notifyAuthChanged,
  storeCurrentUser,
} from "../../api/auth"

type LogInProps = {
  variant?: "header" | "footer" | "menu"
  text?: string
}

type LoginStep = "email" | "password"
type RegisterStep = "email" | "password" | "role" | "success"
type UserRole = "specialist" | "user"
type AuthErrorKey =
  | "passwordMinLength"
  | "passwordTooSimilar"
  | "passwordTooCommon"
  | "passwordNumericOnly"
  | "registerPasswordMismatch"

const PASSWORD_MIN_LENGTH = 8
const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en")
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "qwerty",
  "qwerty123",
  "12345678",
  "123456789",
  "1234567890",
  "11111111",
  "00000000",
  "admin123",
  "letmein",
  "iloveyou",
])

type GoogleWindow = Window &
  typeof globalThis & {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (options: {
            client_id: string
            scope: string
            callback: (response: {
              access_token?: string
              error?: string
              error_description?: string
            }) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }

export function LogIn({ variant = "header", text }: LogInProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [recoveryOpen, setRecoveryOpen] = useState(false)

  const [mode, setMode] = useState<"login" | "register">("login")
  const [loginStep, setLoginStep] = useState<LoginStep>("email")
  const [registerStep, setRegisterStep] = useState<RegisterStep>("email")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showRecoveryLink, setShowRecoveryLink] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(getAccessToken())
  )
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { t, i18n } = useTranslation()

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setPasswordConfirm("")
    setRole("")
    setError("")
    setLoginStep("email")
    setRegisterStep("email")
    setShowPassword(false)
    setShowPasswordConfirm(false)
    setShowRecoveryLink(false)
  }

  const storeTokens = (data: { access?: string; refresh?: string }) => {
    if (data.access) {
      localStorage.setItem("accessToken", data.access)
    } else if (data.refresh) {
      localStorage.removeItem("accessToken")
    }

    if (data.refresh) {
      localStorage.setItem("refreshToken", data.refresh)
    }

    if (data.access || data.refresh) {
      clearStoredCurrentUser()
      setIsAuthenticated(Boolean(data.access || getAccessToken()))
      notifyAuthChanged()
    }
  }

  useEffect(() => {
    const updateAuthState = () => {
      setIsAuthenticated(Boolean(getAccessToken()))
    }

    updateAuthState()
    window.addEventListener("auth-changed", updateAuthState)
    window.addEventListener("storage", updateAuthState)

    return () => {
      window.removeEventListener("auth-changed", updateAuthState)
      window.removeEventListener("storage", updateAuthState)
    }
  }, [])

  const getResponseError = (
    data: Record<string, string[] | string> | null,
    fallback: string
  ) => {
    const detail = data?.detail
    const emailError = data?.email
    const passwordError = data?.password
    const roleError = data?.role
    const nonFieldError = data?.non_field_errors

    const message =
      (typeof detail === "string" && detail) ||
      (Array.isArray(emailError) && emailError[0]) ||
      (Array.isArray(passwordError) && passwordError[0]) ||
      (Array.isArray(roleError) && roleError[0]) ||
      (Array.isArray(nonFieldError) && nonFieldError[0]) ||
      ""

    if (!message) {
      return fallback
    }

    const normalizedMessage = message.toLowerCase()

    if (
      normalizedMessage.includes("already") ||
      normalizedMessage.includes("exists") ||
      normalizedMessage.includes("unique")
    ) {
      return isEnglishLanguage(i18n.language)
        ? "A user with this email already exists."
        : "Користувач із таким email уже існує."
    }

    const errorKey = getAuthErrorKey(message)

    return errorKey ? t(errorKey) : fallback
  }

  const getAuthErrorKey = (message: string): AuthErrorKey | null => {
    const normalizedMessage = message.toLowerCase()

    if (
      normalizedMessage.includes("similar") ||
      normalizedMessage.includes("схож")
    ) {
      return "passwordTooSimilar"
    }

    if (
      normalizedMessage.includes("common") ||
      normalizedMessage.includes("прост") ||
      normalizedMessage.includes("пошир")
    ) {
      return "passwordTooCommon"
    }

    if (
      normalizedMessage.includes("numeric") ||
      normalizedMessage.includes("числов") ||
      normalizedMessage.includes("цифр")
    ) {
      return "passwordNumericOnly"
    }

    if (normalizedMessage.includes("8") || normalizedMessage.includes("short")) {
      return "passwordMinLength"
    }

    if (normalizedMessage.includes("match")) {
      return "registerPasswordMismatch"
    }

    return null
  }

  const getPasswordSimilarity = (firstValue: string, secondValue: string) => {
    if (!firstValue || !secondValue) {
      return 0
    }

    const rows = firstValue.length + 1
    const columns = secondValue.length + 1
    const distances = Array.from({ length: rows }, () =>
      Array<number>(columns).fill(0)
    )

    for (let row = 0; row < rows; row += 1) {
      distances[row][0] = row
    }

    for (let column = 0; column < columns; column += 1) {
      distances[0][column] = column
    }

    for (let row = 1; row < rows; row += 1) {
      for (let column = 1; column < columns; column += 1) {
        const cost = firstValue[row - 1] === secondValue[column - 1] ? 0 : 1

        distances[row][column] = Math.min(
          distances[row - 1][column] + 1,
          distances[row][column - 1] + 1,
          distances[row - 1][column - 1] + cost
        )
      }
    }

    return (
      1 -
      distances[firstValue.length][secondValue.length] /
        Math.max(firstValue.length, secondValue.length)
    )
  }

  const isPasswordTooSimilarToEmail = () => {
    const normalizedPassword = password.trim().toLowerCase()
    const emailLocalPart = email.split("@")[0]?.trim().toLowerCase() || ""

    if (normalizedPassword.length < 4 || emailLocalPart.length < 4) {
      return false
    }

    return (
      normalizedPassword.includes(emailLocalPart) ||
      emailLocalPart.includes(normalizedPassword) ||
      getPasswordSimilarity(normalizedPassword, emailLocalPart) >= 0.7
    )
  }

  const validateRegistrationPassword = () => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return t("passwordMinLength")
    }

    if (isPasswordTooSimilarToEmail()) {
      return t("passwordTooSimilar")
    }

    if (COMMON_PASSWORDS.has(password.trim().toLowerCase())) {
      return t("passwordTooCommon")
    }

    if (/^\d+$/.test(password)) {
      return t("passwordNumericOnly")
    }

    if (password !== passwordConfirm) {
      return t("registerPasswordMismatch")
    }

    return ""
  }

  const getRequestError = (err: unknown, fallback: string) => {
    if (err instanceof TypeError) {
      return t("authConnectionError")
    }

    return err instanceof Error ? err.message : fallback
  }

  const isPasswordServerError = (
    data: Record<string, string[] | string> | null
  ) => {
    const passwordError = data?.password
    const detail = data?.detail

    return (
      (Array.isArray(passwordError) && passwordError.length > 0) ||
      (typeof detail === "string" && getAuthErrorKey(detail) !== null)
    )
  }

  const getGoogleTokenError = (err: unknown) => {
    if (err instanceof TypeError) {
      return t("googleAuthConnectionError")
    }

    return err instanceof Error ? err.message : t("googleAuthFailed")
  }

  const registerUser = async (selectedRole: UserRole) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(endpoints.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirm_password: passwordConfirm,
          role: selectedRole,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (isPasswordServerError(data)) {
          setRegisterStep("password")
        }

        throw new Error(
          getResponseError(
            data,
            response.status === 400
              ? "Цей email вже може бути зареєстрований або дані заповнені некоректно."
              : t("modeError.registered")
          )
        )
      }

      storeTokens(data || {})

      if (!getAccessToken()) {
        const loginResponse = await fetch(endpoints.login, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        const loginData = await loginResponse.json().catch(() => null)

        if (!loginResponse.ok) {
          throw new Error(getResponseError(loginData, t("modeError.login")))
        }

        storeTokens(loginData || {})
      }

      if (!getAccessToken()) {
        throw new Error(t("modeError.login"))
      }

      const meResponse = await apiFetch(endpoints.me)
      if (!meResponse.ok) {
        throw new Error(t("modeError.login"))
      }

      storeCurrentUser(await meResponse.json())
      notifyAuthChanged()

      resetForm()
      setMode("login")
      setOpen(false)
      if (selectedRole === "specialist") {
        navigate("/specialist-onboarding")
      }
    } catch (err) {
      if (!getAccessToken()) {
        clearLocalSession()
        notifyAuthChanged()
      }
      setError(getRequestError(err, t("loginSetError")))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (mode === "register") {
      if (registerStep === "email") {
        setRegisterStep("password")
        return
      }

      if (registerStep === "password") {
        const passwordError = validateRegistrationPassword()

        if (passwordError) {
          setError(passwordError)
          return
        }

        setRegisterStep("role")
        return
      }

      return
    }

    if (loginStep === "email") {
      setLoginStep("password")
      setShowRecoveryLink(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(endpoints.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(getResponseError(data, t("modeError.login")))
      }

      storeTokens(data || {})

      try {
        const meResponse = await apiFetch(endpoints.me)

        if (meResponse.ok) {
          storeCurrentUser(await meResponse.json())
          notifyAuthChanged()
        }
      } catch {
        notifyAuthChanged()
      }

      resetForm()
      setOpen(false)
      setMode("login")
    } catch (err) {
      setShowRecoveryLink(true)
      setError(getRequestError(err, t("loginSetError")))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => {
    if (isAuthenticated) return

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

  const loadGoogleScript = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as GoogleWindow).google?.accounts?.oauth2) {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(t("googleAuthUnavailable")))
      document.head.appendChild(script)
    })

  const submitGoogleToken = async (
    accessToken: string,
    authMode: "login" | "register"
  ) => {
    const response = await fetch(endpoints.googleAuth, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    })

    if (!response.ok) {
      throw new Error(
        t(authMode === "login" ? "googleAuthFailed" : "googleRegistrationFailed")
      )
    }

    const data = await response.json().catch(() => null)

    storeTokens(data || {})

    if (!getAccessToken()) {
      throw new Error(t(authMode === "login" ? "googleAuthFailed" : "googleRegistrationFailed"))
    }

    let currentUser: unknown = null

    const meResponse = await apiFetch(endpoints.me)

    if (!meResponse.ok) {
      throw new Error(t(authMode === "login" ? "googleAuthFailed" : "googleRegistrationFailed"))
    }

    currentUser = await meResponse.json()
    storeCurrentUser(currentUser)
    notifyAuthChanged()

    if (authMode === "register") {
      setRegisterStep("success")
    } else {
      resetForm()
      setMode("login")
      setOpen(false)
    }
  }

  const handleGoogleAuth = async (authMode: "login" | "register") => {
    setError("")

    if (!GOOGLE_CLIENT_ID) {
      setError(t("googleClientMissing"))
      return
    }

    setIsLoading(true)

    try {
      await loadGoogleScript()

      const google = (window as GoogleWindow).google?.accounts?.oauth2

      if (!google) {
        throw new Error(t("googleAuthUnavailable"))
      }

      const tokenClient = google.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: async (response) => {
          if (response.error) {
            setIsLoading(false)
            setError(
              response.error === "access_denied"
                ? t("googleAuthCancelled")
                : t("googleAuthFailed")
            )
            return
          }

          if (!response.access_token) {
            setIsLoading(false)
            setError(t("googleAuthFailed"))
            return
          }

          try {
            setIsLoading(true)
            await submitGoogleToken(response.access_token, authMode)
          } catch (err) {
            setError(getGoogleTokenError(err))
          } finally {
            setIsLoading(false)
          }
        },
      })

      tokenClient.requestAccessToken()
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : t("loginSetError"))
    }
  }

  const handleGoogleRegistration = () => handleGoogleAuth("register")

  const handleGoogleLogin = () => handleGoogleAuth("login")

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    void registerUser(selectedRole)
  }

  const handleRecoverPassword = () => {
    setOpen(false)
    setRecoveryOpen(true)
  }

  const handleSuccessLogin = () => {
    resetForm()
    setMode("login")
    setOpen(false)
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logoutCurrentUser()
      navigate("/")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const buttonText =
    text ||
    (isAuthenticated
      ? i18n.language.toLowerCase().startsWith("en")
        ? "Profile"
        : "Профіль"
      : variant === "footer"
      ? t("buttonText.footer")
      : variant === "menu"
        ? t("buttonText.header")
        : t("buttonText.header"))

  const triggerClassName =
    variant === "footer"
      ? "footerGrig order-[6] cursor-pointer justify-start rounded-none p-0 text-left"
      : variant === "menu"
        ? "mx-auto h-[57px] w-full max-w-[358px] rounded-[30px] bg-[#FFFFFF] px-2 py-4 font-montserrat text-[18px] font-[500] text-black sm:h-8 sm:w-full sm:px-2 sm:py-0 sm:text-[11px]"
        : `my-auto h-[57px] rounded-[30px] bg-[#FFFFFF] px-3 font-montserrat font-[500] text-black sm:w-auto min-[1420px]:z-51 min-[1420px]:h-14.25 min-[1420px]:text-[18px] ${
            isAuthenticated
              ? "w-24 text-[15px] min-[1420px]:!w-24"
              : "w-[57px] text-[18px] sm:w-18.25 min-[1420px]:!w-14.25"
          }`

  const modalTitle =
    mode === "login"
      ? t("headerTitle.login")
      : registerStep === "password"
        ? t("registerPasswordTitle")
        : registerStep === "role"
          ? t("registerRoleTitle")
          : t("headerTitle.registered")

  const primaryButtonLabel =
    isLoading
      ? t("buttonSubmit.sending")
      : mode === "login" || registerStep !== "password"
        ? t("buttonSubmit.further")
        : t("registerSavePassword")

  if (isAuthenticated) {
    if (variant === "header") {
      return (
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className={`inline-flex cursor-pointer items-center justify-center ${triggerClassName} disabled:cursor-wait disabled:opacity-70`}
        >
          {isEnglishLanguage(i18n.language) ? "Logout" : "Вихід"}
        </button>
      )
    }

    return (
      <Link to="/profile" className={`inline-flex items-center justify-center ${triggerClassName}`}>
        {buttonText}
      </Link>
    )
  }

  return (
    <>
      <Dialog
        open={isAuthenticated ? false : open}
        onOpenChange={(nextOpen) => {
          if (!isAuthenticated) setOpen(nextOpen)
        }}
      >
        <DialogTrigger asChild>
          <Button className={triggerClassName} onClick={handleOpen}>
            {buttonText}
          </Button>
        </DialogTrigger>

        <DialogContent
          className="top-1/2 flex max-h-[calc(100vh-32px)] flex-col 
          overflow-y-auto bg-[#F0E8F0] px-5 py-8 md:max-w-150 
          md:rounded-3xl md:px-23.75 md:py-9"
        >
          {mode === "register" && registerStep === "success" ? (
            <div className="flex flex-col items-center">
              <img
                src="/Logo1.png"
                alt="Logo"
                className="mx-auto h-20 w-20 sm:h-30 sm:w-30 xl:h-46 xl:w-46"
              />

              <Check className="mt-2 h-16 w-16 stroke-[#4C3156] stroke-[1.75]" />

              <DialogTitle
                className="mt-3 max-w-102.5 text-center font-montserrat
                 text-[24px] font-medium leading-[1.2] text-[#2D302D]
                 xl:text-[32px]">
                {t("registerSuccessTitle")}
              </DialogTitle>

              <Button
                type="button"
                onClick={handleSuccessLogin}
                className="mt-5 h-12 w-full cursor-pointer rounded-[30px] 
                border-2 border-[#FEF85C] text-center font-montserrat text-[14px]
                 leading-12 text-[#1C100E] shadow-btn xl:h-14 xl:text-[18px]"
                style={{
                  background:
                    "linear-gradient(180deg, #FFC401 0%, #FFC021 45%, #FEFA8B 100%)",
                }}
              >
                {t("headerTitle.login")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <DialogHeader className="mb-4 flex flex-col items-center gap-y-0 xl:mb-7">
                <img
                  src="/Logo1.png"
                  alt="Logo"
                  className="mx-auto h-20 w-20 sm:h-30 sm:w-30 xl:h-46 xl:w-46"
                />

                  <DialogTitle
                    className="my-1 text-center font-montserrat text-[24px] 
                    font-medium leading-[1.2] text-[#2D302D] xl:my-2 xl:text-[32px]">
                  {modalTitle}
                </DialogTitle>

                {mode === "register" && registerStep === "password" && (
                    <p
                      className="mt-3 w-full font-montserrat text-[12px] 
                      leading-[1.35] text-[#6C6370] xl:text-[14px]">
                    {t("registerPasswordHint")}
                  </p>
                )}

                {mode === "register" && registerStep === "email" && (
                  <div className="mt-4 flex w-full flex-col gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                        className="h-10 w-full items-center rounded-[30px] bg-[#1C100E] 
                        px-5 text-center font-montserrat text-[12px] leading-10 
                        text-[#F3F2F3] xl:h-12 xl:text-[14px]"
                      onClick={handleGoogleRegistration}
                    >
                      <img src="/google.png" alt="Google" className="h-4 w-4" />
                      {t("buttonGoogleRegister")}
                    </Button>

                    <div className="text-center font-montserrat text-[12px] leading-5 text-[#1C100E] xl:text-[14px]">
                      {t("or")}
                    </div>
                  </div>
                )}

                {mode === "login" && loginStep === "email" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 h-10 w-full items-center 
                      rounded-[30px] bg-[#1C100E] px-5 text-center 
                      font-montserrat text-[12px] leading-10 text-[#F3F2F3] 
                      xl:h-12 xl:text-[14px]"
                    onClick={handleGoogleLogin}
                  >
                    <img src="/google.png" alt="Google" className="h-4 w-4" />
                    {t("buttonGoogle")}
                  </Button>
                )}
              </DialogHeader>

              <FieldGroup className="gap-y-2">
                {(mode === "register" && registerStep === "email") ||
                (mode === "login" && loginStep === "email") ? (
                  <>
                    {mode === "login" && (
                      <div className="text-center font-montserrat text-[12px] leading-5 text-[#1C100E] xl:text-[14px]">
                        {t("or")}
                      </div>
                    )}

                    <Field className="flex flex-col gap-y-2">
                      <Label
                        htmlFor="email"
                        className="font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] xl:text-[16px]"
                      >
                        {t("emailFormTitle")}
                      </Label>

                      <Input
                          className="h-10 w-full rounded-[30px] border border-primary
                           bg-[#F0E8F0] px-3 font-montserrat 
                          text-[14px] font-normal leading-5 text-[#1C100E] xl:h-12 xl:text-[16px]"
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
                  </>
                ) : null}

                {(mode === "login" && loginStep === "password") ||
                (mode === "register" && registerStep === "password") ? (
                  <Field className="flex flex-col gap-y-2">
                    <Label
                      htmlFor="password"
                      className="font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] xl:text-[16px]"
                    >
                      {t("password")}
                    </Label>

                    <div className="relative">
                      <Input
                        className="h-10 w-full rounded-[30px] border
                        border-primary
                        bg-[#F0E8F0] px-10 font-montserrat text-[14px] 
                        font-normal leading-5 text-[#1C100E] 
                        xl:h-12 xl:text-[16px]"
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("password")}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError("")
                          setShowRecoveryLink(false)
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute top-1/2 left-3 flex -translate-y-1/2 cursor-pointer text-[#1C100E]"
                        aria-label={
                          showPassword ? t("hidePassword") : t("showPassword")
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {mode === "register" && (
                      <>
                        <Label
                          htmlFor="passwordConfirm"
                          className="mt-2 font-montserrat text-[14px] font-normal leading-5 text-[#1C100E] xl:text-[16px]"
                        >
                          {t("repeatPassword")}
                        </Label>

                        <div className="relative">
                          <Input
                            className="h-10 w-full rounded-[30px] 
                            border border-primary bg-[#F0E8F0] px-10 
                            font-montserrat text-[14px] font-normal 
                            leading-5 text-[#1C100E] xl:h-12 xl:text-[16px]"
                            id="passwordConfirm"
                            name="passwordConfirm"
                            type={showPasswordConfirm ? "text" : "password"}
                            placeholder={t("repeatPassword")}
                            required
                            value={passwordConfirm}
                            onChange={(e) => {
                              setPasswordConfirm(e.target.value)
                              setError("")
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordConfirm((value) => !value)
                            }
                            className="absolute top-1/2 left-3 flex -translate-y-1/2 cursor-pointer text-[#1C100E]"
                            aria-label={
                              showPasswordConfirm
                                ? t("hidePassword")
                                : t("showPassword")
                            }
                          >
                            {showPasswordConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </Field>
                ) : null}
              </FieldGroup>

              {mode === "register" && registerStep === "role" && (
                <div className="mt-5 flex flex-col gap-4">
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRoleSelect("specialist")}
                    className="h-12 w-full rounded-[30px] bg-[#1C100E] font-montserrat text-[14px] text-[#F3F2F3] hover:bg-[#1C100E]/90"
                    aria-pressed={role === "specialist"}
                  >
                    {isLoading && role === "specialist"
                      ? t("buttonSubmit.sending")
                      : t("roleSpecialist")}
                  </Button>

                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRoleSelect("user")}
                    className="h-12 w-full rounded-[30px] bg-[#1C100E] font-montserrat text-[14px] text-[#F3F2F3] hover:bg-[#1C100E]/90"
                    aria-pressed={role === "user"}
                  >
                    {isLoading && role === "user"
                      ? t("buttonSubmit.sending")
                      : t("roleUser")}
                  </Button>
                </div>
              )}

              {error && (
                <p className="mt-3 font-montserrat text-[12px] text-red-500 xl:text-sm">
                  {error}
                </p>
              )}

              {mode === "login" &&
                loginStep === "password" &&
                !showRecoveryLink && (
                  <button
                    type="button"
                    onClick={() => {
                      setPassword("")
                      setError("")
                      setShowRecoveryLink(false)
                      setLoginStep("email")
                    }}
                    className="mt-3 mb-4 cursor-pointer font-montserrat text-[14px] text-[#B03E8A] xl:text-[16px]"
                  >
                    {t("backToEmail")}
                  </button>
                )}

              {!(mode === "register" && registerStep === "role") && (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 h-12 w-full cursor-pointer 
                  rounded-[30px] border-2 border-[#FEF85C] 
                  text-center font-montserrat text-[14px]
                  leading-12 text-[#1C100E] shadow-btn
                  xl:h-14 xl:text-[18px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFC401 0%, #FFC021 45%, #FEFA8B 100%)",
                  }}
                >
                  {primaryButtonLabel}
                </Button>
              )}

              {mode === "login" ? (
                  <div
                    className="mt-7 flex min-h-5.5 justify-between gap-4 font-montserrat
                    text-[12px] font-normal leading-5.5
                  text-[#1C100E] xl:mt-10 xl:text-[16px]">
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
                      <span>{t("dialogTextNoneProf")}</span>
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
                registerStep !== "role" && (
                  <p
                    className="mt-7 flex min-h-5.5 justify-between gap-4 
                    font-montserrat text-[12px] font-normal
                    leading-5.5 text-[#1C100E] xl:mt-10 xl:text-[16px]"
                  >
                    <span>{t("dialogTextProf")}</span>
                    <button
                      type="button"
                      onClick={() => handleChangeMode("login")}
                      className="cursor-pointer text-[#B03E8A]"
                    >
                      {t("headerTitle.login")}
                    </button>
                  </p>
                )
              )}
            </form>
          )}
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
