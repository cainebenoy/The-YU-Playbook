import Link from "next/link";
import { Twitter, Instagram, Facebook } from "lucide-react";
import { YUltimateIcon } from "./icons";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <YUltimateIcon className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-bold">Y-Ultimate</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              The unified platform for sports excellence.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-headline font-semibold">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/tournaments" className="text-sm text-muted-foreground hover:text-primary">Tournaments</Link></li>
              <li><Link href="/live-scores" className="text-sm text-muted-foreground hover:text-primary">Live Scores</Link></li>
              <li><Link href="/teams" className="text-sm text-muted-foreground hover:text-primary">Teams</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>

           <div>
            <h3 className="font-headline font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Y-Ultimate Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
