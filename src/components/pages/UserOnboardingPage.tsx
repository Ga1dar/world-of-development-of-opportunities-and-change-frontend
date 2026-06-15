import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyAuthChanged } from "../../api/auth";
import {
  getCurrentCabinetProfile,
  type CabinetProfile,
} from "../../api/userCabinet";
import { Home } from "./Home";
import { UserOnboardingForm } from "./UserOnboardingForm";

export function UserOnboardingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CabinetProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getCurrentCabinetProfile(controller.signal)
      .then((currentProfile) => {
        if (!currentProfile || currentProfile.profileKind !== "user") {
          navigate("/", { replace: true });
          return;
        }

        if (currentProfile.userProfileId) {
          navigate("/profile", { replace: true });
          return;
        }

        setProfile(currentProfile);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        navigate("/", { replace: true });
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [navigate]);

  const completeProfile = () => {
    notifyAuthChanged();
    navigate("/", { replace: true });
  };

  const closeOnboarding = () => {
    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="hidden min-[744px]:block">
        <Home />
      </div>

      <div
        className="relative z-[210] flex min-h-[510px] w-full items-start justify-center bg-[#F0E8F0] px-4 pb-7 pt-0
        min-[744px]:fixed min-[744px]:inset-0 min-[744px]:z-[240] min-[744px]:items-start min-[744px]:overflow-y-auto min-[744px]:bg-[#1C100E]/30 min-[744px]:px-8 min-[744px]:py-12 min-[744px]:backdrop-blur-[1px]
        min-[1023px]:items-center min-[1023px]:py-14 min-[1420px]:py-16 min-[1900px]:py-20"
      >
        {isLoading ? (
          <div className="mt-16 font-montserrat text-[14px] text-[#1C100E]/65">
            Завантажуємо профіль...
          </div>
        ) : profile ? (
          <UserOnboardingForm
            profile={profile}
            onComplete={completeProfile}
            onClose={closeOnboarding}
          />
        ) : null}
      </div>
    </>
  );
}
