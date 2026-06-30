import { cn } from "@/lib/utils";

export const BentoGrid = ({ children, className }) => {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[14rem] sm:auto-rows-[16rem] gap-4 max-w-7xl mx-auto",
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
}) => {
    return (
        <div
            className={cn(
                "group/bento relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors duration-300 hover:border-muted-foreground/30 dark:border-[#202024] dark:bg-[#0e1014] dark:hover:border-[#2c2c33]",
                className,
            )}
        >
            {/* Header */}
            {header && (
                <div className="relative z-10 mb-4 overflow-hidden rounded-lg">
                    {header}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col">
                <div className="mb-3 flex items-start gap-3">
                    {icon && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#3E63A6]/10 text-[#3E63A6] dark:bg-[#3E63A6] dark:text-[#F2F3F5]">
                            {icon}
                        </div>
                    )}
                    <h3 className="text-sm font-semibold leading-tight text-foreground dark:text-[#F2F3F5] md:text-base">
                        {title}
                    </h3>
                </div>

                <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground dark:text-[#9098A8] md:text-sm">
                    {description}
                </p>
            </div>
        </div>
    );
};
