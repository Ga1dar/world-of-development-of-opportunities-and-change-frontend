import { useEffect, useState } from "react";
import {
  canCreateEventsFromStoredToken,
  canCurrentUserCreateEvents,
} from "../api/auth";

export function useCanCreateEvents() {
  const [canCreateEvents, setCanCreateEvents] = useState(
    canCreateEventsFromStoredToken,
  );

  useEffect(() => {
    let isMounted = true;

    const updateCanCreateEvents = () => {
      setCanCreateEvents(canCreateEventsFromStoredToken());

      canCurrentUserCreateEvents().then((value) => {
        if (isMounted) setCanCreateEvents(value);
      });
    };

    updateCanCreateEvents();
    window.addEventListener("auth-changed", updateCanCreateEvents);
    window.addEventListener("storage", updateCanCreateEvents);

    return () => {
      isMounted = false;
      window.removeEventListener("auth-changed", updateCanCreateEvents);
      window.removeEventListener("storage", updateCanCreateEvents);
    };
  }, []);

  return canCreateEvents;
}
