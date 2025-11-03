import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Trophy, Users, ClipboardList } from "lucide-react";
import placeholderImages from "@/lib/placeholder-images.json";

const heroImage = placeholderImages.placeholderImages.find(p => p.id === "hero_banner");

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white">
        {heroImage && (
           <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
            YU Playbook: Your Ultimate Sports Platform
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl max-w-2xl mx-auto text-primary-foreground/80">
            Manage tournaments, streamline coaching, and build your team legacy. All in one place.
          </p>
          <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/tournaments">
                Explore Tournaments <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">Join Now</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Everything You Need to Succeed</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              YU Playbook provides a comprehensive suite of tools for players, coaches, and organizers.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card className="hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10 text-accent">
                  <Trophy className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-2xl">Tournament Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Effortlessly create and manage tournaments with live standings, scheduling, and real-time score updates.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10 text-accent">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-2xl">Coaching Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access tailored coaching programs, track progress with detailed logs, and unlock your full potential.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10 text-accent">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-2xl">Team & Roster Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build your dream team, manage rosters for tournaments, and maintain a unified profile for every player.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
