"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth } from "@/firebase";
import { LogOut, User, Users, Trophy, ClipboardEdit } from "lucide-react";
import Link from "next/link";
import placeholderImages from "@/lib/placeholder-images.json";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === "user_avatar_1");

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();


  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email[0].toUpperCase();
  };
  
  if (isUserLoading) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
             {user?.photoURL && <AvatarImage src={user.photoURL} alt={user?.displayName || "User"} />}
             {!user?.photoURL && userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user?.email || "User"} data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.displayName || user?.email?.split('@')[0] || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/teams">
              <Users className="mr-2 h-4 w-4" />
              <span>My Teams</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tournaments">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Tournaments</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuGroup>
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
             <DropdownMenuItem asChild>
                <Link href="/admin/scoring">
                    <ClipboardEdit className="mr-2 h-4 w-4" />
                    <span>Scoring</span>
                </Link>
            </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
