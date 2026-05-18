import { Bookmark, Camera, Heart, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "./LogIn";
import {
  getUserCabinetData,
  type CabinetAppointment,
  type CabinetProfile,
} from "../../api/userCabinet";
import { getFavoriteEvents, type EventItem } from "../../api/events";
import { logoutCurrentUser } from "../../api/auth";

type CabinetTab = "appointments" | "favorites" | "about";

const copy = {
  ua: {
    title: "Особистий кабінет",
    loginRequired: "Увійдіть, щоб переглянути особистий кабінет.",
    login: "Увійти",
    loading: "Завантажуємо кабінет...",
    loadError: "Не вдалося завантажити дані кабінету. Перевірте сервер і спробуйте ще раз.",
    fallbackName: "Користувач",
    roleUser: "Користувач",
    roleSpecialist: "Спеціаліст",
    roleAdmin: "Адміністратор",
    workSchedule: "Графік роботи:",
    edit: "Редагувати",
    about: "Про мене",
    myAppointments: "Мої записи",
    favorites: "Обране",
    logout: "Вихід",
    logoutConfirmTitle: "Ви впевнені,\nщо хочете вийти?",
    logoutError: "Не вдалося завершити сеанс на сервері, але локально ви вже вийшли.",
    cancelNote: "Скасовуйте запис щонайменше за 3 години — цінуймо час один одного.",
    consultation: "Запис на консультацію",
    toSpecialist: "До психолога",
    date: "Дата",
    time: "Час",
    cancelOrReschedule: "Відмінити або перенести",
    cancelModalTitle: "Відмінити або перенести запис можна, написавши спеціалісту особисто",
    cancelModalNote: "Скасовуйте запис щонайменше за 3 години — цінуймо час один одного.",
    close: "Закрити",
    repeat: "Повторити",
    review: "Відгук",
    completed: "Відбувся",
    empty: "Тут з'являться ваші записи на консультації.",
    emptyFavorites: "Обрані матеріали та події з'являться тут.",
  },
  en: {
    title: "Personal account",
    loginRequired: "Log in to view your personal account.",
    login: "Login",
    loading: "Loading your account...",
    loadError: "Could not load account data. Check the server and try again.",
    fallbackName: "User",
    roleUser: "User",
    roleSpecialist: "Specialist",
    roleAdmin: "Administrator",
    workSchedule: "Working hours:",
    edit: "Edit",
    about: "About me",
    myAppointments: "My bookings",
    favorites: "Favorites",
    logout: "Logout",
    logoutConfirmTitle: "Are you sure\nyou want to log out?",
    logoutError: "Could not finish the server session, but you have been logged out locally.",
    cancelNote: "Cancel your booking at least 3 hours ahead — let us value each other's time.",
    consultation: "Consultation booking",
    toSpecialist: "To psychologist",
    date: "Date",
    time: "Time",
    cancelOrReschedule: "Cancel or reschedule",
    cancelModalTitle: "You can cancel or reschedule a booking by messaging the specialist directly",
    cancelModalNote: "Cancel your booking at least 3 hours ahead — let us value each other's time.",
    close: "Close",
    repeat: "Repeat",
    review: "Review",
    completed: "Completed",
    empty: "Your consultation bookings will appear here.",
    emptyFavorites: "Favorite materials and events will appear here.",
  },
};

const pageMaxWidth = "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1420px]:max-w-[1440px] min-[1420px]:px-0 min-[1900px]:max-w-[1980px]";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn";

const whiteButton =
  "rounded-[30px] bg-white font-montserrat font-medium text-[#1C100E]";

const darkButton =
  "rounded-[30px] bg-[#1C100E] font-montserrat font-medium text-white";

const normalizeDate = (value: string) => {
  if (!value) return "";
  if (value.includes(".")) return value.endsWith("р") ? value : `${value}р`;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return `${parsed.toLocaleDateString("uk-UA")}р`;
};

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

function roleLabel(role: string, labels: typeof copy.ua) {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes("specialist")) return labels.roleSpecialist;
  if (normalizedRole.includes("admin") || normalizedRole.includes("staff")) return labels.roleAdmin;

  return labels.roleUser;
}

