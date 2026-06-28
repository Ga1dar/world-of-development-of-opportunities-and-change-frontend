import { Bookmark, Camera, ChevronLeft, ChevronRight, Heart, MessageSquare, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn } from "./LogIn";
import {
  getCabinetAppointments,
  getUserCabinetData,
  updateProfileAvatar,
  type CabinetAppointment,
  type CabinetAppointmentQuery,
  type CabinetDocument,
  type CabinetProfile,
} from "../../api/userCabinet";
import { logoutCurrentUser, notifyAuthChanged } from "../../api/auth";
import {
  FAVORITES_CHANGED_EVENT,
  getCurrentUserFavoriteContentItems,
  mergeFavoriteContentItems,
  readFavoriteContentItems,
  type FavoriteContentItem,
} from "../../api/userFavorites";
import {
  cancelConsultationAppointment,
  CONSULTATION_TIME_OPTIONS,
  consultationLocalTimeToIso,
  createConsultationSlots,
  deleteConsultationSlot,
  getConsultationSlots,
} from "../../api/consultations";
import type { ConsultationSlot } from "../../api/consultations";
import { RescheduleAppointmentDialog } from "./RescheduleAppointmentDialog";
import { CancelConsultationDialog } from "./CancelConsultationDialog";
import { DocumentPreviewDialog } from "./DocumentPreviewDialog";

type CabinetTab = "appointments" | "favorites" | "about" | "calendar" | "history";
const CONSULTATION_REVIEW_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfhxgIklNqpJJCuE_Nhm_PXsdyazL73ur0S8wiejVLKBjLLzA/viewform";
const cabinetTabs = new Set<CabinetTab>([
  "appointments",
  "favorites",
  "about",
  "calendar",
  "history",
]);

const isCabinetTab = (value: string | null): value is CabinetTab =>
  Boolean(value && cabinetTabs.has(value as CabinetTab));

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
    calendar: "Календар",
    appealHistory: "Історія звернень",
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
    specialistAppointmentsEmpty: "Записи на консультації з'являться тут.",
    calendarEmpty: "Календар спеціаліста з'явиться тут.",
    historyEmpty: "Історія звернень з'явиться тут.",
    all: "Усі",
    byName: "За іменем",
    byDate: "За датою",
    cancel: "Відмінити",
    reschedule: "Перенести",
    specialistRecordsEmpty: "Записи на консультації з'являться тут.",
    specialistNameFilterEmpty: "Записані користувачі з'являться тут.",
    cancelAppointmentError: "Не вдалося відмінити запис. Спробуйте ще раз.",
    emailLabel: "Пошта:",
    emailMissing: "Відсутня",
    phoneLabel: "Телефон:",
    phoneMissing: "Відсутній",
    cityLabel: "Місто:",
    cityMissing: "Відсутнє",
    birthDateLabel: "Дата народження:",
    birthDateMissing: "Відсутня",
    educationLabel: "Освіта вища:",
    educationMissing: "Інформація відсутня",
    specializationLabel: "Спеціальність:",
    specializationMissing: "Інформація відсутня",
    experienceLabel: "Стаж роботи:",
    experienceMissing: "Інформація відсутня",
    aboutMissing: "Інформація відсутня",
    documentsLabel: "Документи:",
    documentAlt: "Документ спеціаліста",
    documentsEmpty: "Завантажені документи з'являться тут.",
    previousMonth: "Попередній місяць",
    nextMonth: "Наступний місяць",
    busyTime: "Зайнятий час",
    freeTime: "Вільний час",
    addSlots: "Додати слоти",
    addingSlots: "Додаємо...",
    slotsSaved: "Слоти додано.",
    slotsError: "Не вдалося оновити календар. Перевірте дату та спробуйте ще раз.",
    availableSlots: "Вільні слоти",
    noAvailableSlots: "На цю дату вільних слотів немає.",
    deleteSlot: "Видалити слот",
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
    calendar: "Calendar",
    appealHistory: "Request history",
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
    specialistAppointmentsEmpty: "Consultation bookings will appear here.",
    calendarEmpty: "The specialist calendar will appear here.",
    historyEmpty: "Request history will appear here.",
    all: "All",
    byName: "By name",
    byDate: "By date",
    cancel: "Cancel",
    reschedule: "Reschedule",
    specialistRecordsEmpty: "Consultation bookings will appear here.",
    specialistNameFilterEmpty: "Booked users will appear here.",
    cancelAppointmentError: "Could not cancel booking. Try again.",
    emailLabel: "Email:",
    emailMissing: "Missing",
    phoneLabel: "Phone:",
    phoneMissing: "Missing",
    cityLabel: "City:",
    cityMissing: "Missing",
    birthDateLabel: "Birth date:",
    birthDateMissing: "Missing",
    educationLabel: "Higher education:",
    educationMissing: "Information is missing",
    specializationLabel: "Specialization:",
    specializationMissing: "Information is missing",
    experienceLabel: "Experience:",
    experienceMissing: "Information is missing",
    aboutMissing: "Information is missing",
    documentsLabel: "Documents:",
    documentAlt: "Specialist document",
    documentsEmpty: "Uploaded documents will appear here.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    busyTime: "Busy time",
    freeTime: "Free time",
    addSlots: "Add slots",
    addingSlots: "Adding...",
    slotsSaved: "Slots added.",
    slotsError: "Could not update the calendar. Check the date and try again.",
    availableSlots: "Available slots",
    noAvailableSlots: "No free slots for this date.",
    deleteSlot: "Delete slot",
  },
};

const pageMaxWidth = "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn";

const whiteButton =
  "rounded-[30px] bg-white font-montserrat font-medium text-[#1C100E]";

