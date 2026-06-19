import { Link } from "react-router-dom";
import Icon from "./Icon";

/**
 * ServiceCard — Premium bento grid card for homepage services
 *
 * Displays a service with icon, title, description, and "Xem chi tiết" link.
 *
 * Accessibility:
 *  - Entire card is a link (<a>) with descriptive aria-label
 *  - Group hover transitions for visual feedback
 *  - Focus-visible ring on the card
 *  - Icon container uses role="presentation"
 *  - Animated gradient top border on hover
 *
 * @param {string} to           - Route path
 * @param {string} icon         - Material Symbol name
 * @param {string} title        - Card title (Vietnamese)
 * @param {string} description  - Card description
 * @param {string} ariaLabel    - Full accessible label
 * @param {string} iconBg       - Tailwind bg class for icon container
 * @param {string} iconColor    - Tailwind text class for icon
 * @param {string} iconBorder   - Tailwind border class for icon container
 */
export default function ServiceCard({
  to,
  icon,
  title,
  description,
  ariaLabel,
  iconBg = "bg-primary-fixed",
  iconColor = "text-primary",
  iconBorder = "border-primary-container",
}) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel || `${title}: ${description}`}
      className="service-card glass-card group
                 rounded-2xl p-8 h-full flex flex-col items-start gap-6
                 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest
                 theme-transition hover:-translate-y-1"
    >
      {/* Icon container */}
      <div
        className={`w-14 h-14 ${iconBg} ${iconColor} rounded-xl
                    flex items-center justify-center
                    border ${iconBorder}
                    group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300`}
        role="presentation"
      >
        <Icon name={icon} size="text-3xl" />
      </div>

      {/* Text content */}
      <div className="space-y-3">
        <h3
          className="text-headline-md text-on-surface dark:text-inverse-on-surface
                     group-hover:text-primary dark:group-hover:text-inverse-primary
                     transition-colors duration-300 font-bold"
        >
          {title}
        </h3>
        <p className="text-body-md text-on-surface-variant dark:text-surface-dim leading-relaxed">
          {description}
        </p>
      </div>

      {/* "View details" link indicator */}
      <div
        className="mt-auto pt-4 flex items-center gap-2
                   text-primary dark:text-inverse-primary
                   font-semibold text-label-lg
                   group-hover:gap-3 transition-all duration-300"
      >
        <span>Xem chi tiết</span>
        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20
                        flex items-center justify-center
                        group-hover:bg-primary group-hover:text-on-primary
                        dark:group-hover:bg-inverse-primary dark:group-hover:text-primary
                        transition-all duration-300">
          <Icon name="arrow_forward" size="text-lg" />
        </div>
      </div>
    </Link>
  );
}
