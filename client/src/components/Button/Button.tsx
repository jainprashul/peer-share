import React from "react";
import { baseStyles, sizeStyles, variantStyles } from "../../styles/Button.styles";
import type { ButtonSize, GradientVariant } from "../../types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: GradientVariant;
    size?: ButtonSize;
    outline?: boolean;
    className?: string;
}
export const Button: React.FC<ButtonProps> = ({
    variant = "purpleLight",
    size = "md",
    outline = false,
    className = "",
    children,
    ...props
}) => {
    let classes = baseStyles;

    if (outline) {
        classes += ` border-2 border-transparent bg-clip-text text-transparent ${variantStyles[variant]}`;
    } else {
        classes += ` ${variantStyles[variant]}`;
    }

    classes += ` ${sizeStyles[size]}`;

    if (className) {
        classes += ` ${className}`;
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};
