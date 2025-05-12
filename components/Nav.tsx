'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, Menu, Map } from "lucide-react";
import { auth, db } from "@/app/firebase/config";

type Role = "main" | "admin" | "farmer" | "advisor" | "technician";
type NavItem = {
  name: string;
  path: string;
  label: string;
};
type User = {
  name?: string;
  image?: string;
  role?: Role;
};

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

const Navigation = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role>("main");
  const [user, setUser] = useState<User>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAuthenticated(true);
          setUserRole(userData.role || "main");
          setUser({
            name: userData.name || firebaseUser.displayName || "User",
            image: userData.image || firebaseUser.photoURL || "/default-avatar.png",
            role: userData.role || "main",
          });
        } else {
          setIsAuthenticated(false);
          setUserRole("main");
          setUser({});
        }
      } else {
        setIsAuthenticated(false);
        setUserRole("main");
        setUser({});
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setOpen(false);
    window.location.href = "/login";
  };

  const navItems = roles[userRole] || roles.main;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg z-[70]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Map className="h-8 w-8 mr-2" />
            <Link href="/" className="text-xl font-bold">
              Smart Soil Monitoring
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? "bg-blue-900 text-white"
                    : "hover:bg-blue-700 hover:text-white"
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
                      <AvatarImage src={user.image} alt="User Avatar" />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
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

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-white text-gray-900 z-[110]">
                <div className="flex flex-col space-y-4 mt-4">
                  <Link href="/" className="text-lg font-bold flex items-center">
                    <Map className="h-6 w-6 mr-2" />
                    Smart Soil Monitoring
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        pathname === item.path
                          ? "bg-blue-100 text-blue-900"
                          : "hover:bg-gray-100 hover:text-blue-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center"
                    >
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