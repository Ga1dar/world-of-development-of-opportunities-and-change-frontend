import { type ReactNode } from "react";

const eventHeadingClass =
  "font-montserrat text-[24px] font-medium leading-[1.2] tracking-normal text-[#1C100E] min-[744px]:text-[32px] min-[744px]:leading-[1.4] min-[1900px]:text-[40px]";

const eventBodyClass =
  "font-montserrat text-[16px] font-normal leading-[1.4] tracking-normal text-[#2D302D] min-[744px]:text-[18px]";

const workshopImages = [
  "/rectangle 3.png",
  "/Rectangle ???????.png",
  "/workshop3.png",
  "/workshop4.jpg",
  "/workshop5.jpg",
  "/workshop6.jpg",
];

type WorkshopEventContentProps = {
  copyLang: "ua" | "en";
  displayTitle: string;
  paragraphs: string[];
  renderEventActions: () => ReactNode;
  renderComments: () => ReactNode;
};

export function WorkshopEventContent({
  copyLang,
  displayTitle,
  paragraphs,
  renderEventActions,
  renderComments,
}: WorkshopEventContentProps) {
    const introParagraphs = paragraphs.slice(0, 5);
    const tabletIntroParagraphs = paragraphs.slice(0, 2);
    const regularMeetingsLine =
      copyLang === "en"
        ? "*Such meetings can become regular, and certainly more than once."
        : "*Такі зустрічі можуть бути регулярними — звичайно не раз.";
    const tabletBridgeParagraphs = paragraphs.slice(2, 5);
    const continuationParagraphs = [regularMeetingsLine, ...paragraphs.slice(5, 11)];
    const afterSecondImageParagraphs = continuationParagraphs;
    const secondHeadingParagraphs = paragraphs.slice(11, 13);
    const secondBodyParagraphs = paragraphs.slice(13);

    return (
      <>
        <section
          className="bg-secondary px-4 pb-10
          pt-3 font-montserrat min-[744px]:px-10
          min-[1023px]:px-16 min-[1420px]:px-20
          min-[1900px]:pb-14 min-[1900px]:pt-33.5">
          <article
            className="mx-auto w-full max-w-89.5 min-[744px]:max-w-166
            min-[1023px]:max-w-223.75 min-[1420px]:max-w-322.5 min-[1900px]:max-w-440">
            <div
              className="grid gap-y-4 min-[1023px]:hidden min-[1023px]:grid-cols-[436px_410px]
              min-[1023px]:gap-x-6 min-[1023px]:gap-y-5 min-[1900px]:grid
              min-[1900px]:grid-cols-[585px_minmax(0,1fr)] min-[1900px]:gap-x-7">
              <div className="order-1 min-[744px]:text-[32px] min-[1023px]:order-2">
                <h1 className={eventHeadingClass}>{displayTitle}</h1>
                {renderEventActions()}
                <div className={`mt-4 hidden space-y-3 min-[1023px]:block min-[1420px]:hidden ${eventBodyClass}`}>
                  {tabletIntroParagraphs.map((paragraph) => (
                    <p key={paragraph} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className={`mt-4 hidden space-y-1 min-[1420px]:block ${eventBodyClass}`}>
                  {introParagraphs.map((paragraph) => (
                    <p key={paragraph} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <img
                src={workshopImages[0]}
                alt={displayTitle}
                className="order-2 h-58 w-full rounded-lg
                object-cover min-[390px]:w-89.5
                min-[744px]:h-93.5 min-[744px]:w-166 min-[744px]:mt-2 min-[1023px]:order-1
                min-[1023px]:h-97 min-[1023px]:w-109
                min-[1420px]:h-109 min-[1420px]:w-157
                min-[1900px]:h-89.75 min-[1900px]:w-146.25"
              />

              <div className={`order-3 space-y-2 min-[744px]:mt-2 min-[1023px]:hidden ${eventBodyClass}`}>
                {introParagraphs.map((paragraph) => (
                  <p key={paragraph} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div
                className="order-4 grid gap-4
                min-[1023px]:order-5
                min-[1023px]:row-span-2 min-[1023px]:mt-0 min-[1023px]:gap-5
                min-[1420px]:mt-0
                min-[1900px]:grid-cols-2 min-[1900px]:gap-7">
                {workshopImages.slice(1, 3).map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt=""
                    className={`h-58 w-full rounded-lg
                      object-cover min-[390px]:w-89.5
                      min-[744px]:mt-2
                      min-[744px]:w-166 min-[1023px]:h-77.75
                      min-[1023px]:w-102.5 min-[1420px]:w-157 ${
                      index === 0
                        ? "min-[744px]:h-73 min-[1023px]:h-77.75 min-[1420px]:h-73 min-[1900px]:h-89.75 min-[1900px]:w-146.25"
                        : "hidden min-[1023px]:block min-[1023px]:h-77.75 min-[1420px]:h-73 min-[1900px]:h-89.75 min-[1900px]:w-146.25"
                    }`}
                  />
                ))}
              </div>

              <div
                className={`order-5 space-y-1 min-[744px]:mt-4 min-[744px]:space-y-3 min-[1023px]:hidden ${eventBodyClass}`}>
                {afterSecondImageParagraphs.map((paragraph) => (
                  <p key={paragraph} className="">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div
                className={`hidden min-[1023px]:order-3 min-[1023px]:col-span-2 min-[1023px]:block min-[1420px]:hidden min-[1023px]:space-y-1 ${eventBodyClass}`}>
                {tabletBridgeParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div
                className={`hidden min-[1023px]:order-4 min-[1023px]:block min-[1420px]:hidden min-[1023px]:space-y-1 ${eventBodyClass}`}>
                {continuationParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {secondHeadingParagraphs.length > 0 && (
                  <div
                    className="mt-4 space-y-1 font-medium text-[#1C100E] text-[20px] min-[1022px]:mt-8">
                    {secondHeadingParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
                {secondBodyParagraphs.length > 0 && (
                  <div className="mt-2 space-y-1 ">
                    {secondBodyParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
              <div
                className={`hidden min-[1420px]:order-3 min-[1420px]:block min-[1420px]:space-y-3 ${eventBodyClass} `}>
                {afterSecondImageParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="hidden min-[1420px]:mt-30 min-[1420px]:block min-[1900px]:hidden">
              <div className="grid grid-cols-[628px_628px] gap-x-6 gap-y-5 min-[1420px]:space-y-3">
                <img
                  src={workshopImages[0]}
                  alt={displayTitle}
                  className="h-109 w-157 rounded-lg object-cover"
                />

                <div>
                  <h1 className={eventHeadingClass}>{displayTitle}</h1>
                  {renderEventActions()}
                  <div className={`mt-4 space-y-1 min-[1420px]:space-y-3 ${eventBodyClass}`}>
                    {introParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 font-montserrat text-[18px] font-normal leading-[1.48] tracking-normal text-[#2D302D]">
                  {afterSecondImageParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <img
                  src={workshopImages[1]}
                  alt=""
                  className="h-73 w-157 rounded-lg object-cover"
                />

                <div>
                  {secondHeadingParagraphs.length > 0 && (
                    <div className="space-y-1 font-montserrat text-[24px] font-medium leading-[1.2] text-[#1C100E] min-[1420px]:space-y-3">
                      {secondHeadingParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                  {secondBodyParagraphs.length > 0 && (
                    <div className={`mt-3 space-y-1 min-[1420px]:space-y-3 ${eventBodyClass}`}>
                      {secondBodyParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>

                <img
                  src={workshopImages[2]}
                  alt=""
                  className="h-73 w-157 rounded-lg object-cover"
                />
              </div>

              <div className="mt-6 grid grid-cols-[411px_411px_411px] gap-x-7">
                {workshopImages.slice(3, 6).map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt=""
                    className="h-77.75 w-102.75 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>

            <div className="hidden min-[1023px]:block min-[1420px]:hidden">
              <div className="grid grid-cols-[436px_437px] gap-x-5.5">
                <img
                  src={workshopImages[0]}
                  alt={displayTitle}
                  className="h-97 w-109 rounded-lg object-cover"
                />

                <div>
                  <h1 className={eventHeadingClass}>{displayTitle}</h1>
                  {renderEventActions()}
                  <div className={`mt-3 space-y-1 ${eventBodyClass}`}>
                    {tabletIntroParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`mt-3 space-y-1 min-[1022px]:space-y-2 min-[1420px]:space-y-3 ${eventBodyClass}`}>
                {tabletBridgeParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-[436px_437px] gap-x-5.5">
                <div className={`space-y-1 min-[1022px]:mt-3 min-[1022px]:space-y-2 min-[1420px]:space-y-3 ${eventBodyClass}`}>
                  {continuationParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {secondHeadingParagraphs.length > 0 && (
                    <div className="mt-4 space-y-1 font-medium text-[#1C100E] text-[20px] leading-[1.2] min-[1022px]:mt-8 min-[1420px]:space-y-3">
                      {secondHeadingParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                  {secondBodyParagraphs.length > 0 && (
                    <div className="mt-2 space-y-1 min-[1022px]:mt-6">
                      {secondBodyParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-y-5">
                  {workshopImages.slice(1, 3).map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt=""
                      className="h-73 w-109.25 rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[437px_437px] gap-x-5.25">
                {workshopImages.slice(3, 5).map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt=""
                    className="h-73 w-109.25 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>

            {secondHeadingParagraphs.length > 0 && (
              <div className={`max-w-160 font-montserrat min-[1023px]:hidden min-[1900px]:block`}>
                <div
                  className="mt-6 space-y-1 font-medium text-[#1C100E]
                   text-[20px] min-[744px]:text-[24px] min-[744px]:mt-8">
                  {secondHeadingParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {secondBodyParagraphs.length > 0 && (
                  <div className="mt-3 space-y-1 min-[1900px]:hidden">
                    {secondBodyParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              className="mt-5 grid grid-cols-2 gap-4 min-[744px]:gap-6
              min-[1023px]:hidden min-[1900px]:grid min-[1420px]:grid-cols-3
              min-[1900px]:grid-cols-3 min-[1900px]:gap-7">
              {workshopImages.slice(2).map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  className={`h-26.25 w-full rounded-lg
                    object-cover min-[390px]:w-42.75 min-[744px]:h-45
                    min-[744px]:w-[320px] min-[1023px]:h-77.75 min-[1023px]:w-102.5
                    min-[1420px]:h-77.75 min-[1420px]:w-102.75 ${
                    index === 0
                      ? "min-[1023px]:hidden"
                    : index === 3
                        ? "min-[1023px]:hidden min-[1420px]:block"
                        : ""
                  } min-[1900px]:h-89.75 min-[1900px]:w-146.25`}
                />
              ))}
            </div>

            {renderComments()}
          </article>
        </section>
      </>
    );
}
