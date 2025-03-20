'use client';

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";

type Role = "admin" | "farmer" | "advisor" | "technician";

type NavItem = {
  name: string;
  path: string;
};

type User = {
  name?: string;
  image?: string;
};

const roles: Record<Role, NavItem[]> = {
  admin: [
    { name: "dashboard", path: "/admin/dashboard" },
    { name: "device_management", path: "/admin/devices" },
    { name: "user_management", path: "/admin/users" },
    { name: "map", path: "/admin/map" },
    { name: "logs", path: "/admin/logs" },
  ],
  farmer: [
    { name: "live_tracker", path: "/farmer/tracker" },
    { name: "home", path: "/farmer/home" },
    { name: "map", path: "/farmer/map" },
    { name: "alert", path: "/farmer/alerts" },
  ],
  advisor: [
    { name: "recommendations", path: "/advisor/recommendations" },
    { name: "reports", path: "/advisor/reports" },
    { name: "map", path: "/advisor/map" },
  ],
  technician: [
    { name: "add_device", path: "/technician/add-device" },
    { name: "remove_device", path: "/technician/remove-device" },
    { name: "maintain_device", path: "/technician/maintain-device" },
  ],
};

type LayoutProps = {
  role?: Role;
  user?: User;
  children: React.ReactNode;
};

export default function Layout({ role = "farmer", user, children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <Navigation role={role} user={user} />
      <main className="flex-1 overflow-auto p-4 mt-16">{children}</main>
    </div>
  );
}

function Navigation({ role = "farmer", user }: { role: Role; user?: User }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white shadow-md p-4 flex flex-row justify-between items-center fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-4">
        <h2>Smart Soil Monitoring</h2>
        <LanguageSwitcher />
      </div>
      <div className="hidden lg:flex items-center gap-4">
        <Sidebar role={role} pathname={pathname} t={t} />
      </div>
      <div className="lg:hidden flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">☰</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-4">
            <Sidebar role={role} pathname={pathname} t={t} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user?.image || "/default-avatar.png"} alt="User Avatar" />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user?.name || "Guest"}</span>
      </div>
    </nav>
  );
}

type SidebarProps = {
  role: Role;
  pathname: string;
  t: (key: string) => string | { title: string; description?: string };
};

function Sidebar({ role, pathname, t }: SidebarProps) {
  const navigationTitle = t("navigation");
  const title = typeof navigationTitle === "string" ? navigationTitle : navigationTitle.title;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 underline">{title}</h2>
      <Separator />
      <ul className="mt-4">
        {roles[role]?.map((item) => {
          const translatedItem = t(item.name);
          const menuTitle = typeof translatedItem === "string" ? translatedItem : translatedItem.title;
          return (
            <li key={item.path}>
              <Link href={item.path}>
                <span
                  className={`block p-2 rounded-md transition-colors ${
                    pathname === item.path ? "underline font-semibold text-primary hover:text-accent" : "hover:bg-gray-200"
                  }`}
                >
                  {menuTitle}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
