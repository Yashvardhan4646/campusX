import { cn } from "@/lib/utils";

export const BentoGrid = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-3 max-w-7xl mx-auto",
        className
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
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-300 shadow-input dark:shadow-none p-4 bg-neutral-900/40 border border-neutral-800/50 hover:border-primary/40 justify-between flex flex-col space-y-3 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500" />
      
      {header}
      
      <div className="group-hover/bento:translate-x-1 transition duration-300 relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-lg bg-neutral-800/30 border border-neutral-700/30 group-hover/bento:border-primary/30 group-hover/bento:bg-primary/10 transition-all duration-300 shrink-0">
            {icon}
          </div>
          <div className="font-sans font-bold text-neutral-200 group-hover/bento:text-primary transition-colors text-sm md:text-base leading-tight">
            {title}
          </div>
        </div>
        <div className="font-sans font-normal text-neutral-400 text-xs md:text-sm leading-snug line-clamp-2">
          {description}
        </div>
      </div>
    </div>
  );
};
