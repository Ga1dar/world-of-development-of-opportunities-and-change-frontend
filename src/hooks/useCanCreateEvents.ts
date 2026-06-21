import { useEffect, useState } from "react";
import {
  canCurrentUserManageEventCategories,
  canCreateEventsFromStoredToken,
  canCurrentUserCreateEvents,
  canManageEventCategoriesFromStoredToken,
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

export function useCanManageEventCategories() {
  const [canManageEventCategories, setCanManageEventCategories] = useState(
    canManageEventCategoriesFromStoredToken,
  );

  useEffect(() => {
    let isMounted = true;

    const updateCanManageEventCategories = () => {
      setCanManageEventCategories(canManageEventCategoriesFromStoredToken());

      canCurrentUserManageEventCategories().then((value) => {
        if (isMounted) setCanManageEventCategories(value);
      });
    };

    updateCanManageEventCategories();
    window.addEventListener("auth-changed", updateCanManageEventCategories);
    window.addEventListener("storage", updateCanManageEventCategories);

    return () => {
      isMounted = false;
      window.removeEventListener("auth-changed", updateCanManageEventCategories);
      window.removeEventListener("storage", updateCanManageEventCategories);
    };
  }, []);

  return canManageEventCategories;
}