function ProfileCard({
  profile,
  labels,
  activeTab,
  onAbout,
}: {
  profile: CabinetProfile;
  labels: typeof copy.ua;
  activeTab: CabinetTab;
  onAbout: () => void;
}) {
  const displayName = profile.fullName || labels.fallbackName;

  return (
    <section
      className="mx-auto flex w-full flex-col items-center rounded-[22px] bg-[#F8F8F8] px-3 py-5
      min-[744px]:max-w-[684px] min-[744px]:flex-row min-[744px]:justify-between min-[744px]:px-8 min-[744px]:py-7
      min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]"
    >
      <div className="flex w-full flex-col items-center gap-4 min-[744px]:flex-row min-[744px]:gap-8">
        <div className="relative h-[132px] w-[132px] shrink-0 min-[744px]:h-[126px] min-[744px]:w-[126px]">
          <img
            src={profile.avatar}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
          />
          <span className="absolute right-1 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#E8DCE8]">
            <Camera className="h-4 w-4 text-[#1C100E]" />
          </span>
        </div>

        <div className="w-full text-left font-montserrat text-[#1C100E]">
          <h1 className="text-[18px] font-medium leading-[1.2] min-[1023px]:text-[20px]">
            {displayName}
          </h1>
          <p className="mt-2 text-[13px] leading-[1.25] text-[#1C100E]/70">
            {profile.email}
          </p>
          <p className="mt-3 text-[14px] leading-[1.25]">
            {roleLabel(profile.role, labels)}
          </p>
          {profile.workHours ? (
            <p className="mt-3 text-[14px] font-medium leading-[1.25]">
              {labels.workSchedule} {profile.workHours}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col gap-3 min-[744px]:mt-0 min-[744px]:w-[196px]">
        <button type="button" className={`${yellowButton} h-11 text-[14px]`}>
          {labels.edit}
        </button>
        <button
          type="button"
          onClick={onAbout}
          className={`${whiteButton} h-11 text-[14px] ${activeTab === "about" ? "ring-1 ring-[#B34D8D]" : ""}`}
        >
          {labels.about}
        </button>
      </div>
    </section>
  );
}

function CabinetTabs({
  labels,
  activeTab,
  onTabChange,
  onLogout,
}: {
  labels: typeof copy.ua;
  activeTab: CabinetTab;
  onTabChange: (tab: CabinetTab) => void;
  onLogout: () => void;
}) {
  const tabClass = (tab: CabinetTab) =>
    `h-12 rounded-[30px] px-5 font-montserrat text-[13px] font-medium transition-colors
    min-[744px]:h-11 min-[744px]:text-[14px]
    ${
      activeTab === tab
        ? "border border-[#B34D8D] bg-[#E7C5DA] text-[#83105F]"
        : "bg-transparent text-[#1C100E] underline decoration-[#9E9E9E] underline-offset-[14px]"
    }`;

  return (
    <section
      className="mx-auto mt-8 flex w-full flex-col gap-3 rounded-[22px] bg-[#F8F8F8] p-3
      min-[744px]:max-w-[684px] min-[744px]:grid min-[744px]:grid-cols-3 min-[744px]:gap-5
      min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]"
    >
      <button type="button" onClick={() => onTabChange("appointments")} className={tabClass("appointments")}>
        {labels.myAppointments}
      </button>
      <button type="button" onClick={() => onTabChange("favorites")} className={tabClass("favorites")}>
        {labels.favorites}
      </button>
      <button
        type="button"
        onClick={onLogout}
        className={`${darkButton} h-12 text-[13px] min-[744px]:h-11 min-[744px]:text-[14px]`}
      >
        {labels.logout}
      </button>
    </section>
  );
}

