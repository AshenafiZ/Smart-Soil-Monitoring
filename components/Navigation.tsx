'use client';
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, Menu } from "lucide-react";
import { auth } from "@/lib/firebase";

type Role = "main" | "admin" | "farmer" | "advisor" | "technician";
type NavItem = { name: string; path: string; label: string };
type User = { name?: string; image?: string; role?: Role };

const roles: Record<Role, NavItem[]> = {
  main: [
    { name: "home", path: "/", label: "Home" },
    { name: "about", path: "/about", label: "About" },
    { name: "contact", path: "/contact", label: "Contact" },
    { name: "signup", path: "/signup", label: "Sign Up" },
  ],
  admin: [
    { name: "dashboard", path: "/admin", label: "Dashboard" },
    { name: "device_management", path: "/admin/devices", label: "Devices" },
    { name: "user_management", path: "/admin/users", label: "Users" },
    { name: "map", path: "/admin/map", label: "Map" },
    { name: "logs", path: "/admin/logs", label: "Logs" },
  ],
  farmer: [
    { name: "live_tracker", path: "/farmer/tracker", label: "Live Tracker" },
    { name: "home", path: "/farmer/home", label: "Home" },
    { name: "map", path: "/farmer/map", label: "Map" },
    { name: "alert", path: "/farmer/alerts", label: "Alerts" },
  ],
  advisor: [
    { name: "recommendations", path: "/advisor/recommendations", label: "Recommendations" },
    { name: "reports", path: "/advisor/reports", label: "Reports" },
    { name: "map", path: "/advisor/map", label: "Map" },
  ],
  technician: [
    { name: "add_device", path: "/technician/add-device", label: "Add Device" },
    { name: "remove_device", path: "/technician/remove-device", label: "Remove Device" },
    { name: "maintain_device", path: "/technician/maintain-device", label: "Maintain Device" },
    { name: "map", path: "/technician/map", label: "Map" },
  ],
};

type NavigationProps = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
};

const Navigation = ({ isAuthenticated, user, isLoading }: NavigationProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const userRole = user?.role || "main";
  const navItems = roles[userRole] || roles.main;

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user"); // Clear cached user data
    setOpen(false);
    window.location.href = "/login";
    
  };

  if (isLoading) {
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg z-[70]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="https://res.cloudinary.com/djnyauytw/image/upload/v1748036500/ssmm_hsuhdd.png"
                alt="Smart Soil Monitoring Logo"
                width={48}
                height={48}
                className="rounded-full border border-gray-200 dark:border-gray-600"
                priority
              />
              <Link href="/" className="text-xl font-bold ml-2">
                Smart Soil Monitoring
              </Link>
            </div>
            <div>Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg z-[70]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image
              src="https://res.cloudinary.com/djnyauytw/image/upload/v1748036500/ssmm_hsuhdd.png"
              alt="Smart Soil Monitoring Logo"
              width={48}
              height={48}
              className="rounded-full border border-gray-200 dark:border-gray-600 hover:scale-105 transition-transform duration-200"
              priority
            />
            <Link href="/" className="text-xl font-bold ml-2">
              Smart Soil Monitoring
            </Link>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.path ? "bg-blue-900 text-white" : "hover:bg-blue-700 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image} alt="User Avatar" />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[60]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="text-blue-600 bg-white hover:bg-gray-100">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-white text-gray-900 z-[110]">
                <SheetTitle></SheetTitle>
                <div className="flex flex-col space-y-4 mt-4">
                  <Link href="/" className="text-lg font-bold flex items-center">
                    <Image
                      src="https://res.cloudinary.com/djnyauytw/image/upload/v1748036500/ssmm_hsuhdd.png"
                      alt="Smart Soil Monitoring Logo"
                      width={48}
                      height={48}
                      className="rounded-full border border-gray-200 dark:border-gray-600 hover:scale-105 transition-transform duration-200"
                      priority
                    />
                    <div className="text-xl font-bold ml-2">Smart Soil Monitoring</div>
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        pathname === item.path ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100 hover:text-blue-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <Button variant="outline" onClick={handleLogout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout 
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="flex items-center w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;