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
import "./LogIn.css"
import { useState } from "react"
import { useTranslation } from "react-i18next"

type LogInProps = {
  variant?: "header" | "footer";
  text?: string;
};

export function LogIn({ variant = "header", text }: LogInProps) {
  // #region Hooks and states
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  // #endregion
  
  // #region Handlers (раздуплться с 
  // сервером поменять на переменные окружения разобраться с гугл/эпл авторизацией)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault()
    setIsLoading(true);
    setError("");

    
    const url =
      mode === 'login'
        ? `${API_URL}/auth/login`
        : `${API_URL}/auth/register`;
    const payload = mode === 'login'
      ? { email }
      : { email, name, password };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(
          mode === 'login'
          ? t("modeError.login") 
          : t("modeError.registered")
        )
      }

      const data = await response.json();
      console.log('Gut', data); // удалить потом

      setEmail("");
      setOpen(false);
      setMode("login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("loginSetError"));
      }
    } finally {
      setIsLoading(false);
    }
  }
   
  const handleOpen = () => {
  if (variant === "footer") {
    setMode("register");
  } else {
    setMode("login");
  }
  };
  
  const buttonText =
    text || (variant === "footer" ? t("buttonText.footer") : t("buttonText.header"));
  const triggerClassName =
    variant === 'footer'
      ? "footerGrig order-[6] cursor-pointer justify-start text-left p-0 rounded-none"
      : "enter sm:w-18.25 text-black";
  
  const fakeSocialAuth = async (provider: "google" | "apple") => {
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
  const handleAppleLogin = () => fakeSocialAuth("apple")
  // #endregion
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName} onClick={handleOpen}>
          {buttonText}
        </Button>
      </DialogTrigger>
        <DialogContent className="form">
          <form  onSubmit={handleSubmit}>
          <DialogHeader className="dialogHeader">
            <img src="/Logo1.png" alt="Logo" className="headerImg" />
            <DialogTitle className="headerTitle">
              {mode === "login" ? t("headerTitle.login") : t("headerTitle.registered")}
            </DialogTitle>
            {mode === "login" && (
              <>
            <Button 
              type="button" 
              variant="outline" 
              className="closeBtn" 
              onClick={handleAppleLogin}
            >
              <img src="/apple.png" alt="Apple" className="closeBtnIcon" />
             {t("buttonApple")}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="closeBtn" 
              onClick={handleGoogleLogin}>
              <img src="/google.png" alt="Google" className="closeBtnIcon" />
              {t("buttonGoogle")}
                </Button>
              </>
            )}            
          </DialogHeader>

          <FieldGroup>
            {mode === "register" && (
              <Field className="emailForm">
                <Label htmlFor="name" className="emailFormTitle">
                  {t("emailFormTitleName")}
                </Label>
                <Input
                  className="emailInput"
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
            {mode === "login" && (
              <div className="welcomeText">або</div>
            )}
            <Field className="emailForm">
              <Label htmlFor="email" className="emailFormTitle">{t("emailFormTitle")}</Label>
              <Input
                className="emailInput"  
                id="email" 
                name="email" 
                type="email" 
                placeholder={t("emailFormTitle")} 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}               
              />
            </Field>
            {mode === "register" && (
              <Field className="emailForm">
                <Label
                  htmlFor="password"
                  className="emailFormTitle"
                >
                  {t("password")}
                </Label>
                <Input
                  className="emailInput"
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("password")}
                  pattern="^(?=.*[A-Z])(?=.*[\W_]).{6,}$"
                   title={t("titlePassword")}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-0">
                    {t("titlePassword")}
                </p>
              </Field>
            )}
          </FieldGroup>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          
          <div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="buttonSubmit">
              {isLoading
                ? t("buttonSubmit.sending")
                : mode === "login"
                ? t("buttonSubmit.further")
                : t("buttonSubmit.registered")
              }
            </Button>
            {mode === "login" ? (
              <div className="dialogText">
                {t("dialogTextNoneProf")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-[#B03E8A] cursor-pointer"
                >
                  {t("headerTitle.registered")}
                </button>
              </div>
            ) : (
              <p className="dialogText">
                {t("dialogTextProf")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#B03E8A] cursor-pointer"
                >
                  {t("headerTitle.login")}
                </button>
              </p>
            )}
          </div>
          </form>
        </DialogContent>
    </Dialog>
  )
}
