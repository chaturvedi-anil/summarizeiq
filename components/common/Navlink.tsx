"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NavLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const pathName = usePathname();
  const isActive =
    pathName === href || (href !== "/" && pathName.startsWith(href));

  return (
    <Link
      className={cn(
        "transitions-colors text-md duration-200 text-gray-600 hover:text-red-500",
        className,
        isActive && "text-rose-500"
      )}
      href={href}
    >
      {children}
    </Link>
  );
};
