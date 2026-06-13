import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserCabinetData, type CabinetProfile } from "../../api/userCabinet";
import { Home } from "./Home";
import { SpecialistApplicationReview } from "./SpecialistApplicationReview";
import { SpecialistOnboardingForm } from "./SpecialistOnboardingForm";

export function SpecialistOnboardingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CabinetProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getUserCabinetData(controller.signal)
      .then((data) => {
        if (!data.profile || data.profile.profileKind !== "specialist") {
          navigate("/", { replace: true });
          return;
        }

        setProfile(data.profile);
        if (data.profile.specialistProfileId) {
          setShowReview(true);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        navigate("/", { replace: true });
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [navigate]);

  const completeProfile = () => {
    setShowReview(true);
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
        className="relative z-[210] flex min-h-[560px] w-full items-start justify-center bg-[#F0E8F0] px-4 py-5
        min-[744px]:fixed min-[744px]:inset-0 min-[744px]:z-[240] min-[744px]:overflow-y-auto min-[744px]:bg-[#1C100E]/30 min-[744px]:px-8 min-[744px]:py-8 min-[744px]:backdrop-blur-[1px]"
      >
        {isLoading ? (
          <div className="mt-16 font-montserrat text-[14px] text-[#1C100E]/65">
            Завантажуємо профіль...
          </div>
        ) : profile ? (
          showReview ? (
            <SpecialistApplicationReview onClose={closeOnboarding} />
          ) : (
            <SpecialistOnboardingForm
              profile={profile}
              onComplete={completeProfile}
              onClose={closeOnboarding}
            />
          )
        ) : null}
      </div>
    </>
  );
}
