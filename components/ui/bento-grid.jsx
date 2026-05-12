import { cn } from "@/lib/utils";

export const BentoGrid = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto px-4 md:px-0",
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
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl transition duration-300 shadow-input dark:shadow-none p-6 bg-neutral-900/50 border border-neutral-800 hover:border-primary/50 justify-between flex flex-col space-y-4 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500" />
      
      {header}
      
      <div className="group-hover/bento:translate-x-1 transition duration-300 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50 group-hover/bento:border-primary/50 group-hover/bento:bg-primary/10 transition-all duration-300">
            {icon}
          </div>
          <div className="font-sans font-bold text-neutral-200 group-hover/bento:text-primary transition-colors">
            {title}
          </div>
        </div>
        <div className="font-sans font-normal text-neutral-400 text-sm leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
