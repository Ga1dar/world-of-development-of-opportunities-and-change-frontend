import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getEvents, type EventItem } from "../../api/events.ts";

const EVENTS_PER_PAGE = 4;

export function Events() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";

  const [events, setEvents] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  const getTextField = (event: EventItem, field: "title" | "category") => {
    return event[`${field}_${lang}` as keyof EventItem] as string;
  };

  const getDescription = (event: EventItem) => {
    return event[`description_${lang}` as keyof EventItem] as string[];
  };

  const start = (page - 1) * EVENTS_PER_PAGE;
  const currentEvents = events.slice(start, start + EVENTS_PER_PAGE);

  return (
    <section className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">
        {t("eventsTitle")}
      </h1>

      <div className="flex flex-col gap-6">
        {currentEvents.map((event) => (
          <div key={event.id} className="rounded-[20px] bg-white p-4 shadow">
            <img
              src={event.image}
              alt={getTextField(event, "title")}
              className="mb-4 w-full rounded-2xl"
            />

            <h2 className="text-xl font-semibold">
              {getTextField(event, "title")}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {getDescription(event)[0]}
            </p>

            <span className="mt-3 inline-block text-xs text-purple-600">
              {getTextField(event, "category")}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
        >
          {t("prev")}
        </button>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={start + EVENTS_PER_PAGE >= events.length}
        >
          {t("next")}
        </button>
      </div>
    </section>
  );
}
