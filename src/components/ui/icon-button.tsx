import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SharedProps = {
  "aria-label": string;
  pressed?: boolean;
  className?: string;
  children: ReactNode;
};

type IconButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "aria-label"> & {
    href?: undefined;
  };

type IconButtonAsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href" | "aria-label"> & {
    href: string;
  };

export type IconButtonProps = IconButtonAsButton | IconButtonAsLink;

/**
 * Circular icon-only affordance (search, share, bookmark, menu). Always
 * requires an aria-label since it never carries visible text.
 */
export function IconButton({ pressed, className, children, href, ...rest }: IconButtonProps) {
  const classes = cn("icon-btn", className);

  if (href) {
    return (
      <Link href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={pressed}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