function LogoutDialog({
  open,
  labels,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  labels: typeof copy.ua;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[260] flex items-start justify-center bg-[#1C100E]/35 px-4 pt-[334px] backdrop-blur-[1px]
      min-[744px]:px-10 min-[744px]:pt-[96px] min-[1023px]:pt-[108px] min-[1420px]:pt-[110px] min-[1900px]:pt-[114px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={labels.logout}
        className="relative flex min-h-[347px] w-full max-w-[358px] flex-col items-center rounded-[18px] bg-[#F0E8F0] px-7 py-10 text-center shadow-xl
        min-[744px]:min-h-[432px] min-[744px]:max-w-[664px] min-[744px]:rounded-[22px] min-[744px]:px-24 min-[744px]:py-16
        min-[1023px]:min-h-[512px] min-[1023px]:max-w-[600px] min-[1023px]:py-19
        min-[1420px]:min-h-[512px] min-[1900px]:min-h-[521px] min-[1900px]:max-w-[825px] min-[1900px]:px-42"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center font-montserrat text-[18px] leading-none text-[#1C100E]/35"
          aria-label={labels.close}
        >
          ×
        </button>

        <img
          src="/Logout.png"
          alt=""
          aria-hidden="true"
          className="mt-5 h-[52px] w-[52px] object-contain min-[744px]:mt-3 min-[744px]:h-[60px] min-[744px]:w-[60px] min-[1023px]:mt-7"
        />

        <h2 className="mt-8 whitespace-pre-line font-montserrat text-[20px] font-medium leading-[1.2] text-[#1C100E] min-[744px]:mt-8 min-[744px]:text-[24px] min-[1900px]:text-[26px]">
          {labels.logoutConfirmTitle}
        </h2>

        {error ? (
          <p className="mt-4 max-w-[300px] font-montserrat text-[12px] leading-[1.3] text-[#83105F]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`${yellowButton} mt-8 h-12 w-full max-w-[290px] text-[14px] disabled:cursor-wait disabled:opacity-70 min-[744px]:mt-9 min-[744px]:max-w-[380px] min-[1023px]:max-w-[408px] min-[1900px]:max-w-[576px]`}
        >
          {labels.logout}
        </button>
      </section>
    </div>
  );
}

function AppointmentCard({
  appointment,
  labels,
  onCancelOrReschedule,
}: {
  appointment: CabinetAppointment;
  labels: typeof copy.ua;
  onCancelOrReschedule: (appointment: CabinetAppointment) => void;
}) {
  const isCompleted = appointment.status === "completed";

  return (
    <article
      className={`relative z-10 w-full rounded-[18px] p-5 font-montserrat text-[#1C100E]
      min-[744px]:min-h-[146px] min-[744px]:p-5
      ${isCompleted ? "bg-white" : "bg-[#C8C8C8]"}`}
    >
      <h3 className="text-[16px] font-medium leading-[1.2] min-[1023px]:text-[18px]">
        {labels.consultation}
      </h3>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-4 text-[12px] leading-[1.2] min-[744px]:text-[13px]">
        <div>
          <p>{labels.toSpecialist}</p>
          <p className="mt-1">{appointment.specialistName || "—"}</p>
        </div>
        <div>
          <p>{labels.date}</p>
          <p className={`mt-1 ${isCompleted ? "text-[#37A357]" : ""}`}>
            {isCompleted ? labels.completed : normalizeDate(appointment.date)}
          </p>
        </div>
        <div>
          <p>{labels.time}</p>
          <p className="mt-1">{appointment.time || "—"}</p>
        </div>
      </div>

      {isCompleted ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" className={`${whiteButton} h-10 text-[13px]`}>
            {labels.repeat}
          </button>
          <button type="button" className="h-10 rounded-[30px] bg-[#EADCE8] font-montserrat text-[13px] font-medium text-[#1C100E]">
            {labels.review}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCancelOrReschedule(appointment)}
          className={`${whiteButton} mt-5 h-10 w-full text-[13px]`}
        >
          {labels.cancelOrReschedule}
        </button>
      )}
    </article>
  );
}

function AppointmentsView({
  appointments,
  completedAppointments,
  labels,
  onCancelOrReschedule,
}: {
  appointments: CabinetAppointment[];
  completedAppointments: CabinetAppointment[];
  labels: typeof copy.ua;
  onCancelOrReschedule: (appointment: CabinetAppointment) => void;
}) {
  const items = [...appointments, ...completedAppointments];

  return (
    <section className="relative mx-auto mt-6 w-full min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]">
      <p className="px-2 text-center font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/65 min-[744px]:text-[13px]">
        {labels.cancelNote}
      </p>

      <img
        src="/sunForPersonalOfice.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 z-0 hidden w-[220px] -translate-x-1/2 opacity-90 min-[744px]:block min-[1023px]:w-[250px]"
      />

      {items.length ? (
        <div className="relative z-10 mt-5 grid gap-4 min-[1023px]:grid-cols-2 min-[1420px]:gap-6">
          {items.map((appointment) => (
            <AppointmentCard
              key={`${appointment.status}-${appointment.id}`}
              appointment={appointment}
              labels={labels}
              onCancelOrReschedule={onCancelOrReschedule}
            />
          ))}
        </div>
      ) : (
        <div className="relative z-10 mt-8 flex min-h-[230px] flex-col items-center justify-center">
          <img src="/sunForPersonalOfice.png" alt="" className="w-[210px] min-[744px]:w-[260px]" />
          <p className="mt-4 text-center font-montserrat text-[13px] text-[#1C100E]/65">
            {labels.empty}
          </p>
        </div>
      )}
    </section>
  );
}

function CancelAppointmentDialog({
  appointment,
  labels,
  onClose,
}: {
  appointment: CabinetAppointment | null;
  labels: typeof copy.ua;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!appointment) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appointment, onClose]);

  if (!appointment) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-start justify-center bg-[#1C100E]/35 px-0 pt-11 backdrop-blur-[1px]
      min-[744px]:px-6 min-[744px]:pt-24 min-[1023px]:pt-20 min-[1420px]:pt-24 min-[1900px]:pt-20"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={labels.cancelOrReschedule}
        className="relative flex min-h-[431px] w-full max-w-[390px] flex-col items-center rounded-[22px] bg-[#F0E8F0] px-6 py-9 text-center shadow-xl
        min-[744px]:min-h-[432px] min-[744px]:max-w-[600px] min-[744px]:px-20 min-[744px]:py-11
        min-[1023px]:min-h-[443px] min-[1420px]:min-h-[454px] min-[1900px]:min-h-[472px] min-[1900px]:max-w-[825px] min-[1900px]:px-32"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center font-montserrat text-[18px] leading-none text-[#1C100E]/35"
          aria-label={labels.close}
        >
          ×
        </button>

        <img
          src="/Logo1.png"
          alt="Logo"
          className="h-[116px] w-[116px] object-contain min-[744px]:h-[126px] min-[744px]:w-[126px]"
        />

        <h2 className="mt-2 max-w-[330px] font-montserrat text-[17px] font-medium leading-[1.08] text-[#1C100E] min-[744px]:max-w-[420px] min-[744px]:text-[19px] min-[1900px]:max-w-[530px] min-[1900px]:text-[21px]">
          {labels.cancelModalTitle}
        </h2>

        <div className="mt-7 flex items-center gap-3 font-montserrat text-[14px] font-medium text-[#1C100E] min-[744px]:mt-6 min-[744px]:text-[16px]">
          <img
            src={appointment.specialistAvatar || "/lashenko2.png"}
            alt={appointment.specialistName}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span>{appointment.specialistName || "—"}</span>
        </div>

        <p className="mt-6 max-w-[315px] font-montserrat text-[12px] leading-[1.25] text-[#1C100E]/65 min-[744px]:max-w-[420px] min-[744px]:text-[13px] min-[1900px]:max-w-[520px]">
          {labels.cancelModalNote}
        </p>
      </section>
    </div>
  );
}

