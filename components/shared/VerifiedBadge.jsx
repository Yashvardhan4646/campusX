import { Check } from "lucide-react";

export default function VerifiedBadge({
    size = "sm",
    verificationType = "id_card",
    className = "",
}) {
    const config = {
        sm: {
            badge: "w-4 h-4",
            icon: "w-2.5 h-2.5",
        },
        md: {
            badge: "w-5 h-5",
            icon: "w-3 h-3",
        },
        lg: {
            badge: "w-6 h-6",
            icon: "w-3.5 h-3.5",
        },
    };

    const { badge, icon } = config[size] || config.sm;

    const title =
        verificationType === "college_email"
            ? "Verified via College Email"
            : "Verified Student";

    return (
        <span
            title={title}
            className={`inline-flex items-center ${className}`}
        >
            <span
                className={`
                    ${badge}
                    inline-flex items-center justify-center
                    rounded-full
                    bg-gradient-to-b
                    from-sky-400
                    via-sky-500
                    to-blue-600
                    border border-white/20
                    shadow-[0_2px_8px_rgba(37,99,235,0.45)]
                    transition-transform duration-200
                    hover:scale-105
                `}
            >
                <Check
                    className={`${icon} text-white`}
                    strokeWidth={3.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </span>
        </span>
    );
}