import { type ReactNode } from "react";

type EducatorsEventContentProps = {
  displayTitle: string;
  paragraphs: string[];
  renderEventActions: () => ReactNode;
  renderEducatorsImage: (className: string, showCaption?: boolean) => ReactNode;
  renderEducatorsText: (items: string[], className?: string) => ReactNode;
  renderEducatorsRegistrationButton: (className?: string) => ReactNode;
  renderEducatorsComments: () => ReactNode;
};

const eventBodyClass =
  "font-montserrat text-[16px] font-normal leading-[1.4] tracking-normal text-[#2D302D] min-[744px]:text-[18px]";

const educatorsHeadingClass =
  "font-montserrat text-[24px] font-medium leading-[1.2] tracking-normal text-[#1C100E] min-[744px]:text-[20px] min-[1023px]:text-[24px] min-[1420px]:text-[32px] min-[1420px]:leading-[1.4] min-[1900px]:text-[40px]";

export function EducatorsEventContent({
  displayTitle,
  paragraphs,
  renderEventActions,
  renderEducatorsImage,
  renderEducatorsText,
  renderEducatorsRegistrationButton,
  renderEducatorsComments,
}: EducatorsEventContentProps) {
  const topParagraphs = paragraphs.slice(0, 5);
  const mobileBodyParagraphs = paragraphs.slice(1);
  const desktopFullRows = paragraphs.slice(5, 7);
  const offerParagraphs = paragraphs.slice(7, 11);
  const registrationParagraphs = paragraphs.slice(11, 16);
  const supportParagraph = paragraphs[16];
  const projectParagraph = paragraphs[17];

  return (
    <section
      className="bg-secondary px-4 pb-10 font-montserrat
      min-[744px]:px-10 min-[1023px]:px-16
      min-[1420px]:px-20 min-[1900px]:px-[45px] min-[1900px]:pb-14"
    >
      <article
        className="mx-auto w-full max-w-[358px]
        min-[744px]:max-w-[664px] min-[1023px]:max-w-[894px]
        min-[1420px]:max-w-[1280px] min-[1900px]:max-w-[1890px]"
      >
        <div className="min-[744px]:hidden">
          <h1 className={educatorsHeadingClass}>{displayTitle}</h1>
          {renderEventActions()}
          {renderEducatorsText(paragraphs.slice(0, 1), "mt-6")}
          {renderEducatorsImage("mt-6 h-[259px] w-[358px]")}
          {renderEducatorsText(mobileBodyParagraphs, "mt-5")}
          <div className="mt-7">
            {renderEducatorsRegistrationButton("max-w-none")}
          </div>
          {renderEducatorsComments()}
        </div>

        <div className="hidden min-[744px]:block min-[1023px]:hidden">
          <div className="grid grid-cols-[320px_1fr] gap-x-5">
            {renderEducatorsImage("h-[239px] w-[320px]")}
            <div>
              <h1 className={educatorsHeadingClass}>{displayTitle}</h1>
              {renderEventActions()}
              {renderEducatorsText(paragraphs.slice(0, 1), "mt-3 text-[12px]")}
            </div>
          </div>

          {renderEducatorsText(mobileBodyParagraphs, "mt-4 text-[14px]")}
          <div className="mt-6 mb-10 flex justify-end">
            {renderEducatorsRegistrationButton("max-w-[320px]")}
          </div>
          {renderEducatorsComments()}
        </div>

        <div className="hidden min-[1023px]:block min-[1420px]:hidden">
          <div className="grid grid-cols-[436px_432px] gap-x-[26px]">
            {renderEducatorsImage("h-[395px] w-[436px]")}
            <div>
              <h1 className={educatorsHeadingClass}>{displayTitle}</h1>
              {renderEventActions()}
              {renderEducatorsText(topParagraphs, "mt-3 text-[16px]")}
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {desktopFullRows.map((paragraph) => (
              <p key={paragraph} className={`${eventBodyClass} min-[1023px]:text-[16px]`}>
                {paragraph}
              </p>
            ))}
            <div className={`space-y-1 ${eventBodyClass} min-[1023px]:text-[16px]`}>
              {offerParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className={`space-y-1 ${eventBodyClass} min-[1023px]:text-[16px]`}>
              {registrationParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {supportParagraph && (
              <p className={`${eventBodyClass} min-[1023px]:text-[16px]`}>{supportParagraph}</p>
            )}
            <div>
              {projectParagraph && (
                <p className={`${eventBodyClass} min-[1023px]:text-[16px]`}>{projectParagraph}</p>
              )}
              <div className="mt-6 flex justify-end">
                {renderEducatorsRegistrationButton("max-w-[309px]")}
              </div>
            </div>
          </div>

          {renderEducatorsComments()}
        </div>

        <div className="hidden min-[1420px]:mt-[120px] min-[1420px]:block min-[1900px]:hidden">
          <div className="grid grid-cols-[628px_628px] gap-x-6">
            {renderEducatorsImage("h-[370px] w-[628px]", false)}
            <div>
              <h1 className={educatorsHeadingClass}>{displayTitle}</h1>
              {renderEventActions()}
              {renderEducatorsText(topParagraphs, "mt-4 text-[16px]")}
            </div>
          </div>

          <div className="mt-2 space-y-4">
            {desktopFullRows.map((paragraph) => (
              <p key={paragraph} className={`${eventBodyClass} min-[1420px]:text-[16px]`}>
                {paragraph}
              </p>
            ))}
            <div className={`${eventBodyClass} space-y-4 min-[1420px]:text-[16px]`}>
              {offerParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className={`${eventBodyClass} space-y-4 min-[1420px]:text-[16px]`}>
              {registrationParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {supportParagraph && (
              <p className={`${eventBodyClass} min-[1420px]:text-[16px]`}>
                {supportParagraph}
              </p>
            )}
            <div className="grid grid-cols-[1fr_411px] items-end gap-x-6">
              {projectParagraph && (
                <p className={`${eventBodyClass} min-[1420px]:text-[16px]`}>
                  {projectParagraph}
                </p>
              )}
              {renderEducatorsRegistrationButton("max-w-[411px]")}
            </div>
          </div>

          {renderEducatorsComments()}
        </div>

        <div className="hidden min-[1900px]:mt-[120px] min-[1900px]:block">
          <div className="grid grid-cols-[894px_891px] gap-x-[31px]">
            {renderEducatorsImage("h-[444px] w-[894px]", false)}
            <div>
              <h1 className={educatorsHeadingClass}>{displayTitle}</h1>
              {renderEventActions()}
              {renderEducatorsText(topParagraphs, "mt-4 text-[16px]")}
            </div>
          </div>

          <div className="mt-[21px] space-y-3">
            <div className={`${eventBodyClass} space-y-1 min-[1900px]:text-[16px]`}>
              {offerParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className={`${eventBodyClass} space-y-1 min-[1900px]:text-[16px]`}>
              {registrationParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {supportParagraph && (
              <p className={`${eventBodyClass} min-[1900px]:text-[16px]`}>
                {supportParagraph}
              </p>
            )}
            <div className="grid grid-cols-[1fr_340px] items-end gap-x-8">
              {projectParagraph && (
                <p className={`${eventBodyClass} min-[1900px]:text-[16px]`}>
                  {projectParagraph}
                </p>
              )}
              {renderEducatorsRegistrationButton("max-w-[340px]")}
            </div>
          </div>

          {renderEducatorsComments()}
        </div>
      </article>
    </section>
  );
}