function FavoriteEventCard({
  event,
  language,
}: {
  event: EventItem;
  language: "ua" | "en";
}) {
  const title = language === "en" ? event.title_en : event.title_ua;
  const description =
    (language === "en" ? event.description_en : event.description_ua)[0] || "";
  const detailUrl = `/events/${event.categorySlug}/${event.id}`;

  return (
    <Link
      to={detailUrl}
      className="relative z-10 block w-full rounded-[18px] bg-white px-5 py-6 text-left font-montserrat text-[#1C100E] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]
      min-[744px]:max-w-[370px] min-[1023px]:max-w-[390px] min-[1420px]:max-w-[410px] min-[1900px]:max-w-[430px]"
    >
      <h3 className="text-[17px] font-medium leading-[1.18] min-[744px]:text-[18px]">
        {title}
      </h3>

      <div className="mt-5 flex items-center gap-3 text-[12px] text-[#1C100E]">
        <span>{event.likesCount || 0}</span>
        <Heart className="size-4 fill-[#83105F] stroke-[#83105F]" aria-hidden="true" />
        <span>{event.commentsCount ?? event.comments.length}</span>
        <MessageSquare className="size-4" aria-hidden="true" />
        <Bookmark className="size-4 fill-[#83105F] stroke-[#83105F]" aria-hidden="true" />
      </div>

      <p className="mt-5 line-clamp-2 text-[12px] leading-[1.35] text-[#1C100E]/60 min-[744px]:text-[13px]">
        {description}
      </p>
    </Link>
  );
}

