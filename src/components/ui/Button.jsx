import Icon from "./Icon";

/**
 * Button — Accessible button component with design system variants
 *
 * Variants (from DESIGN.md):
 *  - "primary"   : Filled blue, white text, 56px min-height
 *  - "secondary" : Outlined, 2px border, primary text
 *  - "danger"    : Red SOS style, bold
 *  - "ghost"     : Transparent, subtle hover
 *
 * All variants ensure 48px min touch target (WCAG 2.2 AAA).
 */

const variantStyles = {
  primary:
    "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-lg hover:shadow-primary/20 shimmer-btn font-bold",
  secondary:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary-fixed hover:text-on-primary-fixed font-semibold",
  danger:
    "bg-gradient-to-r from-secondary to-[#930009] text-on-secondary hover:shadow-lg hover:shadow-secondary/20 shimmer-btn font-bold",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-variant font-medium",
};

export default function Button({
  children,
  variant = "primary",
  icon,
  iconFilled = false,
  ariaLabel,
  ariaPressed,
  disabled = false,
  onClick,
  className = "",
  type = "button",
  as: Component = "button",
  href,
  ...rest
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    px-6 py-3 rounded-lg
    min-h-btn
    transition-all duration-150
    active:scale-95
    focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-container focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    theme-transition
  `;

  const props = {
    className: `${baseClasses} ${variantStyles[variant] || variantStyles.primary} ${className}`.trim(),
    "aria-label": ariaLabel,
    "aria-pressed": ariaPressed,
    disabled: Component === "button" ? disabled : undefined,
    "aria-disabled": Component !== "button" && disabled ? "true" : undefined,
    onClick: disabled ? undefined : onClick,
    type: Component === "button" ? type : undefined,
    href: Component === "a" ? href : undefined,
    role: Component !== "button" ? "button" : undefined,
    tabIndex: disabled ? -1 : 0,
    ...rest,
  };

  return (
    <Component {...props}>
      {icon && <Icon name={icon} filled={iconFilled} size="text-xl" />}
      {children}
    </Component>
  );
}
