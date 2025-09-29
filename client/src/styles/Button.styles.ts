import type { ButtonSize, GradientVariant } from "../types";

export const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

export const variantStyles: Record<GradientVariant, string> = {
    // 🌸 Purple
    purpleLight: "bg-gradient-to-r from-purple-300 to-indigo-400 text-white focus:ring-purple-300",
    purpleDark: "bg-gradient-to-r from-purple-600 to-indigo-800 text-white focus:ring-purple-600",

    // 🌿 Green
    greenLight: "bg-gradient-to-r from-green-300 to-emerald-400 text-white focus:ring-green-300",
    greenDark: "bg-gradient-to-r from-green-600 to-emerald-800 text-white focus:ring-green-600",

    // 🔥 Red
    redLight: "bg-gradient-to-r from-red-300 to-pink-400 text-white focus:ring-red-300",
    redDark: "bg-gradient-to-r from-red-600 to-pink-800 text-white focus:ring-red-600",
};

export const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
};
