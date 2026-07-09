import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAccessToken } from "../../api/auth";
import {
  getSpecialist,
  type Specialist,
  type SpecialistDocument,
} from "../../api/specialists";
import { ConsultationDialog } from "./ConsultationDialog";
import { DocumentPreviewDialog } from "./DocumentPreviewDialog";

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

function SpecialistDocumentCard({
  document,
  onPreview,
}: {
  document: SpecialistDocument;
  onPreview: (document: SpecialistDocument) => void;
}) {
  const isImage = /\.(?:png|jpe?g|webp|gif)(?:$|[?#])/i.test(document.fileUrl);

  return (
    <button
      type="button"
      onClick={() => onPreview(document)}
      className="flex h-[100px] w-[82px] shrink-0 snap-start items-center justify-center
      rounded-[10px] border border-[#B34D8D] bg-[#F0E8F0] p-2 transition
      hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-[#40213F] min-[390px]:h-[116px] min-[390px]:w-[96px]
      min-[744px]:h-[132px] min-[744px]:w-[112px]
      min-[1023px]:h-[150px] min-[1023px]:w-[130px]
      min-[1420px]:h-[154px] min-[1420px]:w-[170px]
      min-[1900px]:h-[326px] min-[1900px]:flex-1 min-[1900px]:p-8"
      aria-label={document.title}
    >
      <img
        src={isImage ? document.fileUrl : "/document.png"}
        alt={document.title}
        className={`h-full w-full ${isImage ? "rounded-[8px] object-cover" : "object-contain"}`}
      />
    </button>
  );
}

function SpecialistDocuments({
  documents,
  label,
  onPreview,
}: {
  documents: SpecialistDocument[];
  label: string;
  onPreview: (document: SpecialistDocument) => void;
}) {
  if (!documents.length) return null;

  return (
    <section className="min-w-0">
      <h2
        className="font-montserrat text-[14px] font-normal leading-[1.35]
        text-[#1C100E] sm:text-[15px] min-[1420px]:text-[14px]
        min-[1900px]:text-[18px]"
      >
        {label}
      </h2>

      <div className="mt-3 w-full overflow-hidden min-[744px]:mt-4">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2
          scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden min-[744px]:gap-6
          min-[1023px]:justify-center min-[1420px]:justify-start
          min-[1900px]:gap-8"
        >
          {documents.map((document) => (
            <SpecialistDocumentCard
              key={document.id}
              document={document}
              onPreview={onPreview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const isPlaceholderDocument = (document: SpecialistDocument) => {
  const normalizedUrl = document.fileUrl.split(/[?#]/)[0].replace(/\\/g, "/").toLowerCase();
  const fileName = normalizedUrl.split("/").filter(Boolean).pop() || "";
  const normalizedTitle = document.title.trim().toLowerCase();

  return (
    !document.fileUrl ||
    fileName === "document.png" ||
    fileName.includes("placeholder") ||
    normalizedTitle === "document"
  );
};

export function SpecialistProfil() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { i18n, t } = useTranslation();
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<SpecialistDocument | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAccessToken()));

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

  useEffect(() => {
    const updateAuthState = () => setIsAuthenticated(Boolean(getAccessToken()));

    updateAuthState();
    window.addEventListener("auth-changed", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener("auth-changed", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  useEffect(() => {
    const shouldOpenConsultation =
      searchParams.get("consultation") === "1" ||
      searchParams.get("book") === "consultation";

    if (!specialist || !shouldOpenConsultation) return;

    setIsConsultationOpen(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("consultation");
    nextParams.delete("book");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, specialist]);

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

  const allDocuments = specialist?.documents || [];
  const uploadedDocuments = allDocuments.filter((document) => !isPlaceholderDocument(document));
  const documents = (uploadedDocuments.length ? uploadedDocuments : allDocuments).slice(0, 3);
  const canToggleDetails = Boolean(localized?.about.length || documents.length);
  const showExtendedDetails = isExpanded || false;

  if (isLoading) {
    return (
      <section
        className="flex min-h-[50vh] items-center 
        justify-center bg-secondary px-5 py-16
        font-montserrat text-[18px] text-[#1C100E] min-[1023px]:px-16"
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
        text-center font-montserrat text-[#1C100E] min-[1023px]:px-16"
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
      className="bg-secondary pb-20 pt-4
       font-montserrat text-[#1C100E]
        sm:pb-24 sm:pt-8 min-[1420px]:pb-20 min-[1420px]:pt-24
         min-[1900px]:pb-40 min-[1900px]:pt-[120px]">
      <div className="mx-auto w-full px-4 min-[744px]:px-15 min-[1023px]:max-w-[900px]
      min-[1023px]:px-16 min-[1420px]:max-w-[1280px] min-[1420px]:px-0
      min-[1900px]:max-w-[1820px]">
        {hasError && (
          <p className="mt-4 text-[14px] text-[#7A1E1E]">
            {t("specialistsLoadError")}
          </p>
        )}

        <div
          className="grid gap-6 min-[744px]:gap-8 min-[1420px]:grid-cols-[minmax(0,760px)_398px]
          min-[1420px]:items-start min-[1420px]:justify-between min-[1420px]:gap-18
          min-[1900px]:grid-cols-[minmax(0,1197px)_585px] min-[1900px]:gap-10">
          <div
            className="order-2 min-[1420px]:order-1 min-[1420px]:pt-0 min-[1900px]:pt-14.5">
            <h1
              className="text-left text-[24px] font-medium leading-[1.2] text-[#402940]
              min-[744px]:text-center min-[744px]:text-[28px]
              min-[1420px]:text-left min-[1420px]:text-[24px]
              min-[1900px]:text-[40px]"
            >
              {localized.name}
            </h1>

            {specialist.phone ? (
              <p
                className="mt-3 text-left text-[14px] font-normal leading-[1.35]
                text-[#4D4C4C] min-[744px]:text-center min-[1420px]:text-left
                min-[1900px]:text-[20px]"
              >
                {t("specialistPhone")} {specialist.phone}
              </p>
            ) : null}

            <p
              className="mt-3 text-left text-[16px] font-normal leading-[1.35]
              text-[#2D302D] min-[744px]:text-center min-[1420px]:text-left
              min-[1420px]:text-[14px] min-[1900px]:text-[24px]">
              {localized.role}
            </p>

            <div
              className="mt-6 space-y-5 min-[744px]:mt-8 min-[744px]:space-y-6
              min-[1420px]:mt-7 min-[1900px]:mt-8 min-[1900px]:space-y-8">
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

            {canToggleDetails && !isExpanded ? (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="ml-auto mt-6 flex h-9 items-center justify-end rounded-[30px]
                px-0 text-right font-montserrat text-[14px] font-medium text-[#1C100E]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]
                min-[744px]:text-[16px] min-[1023px]:hidden"
                aria-expanded={isExpanded}
              >
                {t("specialistReadMore")}
              </button>
            ) : null}

            <div
              className={`${showExtendedDetails ? "block" : "hidden"} mt-6 space-y-5
              min-[1023px]:block min-[1023px]:space-y-6 min-[1420px]:mt-5
              min-[1900px]:mt-6 min-[1900px]:space-y-8`}
            >
              <DetailRow
                title={t("specialistAboutSelf")}
                items={localized.about}
              />

              <SpecialistDocuments
                documents={documents}
                label={t("specialistDocuments")}
                onPreview={setPreviewDocument}
              />

              {isExpanded && canToggleDetails ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="ml-auto flex h-9 items-center justify-end rounded-[30px]
                  px-0 text-right font-montserrat text-[14px] font-medium text-[#1C100E]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]
                  min-[744px]:text-[16px] min-[1023px]:hidden"
                >
                  {t("specialistReadLess")}
                </button>
              ) : null}
            </div>

            <div className="min-[1420px]:hidden">
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="mt-8 mx-auto flex h-10 w-full items-center
                justify-center rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b
                from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] px-8
                text-center font-montserrat text-[14px] font-medium
                text-[#1C100E] shadow-btn transition hover:brightness-105
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]
                min-[744px]:h-12 min-[744px]:max-w-91.25 min-[744px]:text-[16px]
                min-[1023px]:max-w-[760px]"
              >
                {t("specialistConsultation")}
              </button>

              {!isAuthenticated ? (
                <p
                  className="mt-4 w-full text-[12px] leading-[1.35] text-[#1C100E]
                  min-[744px]:mx-auto min-[744px]:max-w-91.25 min-[1023px]:max-w-[760px]"
                >
                  {t("specialistConsultationNote")}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className="order-1 flex flex-col items-center min-[1420px]:order-2
             min-[1420px]:items-start min-[1420px]:pt-0
             min-[1900px]:pt-7"
          >
            <img
              src={specialist.photo}
              alt={localized.name}
              className="h-[345px] w-full max-w-[358px] rounded-[10px] object-cover
              min-[744px]:h-[272px] min-[744px]:w-[272px]
              min-[1023px]:h-[320px] min-[1023px]:w-[320px]
              min-[1420px]:h-99.5! min-[1420px]:w-99.5! min-[1420px]:max-w-none
              min-[1900px]:h-146.25! min-[1900px]:w-146.25!"
            />

            <button
              type="button"
              onClick={() => setIsConsultationOpen(true)}
              className="mt-5 hidden h-12 w-full max-w-115 items-center 
              justify-center rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b 
              from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] px-8 
              text-center font-montserrat text-[16px] font-medium 
              text-[#1C100E] shadow-btn transition hover:brightness-105 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] 
              min-[1420px]:inline-flex
              min-[1420px]:h-10.5 min-[1420px]:w-99.5 min-[1420px]:max-w-none min-[1420px]:text-[12px] 
              min-[1900px]:h-14.25 min-[1900px]:w-146.25 min-[1900px]:text-lg"
            >
              {t("specialistConsultation")}
            </button>

            {!isAuthenticated ? (
              <p
                className="mt-5 hidden w-full max-w-115 text-[12px] leading-[1.35] text-[#1C100E]
                min-[1420px]:block
                min-[1420px]:w-99.5 min-[1420px]:max-w-none min-[1420px]:text-[10px]
                min-[1900px]:w-146.25 min-[1900px]:text-[12px]"
              >
                {t("specialistConsultationNote")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ConsultationDialog
        open={isConsultationOpen}
        onOpenChange={setIsConsultationOpen}
        specialistId={specialist.id}
      />
      <DocumentPreviewDialog
        document={previewDocument}
        language={i18n.language}
        onOpenChange={(open) => {
          if (!open) setPreviewDocument(null);
        }}
      />
    </article>
  );
}
