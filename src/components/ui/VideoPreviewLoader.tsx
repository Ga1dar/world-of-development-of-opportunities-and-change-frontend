type VideoPreviewLoaderProps = {
  className?: string;
};

export function VideoPreviewLoader({ className = "" }: VideoPreviewLoaderProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[#F7EEF4] ${className}`}
      role="status"
      aria-label="Loading video preview"
    >
      <div className="absolute inset-0 animate-pulse bg-linear-to-r from-[#F7EEF4] via-[#EADBE7] to-[#F7EEF4]" />
      <span
        className="relative size-8 rounded-full border-2 border-[#E7C5DA] border-t-[#9A176B] animate-spin min-[744px]:size-10"
        aria-hidden="true"
      />
      <span className="sr-only">Loading video preview</span>
    </div>
  );
}
