import { type ReactNode } from "react";

type GenericEventContentProps = {
  title: string;
  description: string;
  images: string[];
  renderEventActions: () => ReactNode;
  renderComments: () => ReactNode;
  renderRegistrationButton: (className?: string) => ReactNode;
};

const truncateDescription = (description: string) => {
  const cleanDescription = description.trim().replace(/\s+/g, " ");
  if (cleanDescription.length <= 300) return cleanDescription;

  const clipped = cleanDescription.slice(0, 300);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 240 ? lastSpace : 300).trim()}...`;
};

export function GenericEventContent({
  title,
  description,
  images,
  renderEventActions,
  renderComments,
  renderRegistrationButton,
}: GenericEventContentProps) {
  const [heroImage, ...galleryImages] = images.slice(0, 6);
  const body = truncateDescription(description);

  return (
    <section
      className="bg-secondary px-4 pb-10
      pt-3 font-montserrat min-[744px]:px-10
      min-[1023px]:px-16 min-[1420px]:px-20
      min-[1900px]:px-[84px] min-[1908px]:px-20 min-[1900px]:pb-14 min-[1900px]:pt-[120px]"
    >
      <article
        className="mx-auto w-full max-w-[358px] min-[744px]:max-w-[664px]
        min-[1023px]:max-w-[894px] min-[1420px]:max-w-[1280px]
        min-[1900px]:max-w-[1816px]"
      >
        <div
          className="grid gap-y-4 min-[1023px]:grid-cols-[436px_1fr]
          min-[1023px]:gap-x-6 min-[1420px]:grid-cols-[628px_1fr]
          min-[1900px]:grid-cols-[894px_1fr] min-[1900px]:gap-x-[31px]"
        >
          {heroImage && (
            <img
              src={heroImage}
              alt={title}
              className="order-2 h-[232px] w-full rounded-lg object-cover
              min-[744px]:h-[374px] min-[1023px]:order-1 min-[1023px]:h-[388px]
              min-[1420px]:h-[436px] min-[1900px]:h-[444px]"
            />
          )}

          <div className="order-1 min-[1023px]:order-2">
            <h1
              className="font-montserrat text-[24px] font-medium leading-[1.2]
              tracking-normal text-[#1C100E] min-[744px]:text-[32px]
              min-[744px]:leading-[1.4] min-[1900px]:text-[40px]"
            >
              {title}
            </h1>
            {renderEventActions()}
            <p
              className="mt-4 font-montserrat text-[16px] font-normal leading-[1.4]
              tracking-normal text-[#2D302D] min-[744px]:text-[18px]"
            >
              {body}
            </p>
          </div>
        </div>

        {galleryImages.length > 0 && (
          <div
            className="mt-5 grid grid-cols-2 gap-4 min-[744px]:gap-6
            min-[1023px]:grid-cols-2 min-[1420px]:grid-cols-3
            min-[1900px]:gap-7"
          >
            {galleryImages.map((image) => (
              <img
                key={image}
                src={image}
                alt=""
                className="h-[105px] w-full rounded-lg object-cover
                min-[744px]:h-[180px] min-[1023px]:h-[311px]
                min-[1420px]:h-[311px] min-[1900px]:h-[359px]"
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end min-[1420px]:mt-8">
          {renderRegistrationButton("max-w-[320px] min-[1420px]:max-w-[411px] min-[1900px]:max-w-[340px]")}
        </div>

        {renderComments()}
      </article>
    </section>
  );
}
