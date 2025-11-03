"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from "@/lib/placeholder-images.json";
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

type TeamScore = {
  name: string;
  score: number;
  imageId: string;
};

type LiveScore = {
  id: string;
  teamA: TeamScore;
  teamB: TeamScore;
  status: string;
  time: string;
};

const LiveScoreCard = ({ game }: { game: LiveScore }) => {
  const teamAImage = placeholderImages.placeholderImages.find(p => p.id === game.teamA.imageId);
  const teamBImage = placeholderImages.placeholderImages.find(p => p.id === game.teamB.imageId);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{game.time}</CardTitle>
        <div className={`text-xs font-semibold px-2 py-1 rounded-full ${game.status === 'Final' ? 'bg-muted text-muted-foreground' : 'bg-destructive text-destructive-foreground animate-pulse'}`}>
          {game.status}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                {teamAImage && <AvatarImage src={teamAImage.imageUrl} alt={game.teamA.name} data-ai-hint={teamAImage.imageHint}/>}
                <AvatarFallback>{game.teamA.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{game.teamA.name}</span>
            </div>
            <span className="text-2xl font-bold">{game.teamA.score}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                {teamBImage && <AvatarImage src={teamBImage.imageUrl} alt={game.teamB.name} data-ai-hint={teamBImage.imageHint}/>}
                <AvatarFallback>{game.teamB.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{game.teamB.name}</span>
            </div>
            <span className="text-2xl font-bold">{game.teamB.score}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const LiveScoreboard = () => {
    const firestore = useFirestore();
    
    const matchesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'matches'));
    }, [firestore]);

    const { data: scores, isLoading: loading } = useCollection<LiveScore>(matchesQuery);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                             <div className="flex items-center justify-between">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scores?.map(game => (
                <LiveScoreCard key={game.id} game={game} />
            ))}
        </div>
    )
}

export default function LiveScoresPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Live Scoreboard</h1>
        <p className="mt-4 text-lg text-muted-foreground">Real-time updates from ongoing matches.</p>
      </div>
      <LiveScoreboard />
    </div>
  );
}