function FavoritesView({
  labels,
  favoriteEvents,
  language,
}: {
  labels: typeof copy.ua;
  favoriteEvents: EventItem[];
  language: "ua" | "en";
}) {
  return (
    <section className="relative mx-auto mt-8 min-h-[260px] w-full min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]">
      <img
        src="/sunForPersonalOfice.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-7 z-0 hidden w-[230px] -translate-x-1/2 opacity-80 min-[744px]:block min-[1023px]:w-[280px] min-[1420px]:top-10"
      />

      {favoriteEvents.length ? (
        <div className="relative z-10 grid gap-4 min-[744px]:justify-start min-[1420px]:gap-6">
          {favoriteEvents.map((event) => (
            <FavoriteEventCard
              key={event.id}
              event={event}
              language={language}
            />
          ))}
        </div>
      ) : (
        <div className="relative z-10 rounded-[22px] bg-[#F8F8F8] px-6 py-10 text-center font-montserrat text-[14px] text-[#1C100E]/70">
          {labels.emptyFavorites}
        </div>
      )}
    </section>
  );
}

function AboutView({ profile, labels }: { profile: CabinetProfile; labels: typeof copy.ua }) {
  return (
    <section className="mx-auto mt-10 w-full rounded-[22px] bg-[#F8F8F8] px-6 py-8 font-montserrat text-[#1C100E] min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]">
      <h2 className="text-[18px] font-medium">{labels.about}</h2>
      <p className="mt-4 text-[14px] leading-[1.55] text-[#1C100E]/75">
        {profile.about || labels.empty}
      </p>
    </section>
  );
}

export function UserCabinetPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const labels = useMemo(
    () => (isEnglishLanguage(i18n.language) ? copy.en : copy.ua),
    [i18n.language],
  );

  const [profile, setProfile] = useState<CabinetProfile | null>(null);
  const [appointments, setAppointments] = useState<CabinetAppointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<CabinetAppointment[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<CabinetTab>("appointments");
  const [selectedAppointment, setSelectedAppointment] = useState<CabinetAppointment | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadCabinet = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [data, favorites] = await Promise.all([
          getUserCabinetData(controller.signal),
          getFavoriteEvents().catch(() => []),
        ]);
        setProfile(data.profile);
        setAppointments(data.appointments);
        setCompletedAppointments(data.completedAppointments);
        setFavoriteEvents(favorites);
      } catch {
        setError(labels.loadError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCabinet();

    return () => controller.abort();
  }, [labels.loadError]);

  if (isLoading) {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[744px]:pt-0 min-[1420px]:pt-20`}>
        <p className="text-center font-montserrat text-[16px] text-[#1C100E]">
          {labels.loading}
        </p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className={`${pageMaxWidth} min-h-[520px] pt-6 pb-14 min-[744px]:pt-0 min-[1420px]:pt-20`}>
        <div className="mx-auto max-w-[520px] rounded-[22px] bg-[#F8F8F8] px-6 py-10 text-center font-montserrat">
          <h1 className="text-[22px] font-medium text-[#1C100E]">{labels.title}</h1>
          <p className="mt-4 text-[14px] text-[#1C100E]/70">
            {error || labels.loginRequired}
          </p>
          <div className="mx-auto mt-6 max-w-[220px] [&_button]:w-full">
            <LogIn variant="menu" text={labels.login} />
          </div>
        </div>
      </section>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logoutCurrentUser();
    } catch {
      setLogoutError(labels.logoutError);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutOpen(false);
      navigate("/");
    }
  };

  return (
    <section className={`${pageMaxWidth} pt-4 pb-16 min-[744px]:pt-0 min-[1023px]:pt-8 min-[1420px]:pt-20 min-[1900px]:pt-24`}>
      <ProfileCard
        profile={profile}
        labels={labels}
        activeTab={activeTab}
        onAbout={() => setActiveTab("about")}
      />

      <CabinetTabs
        labels={labels}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => setIsLogoutOpen(true)}
      />

      {activeTab === "appointments" ? (
        <AppointmentsView
          appointments={appointments}
          completedAppointments={completedAppointments}
          labels={labels}
          onCancelOrReschedule={setSelectedAppointment}
        />
      ) : activeTab === "favorites" ? (
        <FavoritesView
          labels={labels}
          favoriteEvents={favoriteEvents}
          language={isEnglishLanguage(i18n.language) ? "en" : "ua"}
        />
      ) : (
        <AboutView profile={profile} labels={labels} />
      )}

      <CancelAppointmentDialog
        appointment={selectedAppointment}
        labels={labels}
        onClose={() => setSelectedAppointment(null)}
      />

      <LogoutDialog
        open={isLogoutOpen}
        labels={labels}
        isSubmitting={isLoggingOut}
        error={logoutError}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => void handleLogout()}
      />
    </section>
  );
}
