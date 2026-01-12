"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

export default function NavLink({ href, children, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
