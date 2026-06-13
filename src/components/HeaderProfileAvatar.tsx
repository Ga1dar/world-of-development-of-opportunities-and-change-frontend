import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAccessToken } from "../api/auth";
import { getCurrentCabinetProfile } from "../api/userCabinet";

const FALLBACK_AVATAR = "/user.jpg";

export function HeaderProfileAvatar() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken()),
  );
  const [avatar, setAvatar] = useState(FALLBACK_AVATAR);

  useEffect(() => {
    let controller: AbortController | null = null;

    const updateProfile = () => {
      const authenticated = Boolean(getAccessToken());
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        controller?.abort();
        setAvatar(FALLBACK_AVATAR);
        return;
      }

      controller?.abort();
      controller = new AbortController();

      void getCurrentCabinetProfile(controller.signal)
        .then((profile) => {
          if (profile?.avatar) setAvatar(profile.avatar);
        })
        .catch(() => undefined);
    };

    updateProfile();
    window.addEventListener("auth-changed", updateProfile);
    window.addEventListener("storage", updateProfile);

    return () => {
      controller?.abort();
      window.removeEventListener("auth-changed", updateProfile);
      window.removeEventListener("storage", updateProfile);
    };
  }, []);

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/profile"
      aria-label="Особистий кабінет"
      className="relative z-100 my-auto flex h-8 w-8 shrink-0 overflow-hidden rounded-full
        ring-1 ring-[#402940]/15 transition hover:ring-2 hover:ring-[#83105F]
        min-[744px]:h-10 min-[744px]:w-10 min-[1420px]:mt-7.75"
    >
      <img
        src={avatar}
        alt=""
        className="h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = FALLBACK_AVATAR;
        }}
      />
    </Link>
  );
}
