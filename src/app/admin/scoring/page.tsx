
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type TeamScore = {
  name: string;
  score: number;
};

type LiveScore = {
  id: string;
  teamA: TeamScore;
  teamB: TeamScore;
  status: string;
  tournamentId: string;
};

const triggerStandingsUpdate = async (tournamentId: string) => {
  try {
    const res = await fetch('/api/update-standings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tournamentId,
        secret: process.env.NEXT_PUBLIC_STANDINGS_API_SECRET,
      }),
    });
    if (!res.ok) {
        throw new Error('Failed to trigger standings update.');
    }
    return await res.json();
  } catch (error) {
    console.error("Standings update trigger failed:", error);
    throw error;
  }
};


const ScoreUpdateCard = ({ game }: { game: LiveScore }) => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [scoreA, setScoreA] = useState(game.teamA.score.toString());
  const [scoreB, setScoreB] = useState(game.teamB.score.toString());
  const [status, setStatus] = useState(game.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    if (!firestore) return;
    setIsSubmitting(true);
    const matchDocRef = doc(firestore, 'matches', game.id);
    const newScoreA = parseInt(scoreA, 10);
    const newScoreB = parseInt(scoreB, 10);

    if (isNaN(newScoreA) || isNaN(newScoreB)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Score',
        description: 'Scores must be numbers.',
      });
      setIsSubmitting(false);
      return;
    }

    const updatedData = {
      'teamA.score': newScoreA,
      'teamB.score': newScoreB,
      status: status,
    };
    
    updateDocumentNonBlocking(matchDocRef, updatedData);

    toast({
      title: 'Score Updated',
      description: `Match ${game.teamA.name} vs ${game.teamB.name} has been updated.`,
    });

     if (status === 'Final') {
      toast({
        title: 'Final Score Submitted',
        description: 'Triggering tournament standings update...',
      });
      try {
        await triggerStandingsUpdate(game.tournamentId);
        toast({
          title: 'Standings Updated',
          description: 'The tournament standings have been recalculated successfully.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Standings Update Failed',
          description: 'Could not update standings. Please check the server logs.',
        });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline">
          {game.teamA.name} vs. {game.teamB.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`scoreA-${game.id}`}>{game.teamA.name} Score</Label>
            <Input
              id={`scoreA-${game.id}`}
              type="number"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`scoreB-${game.id}`}>{game.teamB.name} Score</Label>
            <Input
              id={`scoreB-${game.id}`}
              type="number"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`status-${game.id}`}>Match Status</Label>
          <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
              <SelectTrigger id={`status-${game.id}`}>
                  <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Halftime">Halftime</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
              </SelectContent>
          </Select>
        </div>
        <Button onClick={handleUpdate} className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Match'}
        </Button>
      </CardContent>
    </Card>
  );
};


const ScoringAdminSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        ))}
    </div>
)

export default function ScoringAdminPage() {
  const firestore = useFirestore();
  const matchesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'matches'), where('status', '!=', 'Final'));
  }, [firestore]);

  const { data: matches, isLoading } = useCollection<LiveScore>(matchesQuery);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Scoring Admin</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Update scores for ongoing matches in real-time.
        </p>
      </div>
      {isLoading ? (
        <ScoringAdminSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches && matches.length > 0 ? (
            matches.map((match) => <ScoreUpdateCard key={match.id} game={match} />)
          ) : (
            <p className="text-center md:col-span-2 lg:col-span-3 text-muted-foreground">No active matches found.</p>
          )}
        </div>
      )}
    </div>
  );
}
