import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        // Glassmorphism container styles
        "mx-auto grid max-w-7xl grid-cols-1 gap-6 md:auto-rows-[18rem] md:grid-cols-3 p-8 rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        // Glassy card styles
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg hover:shadow-2xl transition duration-300 hover:scale-[1.03] hover:border-cyan-300/60 hover:bg-white/40 dark:hover:bg-white/20 hover:backdrop-blur-2xl",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-2 font-sans font-bold text-neutral-700 dark:text-neutral-100">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-700 dark:text-neutral-200">
          {description}
        </div>
      </div>
    </div>
  );
};
