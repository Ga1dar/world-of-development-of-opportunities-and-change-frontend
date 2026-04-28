import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSpecialist, type Specialist } from "../../api/specialists";

type TextSectionProps = {
  title: string;
  items: string[];
};

function DetailRow({ title, items }: TextSectionProps) {
  if (!items.length) return null;

  return (
    <div
      className="grid gap-2 sm:grid-cols-[150px_1fr]
       sm:gap-8 min-[1420px]:grid-cols-[150px_1fr]
       min-[1420px]:gap-7 min-[1900px]:grid-cols-[184px_1fr]
        min-[1900px]:gap-10">
      <h2
        className="font-montserrat text-[14px] font-normal 
        leading-[1.35] text-[#1C100E] sm:text-[15px]
         min-[1420px]:text-[14px] min-[1900px]:text-[18px]">
        {title}
      </h2>

      <div
        className="space-y-1 font-montserrat text-[14px] 
        font-normal leading-[1.35] text-[#1C100E]
        sm:text-[15px] min-[1420px]:text-[14px]
        min-[1900px]:text-[18px]"
      >
        {items.map((item) => (
          <p key={item}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export function SpecialistProfil() {
  const { id } = useParams();
  const { i18n, t } = useTranslation();
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!id) return;

    getSpecialist(id)
      .then((item) => {
        if (!isMounted) return;
        setSpecialist(item);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isUkrainian = i18n.language === "ua" || i18n.language === "uk";

  const localized = useMemo(() => {
    if (!specialist) return null;

    const workExperience =
      isUkrainian && specialist.experienceUa.length
        ? specialist.experienceUa
        : !isUkrainian && specialist.experienceEn.length
          ? specialist.experienceEn
          : isUkrainian
            ? ["10 років"]
            : ["10 years"];

    return {
      name: isUkrainian ? specialist.nameUa : specialist.nameEn,
      role: isUkrainian ? specialist.roleUa : specialist.roleEn,
      about: isUkrainian ? specialist.aboutUa : specialist.aboutEn,
      education: isUkrainian ? specialist.educationUa : specialist.educationEn,
      experience: workExperience,
      specializations: isUkrainian
        ? specialist.specializationsUa
        : specialist.specializationsEn,
    };
  }, [isUkrainian, specialist]);

  if (isLoading) {
    return (
      <section
        className="flex min-h-[50vh] items-center 
        justify-center bg-secondary px-5 py-16
        font-montserrat text-[18px] text-[#1C100E]"
      >
        {t("specialistsLoading")}
      </section>
    );
  }

  if (!specialist || !localized) {
    return (
      <section
        className="flex min-h-[50vh] flex-col items-center 
        justify-center gap-8 bg-secondary px-5 py-16
        text-center font-montserrat text-[#1C100E]"
      >
        <h1
          className="text-[28px] font-medium sm:text-[36px]">
          {t("specialistProfileNotFound")}
        </h1>

        <Link
          to="/specialists"
          className="inline-flex h-12 min-w-55 items-center 
          justify-center rounded-full bg-[#FFD22E] 
          px-8 text-[16px] font-medium text-[#1C100E] 
          shadow-[0_4px_12px_rgba(255,210,46,0.45)] 
          transition hover:bg-[#FFE16C] focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-[#40213F]"
        >
          {t("specialistBackToList")}
        </Link>
      </section>
    );
  }

  return (
    <article
      className="bg-secondary pb-20 pt-2
       font-montserrat text-[#1C100E]
        sm:pb-24 sm:pt-8 min-[1420px]:pb-20 min-[1420px]:pt-9
         min-[1900px]:pb-40 min-[1900px]:pt-0">
      <div className="mx-auto w-full max-w-295 px-5 sm:px-10 min-[1420px]:max-w-217 min-[1420px]:px-0 min-[1900px]:max-w-295">
        {hasError && (
          <p className="mt-4 text-[14px] text-[#7A1E1E]">
            {t("specialistsLoadError")}
          </p>
        )}

        <div
          className="grid gap-8 lg:grid-cols-[1fr_460px] 
          lg:items-start min-[1420px]:grid-cols-[398px_398px]
          min-[1420px]:gap-18 min-[1900px]:grid-cols-[571px_585px]
           min-[1900px]:gap-6">
          <div
            className="order-2 lg:order-1 min-[1420px]:pt-0 min-[1900px]:pt-14.5">
            <h1
              className="text-center text-[28px] font-medium 
              leading-[1.2] sm:text-[32px] min-[1420px]:text-[24px]
               min-[1900px]:text-[32px]"
            >
              {localized.name}
            </h1>

            <p
              className="mt-2 text-center text-[16px] 
              font-normal leading-[1.35] min-[1420px]:mx-auto
              min-[1420px]:max-w-82.5 min-[1420px]:text-[14px]
               min-[1900px]:max-w-115 min-[1900px]:text-[18px]">
              {localized.role}
            </p>

            <div
              className="mt-8 space-y-6 min-[1420px]:mt-7 
              min-[1420px]:space-y-6 min-[1900px]:mt-8
              min-[1900px]:space-y-8">
              <DetailRow
                title={t("specialistHigherEducation")}
                items={localized.education}
              />
              <DetailRow
                title={t("specialistSpecialty")}
                items={localized.specializations}
              />
              <DetailRow
                title={t("specialistWorkExperience")}
                items={localized.experience}
              />
            </div>
          </div>

          <div
            className="order-1 flex flex-col items-center lg:order-2
             min-[1420px]:items-start min-[1420px]:pt-0
             min-[1900px]:pt-7"
          >
            <img
              src={specialist.photo}
              alt={localized.name}
              className="h-80 w-full max-w-115 rounded-[10px] 
              object-cover sm:h-105 min-[1420px]:h-99.5! 
              min-[1420px]:w-99.5! min-[1420px]:max-w-none min-[1900px]:h-146.25! 
              min-[1900px]:w-146.25!"
            />

            <button
              type="button"
              className="mt-5 inline-flex h-12 w-full max-w-115 items-center 
              justify-center rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b 
              from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] px-8 
              text-center font-montserrat text-[16px] font-medium 
              text-[#1C100E] shadow-btn transition hover:brightness-105 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] 
              min-[1420px]:h-10.5 min-[1420px]:w-99.5 min-[1420px]:max-w-none min-[1420px]:text-[12px] 
              min-[1900px]:h-14.25 min-[1900px]:w-146.25 min-[1900px]:text-lg"
            >
              {t("specialistConsultation")}
            </button>

            <p
              className="mt-5 w-full max-w-115 text-[12px] leading-[1.35] text-[#1C100E] 
              min-[1420px]:w-99.5 min-[1420px]:max-w-none min-[1420px]:text-[10px]
              min-[1900px]:w-146.25 min-[1900px]:text-[12px]"
            >
              {t("specialistConsultationNote")}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
