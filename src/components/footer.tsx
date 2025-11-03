import Link from "next/link";
import { YUPlaybookIcon } from "./icons";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <YUPlaybookIcon className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-bold">YU Playbook</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              The ultimate playbook for sports excellence. Manage tournaments, streamline coaching, and build your team legacy. All in one place.
            </p>
          </div>

          <div>
            <h3 className="font-headline font-semibold">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/tournaments" className="text-sm text-muted-foreground hover:text-primary">Tournaments</Link></li>
              <li><Link href="/live-scores" className="text-sm text-muted-foreground hover:text-primary">Live Scores</Link></li>
              <li><Link href="/schedule" className="text-sm text-muted-foreground hover:text-primary">Schedule</Link></li>
              <li><Link href="/teams/discover" className="text-sm text-muted-foreground hover:text-primary">Discover</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-semibold">My YU</h3>
            <ul className="mt-4 space-y-2">
                <li><Link href="/profile" className="text-sm text-muted-foreground hover:text-primary">Profile</Link></li>
                <li><Link href="/teams" className="text-sm text-muted-foreground hover:text-primary">My Teams</Link></li>
                <li><Link href="/coaching" className="text-sm text-muted-foreground hover:text-primary">Coaching</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} YU Playbook Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
