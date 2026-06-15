import { VideoPreviewLoader } from "./VideoPreviewLoader";

type VideoPreviewProps = {
  title: string;
  videoUrl?: string;
  coverImage?: string;
  className?: string;
};

export function VideoPreview({
  title,
  videoUrl = "",
  coverImage = "",
  className = "",
}: VideoPreviewProps) {
  if (coverImage) {
    return (
      <img
        src={coverImage}
        alt={title}
        className={`object-cover ${className}`}
      />
    );
  }

  if (videoUrl) {
    return (
      <video
        preload="auto"
        muted
        playsInline
        tabIndex={-1}
        aria-label={title}
        className={`pointer-events-none bg-[#F7EEF4] object-cover ${className}`}
      >
        <source src={videoUrl} />
      </video>
    );
  }

  return <VideoPreviewLoader className={className} />;
}
