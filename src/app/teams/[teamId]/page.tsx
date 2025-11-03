
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
    <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
      <Skeleton className="h-32 w-32 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
      </div>
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-20 w-20 rounded-full" />
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
      <div className="container mx-auto text-center py-12">
        <h1 className="text-2xl font-bold">Team not found</h1>
        <p className="text-muted-foreground">The team you are looking for does not exist.</p>
      </div>
    );
  }
  
  const teamImage = placeholderImages.placeholderImages.find(p => p.id === team.imageId);

  return (
    <div className="bg-muted/40 min-h-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            {teamImage && (
                <Image
                    src={teamImage.imageUrl}
                    alt={team.name}
                    width={128}
                    height={128}
                    className="rounded-lg shadow-md"
                    data-ai-hint={teamImage.imageHint}
                />
            )}
            <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold">{team.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                {team.roster?.length || 0} players
            </p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Roster</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
            {team.roster?.map(player => {
                const playerImage = player.photoURL || placeholderImages.placeholderImages.find(p => p.id === player.imageId)?.imageUrl;
                return (
                <div key={player.id} className="flex flex-col items-center text-center gap-2">
                    <Avatar className="h-24 w-24">
                        {playerImage && <AvatarImage src={playerImage} alt={player.name || player.displayName || 'Player'} />}
                        <AvatarFallback className="text-3xl">{(player.name || player.displayName || 'P').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='mt-2'>
                        <p className="font-semibold">{player.name || player.displayName}</p>
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <Shirt className="h-4 w-4" /> #{player.number}
                        </p>
                    </div>
                </div>
                )
            })}
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
