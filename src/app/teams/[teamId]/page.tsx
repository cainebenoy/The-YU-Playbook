
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import placeholderImages from '@/lib/placeholder-images.json';
import { Users, Shirt } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Player = {
  id: string;
  name: string;
  number: number;
  imageId: string;
  photoURL?: string;
  displayName?: string;
}

type Team = {
  id: string;
  name: string;
  roster: Player[];
  imageId: string;
  coachId: string;
};

const TeamPageSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
      <Skeleton className="h-32 w-32 rounded-lg shadow-lg" />
      <div className="space-y-3 text-center md:text-left">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-6 w-48" />
      </div>
    </div>
    <Card className="bg-card/50">
      <CardHeader>
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const firestore = useFirestore();

  const teamDocRef = useMemoFirebase(() => {
    if (!firestore || !teamId) return null;
    return doc(firestore, 'teams', teamId);
  }, [firestore, teamId]);

  const { data: team, isLoading } = useDoc<Team>(teamDocRef);

  if (isLoading) {
    return <TeamPageSkeleton />;
  }

  if (!team) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-4xl font-headline font-bold">Team Not Found</h1>
        <p className="text-muted-foreground mt-4">The team you are looking for does not exist or may have been moved.</p>
        <Button asChild className="mt-6">
            <Link href="/teams/discover">Discover Other Teams</Link>
        </Button>
      </div>
    );
  }
  
  const teamImage = placeholderImages.placeholderImages.find(p => p.id === team.imageId);

  return (
    <div className="bg-gradient-to-b from-background via-card/50 to-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            {teamImage && (
                <div className='relative'>
                    <Image
                        src={teamImage.imageUrl}
                        alt={team.name}
                        width={150}
                        height={150}
                        className="rounded-lg shadow-2xl shadow-primary/10 border-2 border-primary/20"
                        data-ai-hint={teamImage.imageHint}
                    />
                </div>
            )}
            <div className='text-center md:text-left'>
                <h1 className="text-5xl md:text-7xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{team.name}</h1>
                <p className="mt-4 text-xl text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                    <Users className="h-5 w-5" />
                    {team.roster?.length || 0} players on the roster
                </p>
            </div>
        </div>

        <Card className='border-primary/20 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-sm'>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Official Roster</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {team.roster?.map(player => {
                const playerImage = player.photoURL || placeholderImages.placeholderImages.find(p => p.id === player.imageId)?.imageUrl;
                return (
                <Link href={`/players/${player.id}`} key={player.id} className="flex flex-col items-center text-center gap-3 group">
                    <Avatar className="h-28 w-28 border-4 border-transparent group-hover:border-primary/50 transition-all duration-300">
                        {playerImage && <AvatarImage src={playerImage} alt={player.name || player.displayName || 'Player'} />}
                        <AvatarFallback className="text-4xl bg-muted group-hover:bg-primary/10 transition-colors">{(player.name || player.displayName || 'P').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='mt-2'>
                        <p className="font-semibold text-lg">{player.name || player.displayName}</p>
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <Shirt className="h-4 w-4" /> Jersey #{player.number}
                        </p>
                    </div>
                </Link>
                )
            })}
            </CardContent>
        </Card>
        </div>
    </div>
  );
}