const normalizeDate = (value: string) => {
  if (!value) return "";
  if (value.includes(".")) return value.endsWith("р") ? value : `${value}р`;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return `${parsed.toLocaleDateString("uk-UA")}р`;
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseAppointmentDate = (value: string) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

  const [day, month, year] = value.split(".");
  const normalizedYear = (year || "").replace(/\D/g, "");

  if (day && month && normalizedYear) {
    return `${normalizedYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : toDateInputValue(parsed);
};

const normalizeAppointmentTime = (value: string) => value.slice(0, 5);

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
  onAvatarChange,
  isAvatarSaving,
}: {
  profile: CabinetProfile;
  labels: typeof copy.ua;
  activeTab: CabinetTab;
  onAbout: () => void;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isAvatarSaving: boolean;
}) {
  const displayName = profile.fullName || labels.fallbackName;
  const isSpecialist = profile.profileKind === "specialist";
  const profileSummary = isSpecialist
    ? profile.profession || labels.roleSpecialist
    : roleLabel(profile.role, labels);
  const cardWidthClass = isSpecialist
    ? "min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[880px] min-[1900px]:max-w-[1180px]"
    : "min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]";

  return (
    <section
      className={`mx-auto flex w-full flex-col items-center rounded-[22px] bg-[#F8F8F8] px-3 py-5
      min-[744px]:flex-row min-[744px]:justify-between min-[744px]:px-8 min-[744px]:py-7 ${cardWidthClass}`}
    >
      <div className="flex w-full flex-col items-center gap-4 min-[744px]:flex-row min-[744px]:gap-8">
        <div className="relative h-[132px] w-[132px] shrink-0 min-[744px]:h-[126px] min-[744px]:w-[126px]">
          <img
            src={profile.avatar}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.src =
                profile.profileKind === "specialist" ? "/lashenko2.png" : "/user.jpg";
            }}
          />
          <label className="absolute right-1 bottom-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#E8DCE8] transition hover:bg-[#E0D0E0]">
            <Camera className="h-4 w-4 text-[#1C100E]" />
            <input
              type="file"
              accept="image/*"
              disabled={isAvatarSaving}
              onChange={onAvatarChange}
              className="sr-only"
            />
          </label>
        </div>

        <div className="w-full text-left font-montserrat text-[#1C100E]">
          <h1 className="text-[18px] font-medium leading-[1.2] min-[1023px]:text-[20px]">
            {displayName}
          </h1>
          <p className="mt-2 text-[13px] leading-[1.25] text-[#1C100E]/70">
            {profile.email}
          </p>
          <p className="mt-3 text-[14px] leading-[1.25]">
            {profileSummary}
          </p>
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col gap-3 min-[744px]:mt-0 min-[744px]:w-[196px]">
        <Link
          to={isSpecialist ? "/profile/specialist/edit" : "/profile/edit"}
          className={`${yellowButton} flex h-11 items-center justify-center text-[14px]`}
        >
          {labels.edit}
        </Link>
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
  isSpecialist,
}: {
  labels: typeof copy.ua;
  activeTab: CabinetTab;
  onTabChange: (tab: CabinetTab) => void;
  isSpecialist: boolean;
}) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const tabs: Array<{ id: CabinetTab; label: string }> = isSpecialist
    ? [
        { id: "appointments", label: labels.myAppointments },
        { id: "calendar", label: labels.calendar },
        { id: "favorites", label: labels.favorites },
        { id: "history", label: labels.appealHistory },
      ]
    : [
        { id: "appointments", label: labels.myAppointments },
        { id: "favorites", label: labels.favorites },
      ];

  const tabClass = (tab: CabinetTab) =>
    `h-12 rounded-[30px] px-5 font-montserrat text-[13px] font-medium transition-colors
    min-[744px]:h-11 min-[744px]:text-[14px]
    ${
      activeTab === tab
        ? "border border-[#B34D8D] bg-[#E7C5DA] text-[#83105F]"
        : "bg-transparent text-[#1C100E] underline decoration-[#9E9E9E] underline-offset-[14px]"
    }`;
  const gridClass = isSpecialist
    ? "min-[744px]:grid-cols-3 min-[1023px]:grid-cols-4 min-[1420px]:grid-cols-[1fr_1fr_1fr_1fr_1.1fr]"
    : "min-[744px]:grid-cols-3";
  const widthClass = isSpecialist
    ? "min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[1260px] min-[1900px]:max-w-[1180px]"
    : "min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutCurrentUser();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <section
      className={`mx-auto mt-8 flex w-full flex-col gap-3 rounded-[22px] bg-[#F8F8F8] p-3
      min-[744px]:grid min-[744px]:gap-5 ${gridClass} ${widthClass}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={tabClass(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <button
        type="button"
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
        onClick={() => void handleLogout()}
        className="h-12 rounded-[30px] bg-[#1C100E] px-5 font-montserrat text-[13px] font-medium text-white transition-opacity disabled:cursor-wait disabled:opacity-70 min-[744px]:h-11 min-[744px]:text-[14px]"
      >
        {labels.logout}
      </button>
    </section>
  );
}

function AppointmentCard({
  appointment,
  labels,
  onCancelOrReschedule,
  onRepeat,
}: {
  appointment: CabinetAppointment;
  labels: typeof copy.ua;
  onCancelOrReschedule: (appointment: CabinetAppointment) => void;
  onRepeat: (appointment: CabinetAppointment) => void;
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
          <button
            type="button"
            onClick={() => onRepeat(appointment)}
            disabled={!appointment.specialistId}
            className={`${whiteButton} h-10 text-[13px] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {labels.repeat}
          </button>
          <a
            href={CONSULTATION_REVIEW_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center justify-center rounded-[30px] bg-[#EADCE8] font-montserrat text-[13px] font-medium text-[#1C100E]"
          >
            {labels.review}
          </a>
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
  onRepeat,
}: {
  appointments: CabinetAppointment[];
  completedAppointments: CabinetAppointment[];
  labels: typeof copy.ua;
  onCancelOrReschedule: (appointment: CabinetAppointment) => void;
  onRepeat: (appointment: CabinetAppointment) => void;
}) {
  const items = [...appointments, ...completedAppointments];

  return (
    <section className="relative mx-auto mt-6 w-full min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]">
      <p className="px-2 text-center font-montserrat text-[12px] leading-[1.35] text-[#1C100E]/65 min-[744px]:text-[13px]">
        {labels.cancelNote}
      </p>

      {items.length ? (
        <img
          src="/sunForPersonalOfice.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 z-0 hidden w-[220px] -translate-x-1/2 opacity-90 min-[744px]:block min-[1023px]:w-[250px]"
        />
      ) : null}

      {items.length ? (
        <div className="relative z-10 mt-5 grid gap-4 min-[1023px]:grid-cols-2 min-[1420px]:gap-6">
          {items.map((appointment) => (
            <AppointmentCard
              key={`${appointment.status}-${appointment.id}`}
              appointment={appointment}
              labels={labels}
              onCancelOrReschedule={onCancelOrReschedule}
              onRepeat={onRepeat}
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

type SpecialistRecordFilter = "all" | "name" | "date";

type AppointmentFilterRequest = CabinetAppointmentQuery & {
  localClientKey?: string;
  localClientName?: string;
  localDateKey?: string;
};

const parseAppointmentTimestamp = (appointment: CabinetAppointment) => {
  const rawValue =
    appointment.startsAt ||
    (appointment.date && appointment.time ? `${appointment.date}T${appointment.time}` : "");
  const normalizedRawValue = rawValue.includes("T") ? rawValue : rawValue.replace(" ", "T");
  const parsed = new Date(normalizedRawValue);

  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();

  const dateValue = appointment.date || rawValue.split(/[T ]/)[0] || "";
  const timeValue = appointment.time || rawValue.split(/[T ]/)[1] || "";
  const [day, month, year] = dateValue.split(".");
  const [hour = "0", minute = "0"] = timeValue.split(":");
  const fallback = new Date(
    Number((year || "").replace(/\D/g, "")) || new Date().getFullYear(),
    (Number(month) || 1) - 1,
    Number(day) || 1,
    Number(hour) || 0,
    Number(minute) || 0,
  );

  return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
};

const getAppointmentTime = (appointment: CabinetAppointment) => {
  const timestamp = parseAppointmentTimestamp(appointment);
  return timestamp || Number.MAX_SAFE_INTEGER;
};

const getAppointmentClientName = (appointment: CabinetAppointment) =>
  (appointment.clientName || appointment.clientEmail || "—").trim();

const getAppointmentClientKey = (appointment: CabinetAppointment) =>
  (
    appointment.clientProfileId ||
    appointment.clientId ||
    appointment.clientEmail ||
    getAppointmentClientName(appointment)
  )
    .trim()
    .toLowerCase();

const normalizeFilterValue = (value: string) => value.trim().toLowerCase();

const getAppointmentClientNameKey = (appointment: CabinetAppointment) =>
  normalizeFilterValue(getAppointmentClientName(appointment));

const getAppointmentDateKey = (appointment: CabinetAppointment) =>
  parseAppointmentDate(appointment.date || appointment.startsAt);

const filterAppointmentsLocally = (
  appointments: CabinetAppointment[],
  query: AppointmentFilterRequest,
) =>
  appointments.filter((appointment) => {
    if (query.localClientName || query.localClientKey) {
      const matchesName =
        !!query.localClientName &&
        getAppointmentClientNameKey(appointment) === query.localClientName;
      const matchesKey =
        !!query.localClientKey && getAppointmentClientKey(appointment) === query.localClientKey;

      if (!matchesName && !matchesKey) return false;
    }

    if (query.localDateKey && getAppointmentDateKey(appointment) !== query.localDateKey) {
      return false;
    }

    return true;
  });

type SpecialistNameFilterItem = {
  id: string;
  key: string;
  name: string;
  avatar?: string;
  userId?: string;
  localClientKey?: string;
  localClientName?: string;
};

function SpecialistNameFilterModal({
  open,
  labels,
  items,
  title,
  emptyText,
  showAvatar = true,
  onClose,
  onSelect,
}: {
  open: boolean;
  labels: typeof copy.ua;
  items: SpecialistNameFilterItem[];
  title: string;
  emptyText: string;
  showAvatar?: boolean;
  onClose: () => void;
  onSelect: (item: SpecialistNameFilterItem) => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#1C100E]/35 px-0 pt-[91px] min-[744px]:px-6 min-[744px]:pt-[58px] min-[1023px]:pt-[76px] min-[1900px]:pt-[82px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative h-[415px] w-full max-w-[390px] rounded-[18px] bg-[#F6EEF5] px-8 pt-[70px] font-montserrat text-[#1C100E] shadow-[0_18px_45px_rgba(28,16,14,0.12)] min-[744px]:max-w-[600px] min-[744px]:px-[72px] min-[744px]:pt-[68px] min-[1900px]:h-[491px] min-[1900px]:max-w-[825px] min-[1900px]:px-[128px] min-[1900px]:pt-[76px]"
      >
        <button
          type="button"
          aria-label={labels.close}
          onClick={onClose}
          className="absolute right-5 top-5 flex size-7 items-center justify-center rounded-full text-[#1C100E]/45 transition-colors hover:text-[#1C100E] min-[744px]:right-6 min-[744px]:top-6"
        >
          <X size={16} strokeWidth={1.7} />
        </button>

        <img
          src="/Logo1.png"
          alt="СвіТи"
          className="mx-auto h-auto w-[76px] min-[744px]:w-[82px] min-[1900px]:w-[90px]"
        />

        <h2 className="mt-2 text-center text-[14px] font-medium leading-[1.25] min-[744px]:text-[15px]">
          {title}
        </h2>

        <div className="mx-auto mt-6 flex max-h-[230px] w-full max-w-[300px] flex-col gap-4 overflow-y-auto pr-1 min-[744px]:mt-7 min-[1900px]:max-h-[270px]">
          {items.length ? (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full items-center gap-3 rounded-[14px] text-left transition-opacity hover:opacity-75"
              >
                {showAvatar ? (
                  <img
                    src={item.avatar || "/user.jpg"}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.src = "/user.jpg";
                    }}
                    className="size-6 shrink-0 rounded-full object-cover"
                  />
                ) : null}
                <span className="min-w-0 truncate text-[12px] leading-[1.25] min-[744px]:text-[13px]">
                  {item.name}
                </span>
              </button>
            ))
          ) : (
            <p className="text-center text-[12px] leading-[1.35] text-[#1C100E]/65">
              {emptyText}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function SpecialistAppointmentCard({
  appointment,
  labels,
  isCancelling,
  onCancel,
  onReschedule,
}: {
  appointment: CabinetAppointment;
  labels: typeof copy.ua;
  isCancelling: boolean;
  onCancel: (appointment: CabinetAppointment) => void;
  onReschedule: (appointment: CabinetAppointment) => void;
}) {
  return (
    <article className="relative z-10 w-full rounded-[18px] bg-[#C8C8C8] p-4 font-montserrat text-[#1C100E] min-[744px]:max-w-[390px] min-[1420px]:max-w-[280px] min-[1900px]:max-w-[360px]">
      <h3 className="text-[15px] font-medium leading-[1.2] min-[744px]:text-[16px]">
        {labels.consultation}
      </h3>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-4 text-[11px] leading-[1.25] min-[744px]:text-[12px]">
        <div>
          <p>{appointment.clientName || appointment.clientEmail || "—"}</p>
        </div>
        <div>
          <p>{labels.date}</p>
          <p className="mt-1">{normalizeDate(appointment.date)}</p>
        </div>
        <div>
          <p>{labels.time}</p>
          <p className="mt-1">{appointment.time || "—"}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isCancelling}
          onClick={() => onCancel(appointment)}
          className={`${whiteButton} h-10 text-[12px] disabled:cursor-wait disabled:opacity-70`}
        >
          {labels.cancel}
        </button>
        <button
          type="button"
          onClick={() => onReschedule(appointment)}
          className={`${whiteButton} h-10 text-[12px]`}
        >
          {labels.reschedule}
        </button>
      </div>
    </article>
  );
}

function SpecialistAppointmentsView({
  appointments,
  filterSourceAppointments,
  labels,
  cancellingId,
  error,
  isFiltering,
  onFilterChange,
  onCancel,
  onReschedule,
}: {
  appointments: CabinetAppointment[];
  filterSourceAppointments: CabinetAppointment[];
  labels: typeof copy.ua;
  cancellingId: string;
  error: string;
  isFiltering: boolean;
  onFilterChange: (query?: AppointmentFilterRequest) => void;
  onCancel: (appointment: CabinetAppointment) => void;
  onReschedule: (appointment: CabinetAppointment) => void;
}) {
  const [filter, setFilter] = useState<SpecialistRecordFilter>("all");
  const [activeFilterModal, setActiveFilterModal] = useState<Exclude<SpecialistRecordFilter, "all"> | "">("");
  const nameFilterItems = useMemo(() => {
    const items = new Map<string, SpecialistNameFilterItem & { sortTime: number }>();

    filterSourceAppointments.forEach((appointment) => {
      const clientKey = getAppointmentClientKey(appointment);
      const nameKey = getAppointmentClientNameKey(appointment);
      const key = nameKey || clientKey;
      if (!key) return;

      const existing = items.get(key);
      const avatar = appointment.clientAvatar && appointment.clientAvatar !== "/user.jpg"
        ? appointment.clientAvatar
        : undefined;

      if (!existing) {
        items.set(key, {
          id: key,
          key,
          name: getAppointmentClientName(appointment),
          avatar,
          userId: appointment.clientId || undefined,
          localClientKey: clientKey || undefined,
          localClientName: nameKey || undefined,
          sortTime: getAppointmentTime(appointment),
        });
        return;
      }

      if (!existing.avatar && avatar) existing.avatar = avatar;
      if (!existing.userId && appointment.clientId) existing.userId = appointment.clientId;
      if (!existing.localClientKey && clientKey) existing.localClientKey = clientKey;
      if (!existing.localClientName && nameKey) existing.localClientName = nameKey;
      existing.sortTime = Math.min(existing.sortTime, getAppointmentTime(appointment));
    });

    return Array.from(items.values())
      .sort((a, b) => {
        const byName = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        return byName || a.sortTime - b.sortTime;
      })
      .map(({ sortTime: _sortTime, ...item }) => item);
  }, [filterSourceAppointments]);
  const dateFilterItems = useMemo(() => {
    const items = new Map<string, SpecialistNameFilterItem & { sortTime: number }>();

    filterSourceAppointments.forEach((appointment) => {
      const key = getAppointmentDateKey(appointment);
      if (!key || items.has(key)) return;

      items.set(key, {
        id: key,
        key,
        name: normalizeDate(key),
        sortTime: getAppointmentTime(appointment),
      });
    });

    return Array.from(items.values())
      .sort((a, b) => a.sortTime - b.sortTime)
      .map(({ sortTime: _sortTime, ...item }) => item);
  }, [filterSourceAppointments]);
  const activeFilterClass = "border border-[#B34D8D] bg-[#E7C5DA] text-[#83105F]";
  const inactiveFilterClass = "bg-white text-[#1C100E]";
  const filterButtonClass =
    "h-10 min-w-[92px] rounded-[30px] px-5 font-montserrat text-[12px] font-medium transition-colors min-[744px]:min-w-[112px]";

  return (
    <section
      className={`relative mx-auto mt-6 w-full min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[1260px] min-[1900px]:max-w-[1180px] ${
        appointments.length > 0 && appointments.length <= 3 ? "min-[1900px]:pb-[175px]" : ""
      }`}
    >
      <div className="relative z-10 flex flex-wrap gap-3 min-[744px]:gap-5">
        <button
          type="button"
          onClick={() => {
            setFilter("all");
            setActiveFilterModal("");
            onFilterChange();
          }}
          disabled={isFiltering}
          className={`${filterButtonClass} ${
            filter === "all" && !activeFilterModal ? activeFilterClass : inactiveFilterClass
          } disabled:cursor-wait disabled:opacity-70`}
        >
          {labels.all}
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterModal("name")}
          disabled={isFiltering}
          className={`${filterButtonClass} ${
            activeFilterModal === "name" || filter === "name"
              ? activeFilterClass
              : inactiveFilterClass
          } disabled:cursor-wait disabled:opacity-70`}
        >
          {labels.byName}
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterModal("date")}
          disabled={isFiltering}
          className={`${filterButtonClass} ${
            activeFilterModal === "date" || filter === "date"
              ? activeFilterClass
              : inactiveFilterClass
          } disabled:cursor-wait disabled:opacity-70`}
        >
          {labels.byDate}
        </button>
      </div>

      <SpecialistNameFilterModal
        open={activeFilterModal === "name"}
        labels={labels}
        items={nameFilterItems}
        title={labels.byName}
        emptyText={labels.specialistNameFilterEmpty}
        onClose={() => setActiveFilterModal("")}
        onSelect={(item) => {
          setFilter("name");
          setActiveFilterModal("");
          onFilterChange({
            ...(item.userId ? { user: item.userId } : {}),
            localClientKey: item.localClientKey,
            localClientName: item.localClientName,
          });
        }}
      />

      <SpecialistNameFilterModal
        open={activeFilterModal === "date"}
        labels={labels}
        items={dateFilterItems}
        title={labels.byDate}
        emptyText={labels.specialistRecordsEmpty}
        showAvatar={false}
        onClose={() => setActiveFilterModal("")}
        onSelect={(item) => {
          setFilter("date");
          setActiveFilterModal("");
          onFilterChange({ date: item.key, localDateKey: item.key });
        }}
      />

      {appointments.length ? (
        <img
          src="/sunForPersonalOfice.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-16 z-0 hidden w-[220px] -translate-x-1/2 opacity-65 min-[744px]:block min-[1023px]:w-[280px]"
        />
      ) : null}

      {error ? (
        <p className="relative z-10 mt-4 font-montserrat text-[12px] leading-[1.35] text-[#83105F]">
          {error}
        </p>
      ) : null}

      {appointments.length ? (
        <div className="relative z-10 mt-5 grid gap-4 min-[744px]:mt-6 min-[1023px]:grid-cols-2 min-[1420px]:grid-cols-3 min-[1900px]:gap-6">
          {appointments.map((appointment) => (
            <SpecialistAppointmentCard
              key={appointment.id}
              appointment={appointment}
              labels={labels}
              isCancelling={cancellingId === appointment.id}
              onCancel={onCancel}
              onReschedule={onReschedule}
            />
          ))}
        </div>
      ) : (
        <div className="relative z-10 mt-8 flex min-h-[230px] flex-col items-center justify-center">
          <img src="/sunForPersonalOfice.png" alt="" className="w-[210px] min-[744px]:w-[260px]" />
          <p className="mt-4 text-center font-montserrat text-[13px] text-[#1C100E]/65">
            {labels.specialistRecordsEmpty}
          </p>
        </div>
      )}
    </section>
  );
}

function SpecialistCalendarView({
  appointments,
  labels,
  language,
  specialistId,
}: {
  appointments: CabinetAppointment[];
  labels: typeof copy.ua;
  language: string;
  specialistId: number;
}) {
  const locale = isEnglishLanguage(language) ? "en-US" : "uk-UA";
  const today = useMemo(() => new Date(), []);
  const todayValue = toDateInputValue(today);
  const busyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    appointments.forEach((appointment) => {
      const date = parseAppointmentDate(appointment.date);
      const time = normalizeAppointmentTime(appointment.time);

      if (!date || !time) return;

      const times = map.get(date) || new Set<string>();
      times.add(time);
      map.set(date, times);
    });

    return map;
  }, [appointments]);
  const busyDates = useMemo(
    () => Array.from(busyMap.keys()).sort((a, b) => a.localeCompare(b)),
    [busyMap],
  );
  const initialDate = busyDates.find((date) => date >= todayValue) || busyDates[0] || todayValue;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const parsed = new Date(initialDate);
    return Number.isNaN(parsed.getTime())
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  });
  const weekDays = useMemo(() => getWeekDays(locale), [locale]);
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const selectedBusyTimes = busyMap.get(selectedDate) || new Set<string>();
  const [availableSlots, setAvailableSlots] = useState<ConsultationSlot[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSlotsSaving, setIsSlotsSaving] = useState(false);
  const [slotsNotice, setSlotsNotice] = useState("");
  const [slotsError, setSlotsError] = useState("");
  const availableMap = useMemo(() => {
    const map = new Map<string, ConsultationSlot[]>();

    availableSlots.forEach((slot) => {
      const list = map.get(slot.date) || [];
      list.push(slot);
      map.set(slot.date, list);
    });

    map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));

    return map;
  }, [availableSlots]);
  const selectedAvailableSlots = useMemo(
    () => availableMap.get(selectedDate) || [],
    [availableMap, selectedDate],
  );
  const selectedAvailableTimes = useMemo(
    () => new Set(selectedAvailableSlots.map((slot) => slot.time)),
    [selectedAvailableSlots],
  );

  const loadAvailableSlots = useCallback(async (signal?: AbortSignal) => {
    if (!Number.isInteger(specialistId) || specialistId <= 0) return;

    setIsSlotsLoading(true);
    setSlotsError("");

    try {
      const slots = await getConsultationSlots(specialistId, signal);
      setAvailableSlots(slots);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setSlotsError(labels.slotsError);
    } finally {
      setIsSlotsLoading(false);
    }
  }, [labels.slotsError, specialistId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadAvailableSlots(controller.signal);
    return () => controller.abort();
  }, [loadAvailableSlots]);

  useEffect(() => {
    setSelectedTimes([]);
    setSlotsNotice("");
    setSlotsError("");
  }, [selectedDate]);

  const moveMonth = (direction: -1 | 1) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  const toggleTime = (time: string) => {
    if (selectedBusyTimes.has(time) || selectedAvailableTimes.has(time)) return;

    setSelectedTimes((current) =>
      current.includes(time)
        ? current.filter((item) => item !== time)
        : [...current, time].sort((a, b) => a.localeCompare(b)),
    );
  };

  const handleCreateSlots = async () => {
    if (!selectedTimes.length || isSlotsSaving) return;

    setIsSlotsSaving(true);
    setSlotsError("");
    setSlotsNotice("");

    const startTimes = selectedTimes
      .map((time) => consultationLocalTimeToIso(selectedDate, time))
      .filter(Boolean);
    const result = await createConsultationSlots(startTimes);

    if (result.status === "success") {
      setSelectedTimes([]);
      setSlotsNotice(labels.slotsSaved);
      await loadAvailableSlots();
    } else {
      setSlotsError(labels.slotsError);
    }

    setIsSlotsSaving(false);
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (isSlotsSaving) return;

    setIsSlotsSaving(true);
    setSlotsError("");
    setSlotsNotice("");

    const result = await deleteConsultationSlot(slotId);

    if (result.status === "success") {
      setAvailableSlots((current) => current.filter((slot) => slot.id !== slotId));
    } else {
      setSlotsError(labels.slotsError);
    }

    setIsSlotsSaving(false);
  };

  return (
    <section className="relative mx-auto mt-6 w-full min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[1260px] min-[1900px]:max-w-[1180px]">
      <div className="relative z-10 grid gap-4 min-[744px]:grid-cols-[1fr_116px] min-[744px]:items-start min-[1023px]:grid-cols-[560px_120px_1fr] min-[1023px]:gap-6 min-[1420px]:grid-cols-[560px_132px_1fr] min-[1900px]:grid-cols-[560px_150px_1fr]">
        <div className="rounded-[18px] bg-white px-5 py-5 font-montserrat text-[#1C100E] min-[744px]:px-6 min-[744px]:py-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium min-[744px]:text-[14px]">
              {getMonthLabel(visibleMonth, locale)}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label={labels.previousMonth}
                onClick={() => moveMonth(-1)}
                className="flex size-7 items-center justify-center rounded-full transition hover:bg-[#F0E8F0]"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label={labels.nextMonth}
                onClick={() => moveMonth(1)}
                className="flex size-7 items-center justify-center rounded-full transition hover:bg-[#F0E8F0]"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-x-2 gap-y-3 text-center min-[744px]:gap-x-2 min-[1023px]:gap-x-5">
            {weekDays.map((day) => (
              <span key={day} className="text-[11px] font-medium min-[744px]:text-[12px]">
                {day}
              </span>
            ))}

            {monthDays.map(({ date, currentMonth }) => {
              const value = toDateInputValue(date);
              const isBusy = busyMap.has(value);
              const hasAvailable = availableMap.has(value);
              const isSelected = value === selectedDate;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDate(value)}
                  className={`flex aspect-square min-h-8 items-center justify-center rounded-full text-[12px] leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:text-[13px] ${
                    isBusy
                      ? "bg-[#83105F] text-white"
                      : hasAvailable
                        ? "border border-[#83105F] bg-white text-[#83105F]"
                      : isSelected
                        ? "ring-1 ring-[#83105F] text-[#1C100E]"
                        : currentMonth
                          ? "text-[#1C100E] hover:bg-[#F0E8F0]"
                          : "text-[#1C100E]/25"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="font-montserrat text-[#1C100E] min-[744px]:pl-0">
          <div className="flex items-center justify-between min-[744px]:block">
            <p className="text-[13px] min-[744px]:text-[14px]">{labels.time}</p>
            <div className="flex gap-1 min-[744px]:mt-2 min-[744px]:justify-end">
              <ChevronLeft className="size-4" />
              <ChevronRight className="size-4" />
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 min-[744px]:max-h-[330px] min-[744px]:flex-col min-[744px]:overflow-y-auto min-[744px]:overflow-x-hidden min-[744px]:pr-2">
            {CONSULTATION_TIME_OPTIONS.map((time) => {
              const isBusy = selectedBusyTimes.has(time);
              const isAvailable = selectedAvailableTimes.has(time);
              const isSelected = selectedTimes.includes(time);

              return (
                <button
                  key={time}
                  type="button"
                  disabled={isBusy || isAvailable}
                  onClick={() => toggleTime(time)}
                  title={isBusy ? labels.busyTime : isAvailable ? labels.freeTime : undefined}
                  className={`flex h-8 min-w-[64px] shrink-0 items-center justify-center rounded-[30px] px-4 text-[12px] font-medium min-[744px]:w-full ${
                    isBusy
                      ? "bg-[#83105F] text-white"
                      : isAvailable
                        ? "border border-[#83105F] bg-white text-[#83105F]"
                        : isSelected
                          ? "bg-[#40213F] text-white"
                      : "bg-white text-[#1C100E]"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!selectedTimes.length || isSlotsSaving}
            onClick={() => void handleCreateSlots()}
            className={`${yellowButton} mt-4 flex h-10 w-full items-center justify-center px-4 text-[12px] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isSlotsSaving ? labels.addingSlots : labels.addSlots}
          </button>
          {isSlotsLoading ? (
            <p className="mt-3 text-[11px] text-[#1C100E]/55">{labels.loading}</p>
          ) : null}
          {slotsNotice ? (
            <p className="mt-3 text-[11px] text-[#37A357]">{slotsNotice}</p>
          ) : null}
          {slotsError ? (
            <p className="mt-3 text-[11px] text-[#83105F]">{slotsError}</p>
          ) : null}
          <div className="mt-5 rounded-[18px] bg-white p-3 text-[12px]">
            <p className="font-medium">{labels.availableSlots}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedAvailableSlots.length ? (
                selectedAvailableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => void handleDeleteSlot(slot.id)}
                    disabled={isSlotsSaving}
                    className="rounded-[30px] border border-[#83105F] px-3 py-1 text-[#83105F] disabled:opacity-60"
                    aria-label={`${labels.deleteSlot} ${slot.time}`}
                  >
                    {slot.time} ×
                  </button>
                ))
              ) : (
                <span className="text-[#1C100E]/55">{labels.noAvailableSlots}</span>
              )}
            </div>
          </div>
        </div>

        <img
          src="/sunForPersonalOfice.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none z-0 mx-auto hidden w-[180px] opacity-70 min-[1023px]:mt-24 min-[1023px]:block min-[1420px]:w-[220px] min-[1900px]:w-[240px]"
        />
      </div>
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

function FavoriteContentCard({
  item,
  language,
}: {
  item: FavoriteContentItem;
  language: "ua" | "en";
}) {
  const kindLabel =
    language === "en"
      ? { event: "Event", article: "Article", video: "Video" }[item.kind]
      : { event: "Подія", article: "Стаття", video: "Відео" }[item.kind];

  return (
    <Link
      to={item.href}
      className="relative z-10 block w-full rounded-[18px] bg-white px-5 py-6 text-left font-montserrat text-[#1C100E] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]
      min-[744px]:max-w-[370px] min-[1023px]:max-w-[390px] min-[1420px]:max-w-[410px] min-[1900px]:max-w-[430px]"
    >
      <span className="mb-3 inline-flex rounded-full bg-[#E7C5DA] px-3 py-1 text-[11px] font-medium text-[#83105F]">
        {kindLabel}
      </span>

      <h3 className="text-[17px] font-medium leading-[1.18] min-[744px]:text-[18px]">
        {item.title}
      </h3>

      <div className="mt-5 flex items-center gap-3 text-[12px] text-[#1C100E]">
        <span>{item.likesCount || 0}</span>
        <Heart className="size-4 fill-[#83105F] stroke-[#83105F]" aria-hidden="true" />
        <span>{item.commentsCount || 0}</span>
        <MessageSquare className="size-4" aria-hidden="true" />
        <Bookmark className="size-4 fill-[#83105F] stroke-[#83105F]" aria-hidden="true" />
      </div>

      <p className="mt-5 line-clamp-2 text-[12px] leading-[1.35] text-[#1C100E]/60 min-[744px]:text-[13px]">
        {item.description}
      </p>
    </Link>
  );
}

function FavoritesView({
  labels,
  favoriteItems,
  language,
}: {
  labels: typeof copy.ua;
  favoriteItems: FavoriteContentItem[];
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

      {favoriteItems.length ? (
        <div className="relative z-10 grid gap-4 min-[744px]:justify-start min-[1420px]:gap-6">
          {favoriteItems.map((item) => (
            <FavoriteContentCard
              key={item.key}
              item={item}
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

function SpecialistPlaceholderView({ text }: { text: string }) {
  return (
    <section className="mx-auto mt-9 flex min-h-[245px] w-full flex-col items-center justify-center px-4 text-center font-montserrat text-[13px] text-[#1C100E]/60 min-[744px]:max-w-[684px] min-[744px]:min-h-[330px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[1260px] min-[1900px]:max-w-[1180px]">
      <img
        src="/sunForPersonalOfice.png"
        alt=""
        aria-hidden="true"
        className="w-[172px] opacity-90 min-[744px]:w-[250px] min-[1023px]:w-[280px] min-[1900px]:w-[300px]"
      />
      <p className="sr-only">{text}</p>
    </section>
  );
}

function SpecialistDetailLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p className="text-[12px] leading-[1.28] text-[#1C100E] min-[744px]:text-[13px]">
      <span className="font-medium">{label}</span> {value}
    </p>
  );
}

function SpecialistDocumentCard({
  document,
  onPreview,
}: {
  document: CabinetDocument;
  onPreview: (document: CabinetDocument) => void;
}) {
  const isImage = /\.(?:png|jpe?g|webp|gif)(?:$|[?#])/i.test(document.fileUrl);
  const content = (
    <span className="flex h-[116px] w-[96px] shrink-0 snap-start items-center justify-center rounded-[14px] border border-[#B34D8D] bg-[#F8F8F8] p-3 transition-transform hover:-translate-y-0.5 min-[744px]:h-[132px] min-[744px]:w-[112px] min-[1023px]:h-[140px] min-[1023px]:w-[120px] min-[1900px]:h-[148px] min-[1900px]:w-[126px]">
      <img
        src={isImage ? document.fileUrl : "/document.png"}
        alt={document.title}
        className={`h-full w-full ${isImage ? "rounded-[8px] object-cover" : "object-contain"}`}
      />
    </span>
  );

  return (
    <button
      type="button"
      onClick={() => onPreview(document)}
      className="shrink-0 snap-start rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
      aria-label={document.title}
    >
      {content}
    </button>
  );
}

function SpecialistAboutView({
  profile,
  documents,
  labels,
  onPreviewDocument,
}: {
  profile: CabinetProfile;
  documents: CabinetDocument[];
  labels: typeof copy.ua;
  onPreviewDocument: (document: CabinetDocument) => void;
}) {
  const displayName = profile.fullName || labels.fallbackName;
  const displayDocuments = documents.slice(0, 3);

  return (
    <section className="mx-auto flex w-full flex-col items-center rounded-[22px] bg-[#F8F8F8] px-4 py-7 font-montserrat text-[#1C100E] min-[744px]:max-w-[640px] min-[744px]:px-14 min-[744px]:py-9 min-[1023px]:max-w-[720px] min-[1420px]:max-w-[760px] min-[1900px]:max-w-[880px] min-[1900px]:px-22">
      <div className="relative h-[112px] w-[112px] shrink-0 min-[744px]:h-[118px] min-[744px]:w-[118px] min-[1420px]:h-[126px] min-[1420px]:w-[126px]">
        <img
          src={profile.avatar}
          alt={displayName}
          className="h-full w-full rounded-full object-cover"
        />
        <span className="absolute right-0 bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E8DCE8]">
          <Camera className="h-3.5 w-3.5 text-[#1C100E]" />
        </span>
      </div>

      <h1 className="mt-4 text-center text-[18px] font-medium leading-[1.2] min-[744px]:text-[20px]">
        {displayName}
      </h1>

      <div className="mt-5 flex w-full max-w-[430px] flex-col gap-4 text-left min-[1900px]:max-w-[520px]">
        <SpecialistDetailLine
          label={labels.emailLabel}
          value={profile.email || labels.emailMissing}
        />
        <SpecialistDetailLine
          label={labels.phoneLabel}
          value={profile.phone || labels.phoneMissing}
        />
        <SpecialistDetailLine
          label={labels.workSchedule}
          value={profile.workHours || "(з 09:00 до 18:00)"}
        />
        <SpecialistDetailLine
          label={labels.cityLabel}
          value={profile.city || labels.cityMissing}
        />
        <SpecialistDetailLine
          label={labels.educationLabel}
          value={profile.education || labels.educationMissing}
        />
        <SpecialistDetailLine
          label={labels.specializationLabel}
          value={profile.profession || labels.specializationMissing}
        />
        <SpecialistDetailLine
          label={labels.experienceLabel}
          value={profile.experience || labels.experienceMissing}
        />
        <SpecialistDetailLine
          label={`${labels.about}:`}
          value={profile.about || labels.aboutMissing}
        />

        <div>
          <p className="text-[12px] font-medium leading-[1.28] min-[744px]:text-[13px]">
            {labels.documentsLabel}
          </p>
          {displayDocuments.length ? (
            <div className="mt-3 w-full max-w-[252px] overflow-hidden min-[744px]:max-w-[290px] min-[1023px]:max-w-[360px] min-[1420px]:max-w-none">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 min-[744px]:gap-5 min-[1420px]:overflow-visible">
                {displayDocuments.map((document) => (
                  <SpecialistDocumentCard
                    key={document.id}
                    document={document}
                    onPreview={onPreviewDocument}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[12px] text-[#1C100E]/60">
              {labels.documentsEmpty}
            </p>
          )}
        </div>
      </div>

      <Link
        to="/profile/specialist/edit"
        className={`${yellowButton} mt-6 flex h-11 w-full max-w-[290px] items-center justify-center text-[13px] min-[744px]:max-w-[350px] min-[1900px]:max-w-[430px]`}
      >
        {labels.edit}
      </Link>
    </section>
  );
}

function AboutView({ profile, labels }: { profile: CabinetProfile; labels: typeof copy.ua }) {
  const personalDetails = [
    { label: labels.emailLabel, value: profile.email || labels.emailMissing },
    { label: labels.phoneLabel, value: profile.phone || labels.phoneMissing },
    { label: labels.cityLabel, value: profile.city || labels.cityMissing },
    {
      label: labels.birthDateLabel,
      value: profile.birthDate ? normalizeDate(profile.birthDate) : labels.birthDateMissing,
    },
  ];

  return (
    <section className="mx-auto mt-10 w-full rounded-[22px] bg-[#F8F8F8] px-6 py-8 font-montserrat text-[#1C100E] min-[744px]:max-w-[684px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[742px] min-[1900px]:max-w-[1028px]">
      <h2 className="text-[18px] font-medium">{labels.about}</h2>
      <div className="mt-5 grid gap-3 text-[13px] leading-[1.35] text-[#1C100E]/75 min-[744px]:grid-cols-2">
        {personalDetails.map((item) => (
          <SpecialistDetailLine
            key={item.label}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
      <div className="mt-4">
        <SpecialistDetailLine
          label={`${labels.about}:`}
          value={profile.about || labels.aboutMissing}
        />
      </div>
    </section>
  );
}

export function UserCabinetPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const labels = useMemo(
    () => (isEnglishLanguage(i18n.language) ? copy.en : copy.ua),
    [i18n.language],
  );

  const [profile, setProfile] = useState<CabinetProfile | null>(null);
  const [appointments, setAppointments] = useState<CabinetAppointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<CabinetAppointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<CabinetAppointment[]>([]);
  const [documents, setDocuments] = useState<CabinetDocument[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<CabinetTab>("appointments");
  const [selectedAppointment, setSelectedAppointment] = useState<CabinetAppointment | null>(null);
  const [previewDocument, setPreviewDocument] = useState<CabinetDocument | null>(null);
  const [cancelAppointment, setCancelAppointment] = useState<CabinetAppointment | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<CabinetAppointment | null>(null);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState("");
  const [appointmentMutationError, setAppointmentMutationError] = useState("");
  const [isAppointmentFilterLoading, setIsAppointmentFilterLoading] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const language = isEnglishLanguage(i18n.language) ? "en" : "ua";

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (!isCabinetTab(requestedTab)) return;

    const specialistOnlyTab =
      requestedTab === "calendar" || requestedTab === "history";
    if (profile && profile.profileKind !== "specialist" && specialistOnlyTab) {
      setActiveTab("appointments");
      return;
    }

    setActiveTab(requestedTab);
  }, [profile, searchParams]);

  const handleTabChange = (tab: CabinetTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const loadFavoriteItems = async () => {
    const [serverItems, cachedFavoriteItems] = await Promise.all([
      getCurrentUserFavoriteContentItems(language).catch(() => []),
      Promise.resolve(readFavoriteContentItems()),
    ]);

    return mergeFavoriteContentItems(cachedFavoriteItems, serverItems);
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadCabinet = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [data, favorites] = await Promise.all([
          getUserCabinetData(controller.signal),
          loadFavoriteItems(),
        ]);
        setProfile(data.profile);
        setAppointments(data.appointments);
        setAllAppointments(data.appointments);
        setCompletedAppointments(data.completedAppointments);
        setDocuments(data.documents);
        setFavoriteItems(favorites);
      } catch {
        setError(labels.loadError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCabinet();

    return () => controller.abort();
  }, [labels.loadError, language]);

  useEffect(() => {
    let isMounted = true;

    const refreshFavorites = () => {
      void loadFavoriteItems().then((items) => {
        if (isMounted) setFavoriteItems(items);
      });
    };

    window.addEventListener(FAVORITES_CHANGED_EVENT, refreshFavorites);
    window.addEventListener("storage", refreshFavorites);

    return () => {
      isMounted = false;
      window.removeEventListener(FAVORITES_CHANGED_EVENT, refreshFavorites);
      window.removeEventListener("storage", refreshFavorites);
    };
  }, [language]);

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

  const isSpecialist = profile.profileKind === "specialist";
  const specialistId = Number(profile.specialistProfileId || profile.id);
  const isSpecialistAbout = isSpecialist && activeTab === "about";

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file || isAvatarSaving) return;

    setIsAvatarSaving(true);
    setError("");

    try {
      const needsProfile =
        profile.profileKind === "specialist"
          ? !profile.specialistProfileId
          : !profile.userProfileId;

      if (needsProfile) {
        navigate(profile.profileKind === "specialist" ? "/profile/specialist/edit" : "/profile/edit");
        return;
      }

      const uploadedAvatar = await updateProfileAvatar(profile, file);
      const previewUrl = uploadedAvatar || URL.createObjectURL(file);
      setProfile((current) => (current ? { ...current, avatar: previewUrl } : current));
      notifyAuthChanged();
    } catch (error) {
      console.error(error);
      setError(labels.loadError);
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handleSpecialistAppointmentFilterChange = async (
    query: AppointmentFilterRequest = {},
  ) => {
    const { localClientKey, localClientName, localDateKey, ...apiQuery } = query;
    const hasLocalFallback = Boolean(localClientKey || localClientName || localDateKey);
    const localQuery = { localClientKey, localClientName, localDateKey };

    setAppointmentMutationError("");
    setIsAppointmentFilterLoading(true);

    try {
      const nextAppointments = await getCabinetAppointments(apiQuery);
      const filteredAppointments =
        hasLocalFallback && nextAppointments.length === 0
          ? filterAppointmentsLocally(allAppointments, localQuery)
          : nextAppointments;

      setAppointments(filteredAppointments);

      if (!apiQuery.user && !apiQuery.date && !apiQuery.completed) {
        setAllAppointments(nextAppointments);
      }
    } catch (error) {
      console.error(error);
      if (hasLocalFallback) {
        setAppointments(filterAppointmentsLocally(allAppointments, localQuery));
      } else {
        setAppointmentMutationError(labels.loadError);
      }
    } finally {
      setIsAppointmentFilterLoading(false);
    }
  };

  const handleCancelSpecialistAppointment = async () => {
    if (cancellingAppointmentId || !cancelAppointment) return;

    setCancellingAppointmentId(cancelAppointment.id);
    setAppointmentMutationError("");

    const result = await cancelConsultationAppointment(cancelAppointment.id);

    if (result.status === "success") {
      setAppointments((items) => items.filter((item) => item.id !== cancelAppointment.id));
      setAllAppointments((items) => items.filter((item) => item.id !== cancelAppointment.id));
      setCompletedAppointments((items) =>
        items.filter((item) => item.id !== cancelAppointment.id),
      );
      setCancelAppointment(null);
    } else {
      setAppointmentMutationError(labels.cancelAppointmentError);
    }

    setCancellingAppointmentId("");
  };

  const handleRescheduledSpecialistAppointment = (
    appointmentId: string,
    slot: ConsultationSlot,
  ) => {
    setAppointments((items) =>
      items.map((item) =>
        item.id === appointmentId
          ? { ...item, date: slot.date, time: slot.time, startsAt: slot.startsAt }
          : item,
      ),
    );
    setAllAppointments((items) =>
      items.map((item) =>
        item.id === appointmentId
          ? { ...item, date: slot.date, time: slot.time, startsAt: slot.startsAt }
          : item,
      ),
    );
    setRescheduleAppointment(null);
  };

  const handleRepeatAppointment = (appointment: CabinetAppointment) => {
    if (!appointment.specialistId) return;

    navigate(`/specialists/${appointment.specialistId}?consultation=1`);
  };

  return (
    <section className={`${pageMaxWidth} pt-4 pb-16 min-[744px]:pt-0 min-[1023px]:pt-8 min-[1420px]:pt-20 min-[1900px]:pt-24`}>
      {isSpecialistAbout ? (
        <SpecialistAboutView
          profile={profile}
          documents={documents}
          labels={labels}
          onPreviewDocument={setPreviewDocument}
        />
      ) : (
        <ProfileCard
          profile={profile}
          labels={labels}
          activeTab={activeTab}
          onAbout={() => handleTabChange("about")}
          onAvatarChange={handleAvatarChange}
          isAvatarSaving={isAvatarSaving}
        />
      )}

      <CabinetTabs
        labels={labels}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isSpecialist={isSpecialist}
      />

      {activeTab === "appointments" ? (
        isSpecialist ? (
          <SpecialistAppointmentsView
            appointments={appointments}
            filterSourceAppointments={allAppointments}
            labels={labels}
            cancellingId={cancellingAppointmentId}
            error={appointmentMutationError}
            isFiltering={isAppointmentFilterLoading}
            onFilterChange={(query) => void handleSpecialistAppointmentFilterChange(query)}
            onCancel={(appointment) => {
              setAppointmentMutationError("");
              setCancelAppointment(appointment);
            }}
            onReschedule={setRescheduleAppointment}
          />
        ) : (
          <AppointmentsView
            appointments={appointments}
            completedAppointments={completedAppointments}
            labels={labels}
            onCancelOrReschedule={setSelectedAppointment}
            onRepeat={handleRepeatAppointment}
          />
        )
      ) : activeTab === "calendar" ? (
        <SpecialistCalendarView
          appointments={appointments}
          labels={labels}
          language={i18n.language}
          specialistId={Number.isFinite(specialistId) ? specialistId : 0}
        />
      ) : activeTab === "history" ? (
        <SpecialistPlaceholderView text={labels.historyEmpty} />
      ) : activeTab === "favorites" ? (
        <FavoritesView
          labels={labels}
          favoriteItems={favoriteItems}
          language={language}
        />
      ) : isSpecialist ? (
        <SpecialistPlaceholderView text={labels.about} />
      ) : (
        <AboutView profile={profile} labels={labels} />
      )}

      <CancelAppointmentDialog
        appointment={selectedAppointment}
        labels={labels}
        onClose={() => setSelectedAppointment(null)}
      />

      <DocumentPreviewDialog
        document={previewDocument}
        language={i18n.language}
        onOpenChange={(open) => {
          if (!open) setPreviewDocument(null);
        }}
      />

      <RescheduleAppointmentDialog
        open={Boolean(rescheduleAppointment)}
        appointment={rescheduleAppointment}
        specialistId={Number.isFinite(specialistId) ? specialistId : 0}
        language={i18n.language}
        onOpenChange={(open) => {
          if (!open) setRescheduleAppointment(null);
        }}
        onRescheduled={handleRescheduledSpecialistAppointment}
      />

      <CancelConsultationDialog
        open={Boolean(cancelAppointment)}
        appointment={cancelAppointment}
        language={i18n.language}
        isSubmitting={Boolean(cancellingAppointmentId)}
        error={appointmentMutationError}
        onOpenChange={(open) => {
          if (!open && !cancellingAppointmentId) {
            setCancelAppointment(null);
            setAppointmentMutationError("");
          }
        }}
        onConfirm={() => void handleCancelSpecialistAppointment()}
      />
    </section>
  );
}
