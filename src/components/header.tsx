"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Trophy, Gamepad2, Users, ClipboardList } from "lucide-react";
import { useUser } from "@/firebase";
import { UserNav } from "./user-nav";
import { YUPlaybookIcon } from "./icons";

const navLinks = [
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/live-scores", label: "Live Scores", icon: Gamepad2 },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/coaching", label: "Coaching", icon: ClipboardList },
];

export default function Header() {
  const { user, isUserLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <YUPlaybookIcon className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">YU Playbook</span>
          </Link>
        </div>

        <div className="flex items-center md:hidden">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="p-4">
                <Link href="/" className="flex items-center space-x-2 mb-8">
                   <YUPlaybookIcon className="h-6 w-6 text-primary" />
                   <span className="font-bold font-headline text-lg">YU Playbook</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center space-x-2 text-lg font-medium text-foreground hover:text-primary">
                       <Icon className="h-5 w-5" />
                       <span>{label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="transition-colors hover:text-primary">
                {label}
              </Link>
            ))}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isUserLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <UserNav />
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
