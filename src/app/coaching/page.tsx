'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type Player = {
  id: string;
  name: string;
  imageId: string;
};

type Team = {
  id: string;
  name: string;
  coachId: string;
  roster: Player[];
};

type CoachingLog = {
    id: string;
    userId: string;
    coachId: string;
    date: string;
    notes: string;
}

const PlayerLogsDialog = ({ coachId, player }: { coachId: string; player: Player }) => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newLogNotes, setNewLogNotes] = useState('');

  const logsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `users/${player.id}/coachingLogs`), where('coachId', '==', coachId));
  }, [firestore, player.id, coachId]);

  const { data: logs, isLoading } = useCollection<CoachingLog>(logsQuery);

  const handleAddLog = () => {
    if (!firestore || !newLogNotes) {
      toast({ variant: 'destructive', title: 'Notes cannot be empty' });
      return;
    }
    const logCollection = collection(firestore, `users/${player.id}/coachingLogs`);
    const newLog = {
        userId: player.id,
        coachId: coachId,
        date: new Date().toISOString(),
        notes: newLogNotes,
    };
    addDocumentNonBlocking(logCollection, newLog);
    toast({ title: 'Log Added', description: `A new coaching log has been created for ${player.name}.` });
    setNewLogNotes('');
  };

  const playerImage = placeholderImages.placeholderImages.find(p => p.id === player.imageId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View / Add Logs</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar>
              {playerImage && <AvatarImage src={playerImage.imageUrl} alt={player.name} />}
              <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="font-headline text-2xl">Coaching Logs for {player.name}</DialogTitle>
              <DialogDescription>Review past sessions and add new notes.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-log-notes">New Log Entry</Label>
            <Textarea
              id="new-log-notes"
              placeholder={`Write your coaching notes for ${player.name}...`}
              value={newLogNotes}
              onChange={(e) => setNewLogNotes(e.target.value)}
            />
            <Button onClick={handleAddLog} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Log
            </Button>
          </div>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            <h3 className="font-semibold">History</h3>
            {isLoading && <Skeleton className="h-20 w-full" />}
            {logs && logs.length > 0 ? (
              logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                <div key={log.id} className="border-l-2 pl-4">
                  <p className="text-sm text-muted-foreground">{format(new Date(log.date), "PPP")}</p>
                  <p className="text-sm">{log.notes}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No logs found for this player.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


const CoachingPageSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                 <Card key={i}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);


export default function CoachingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const teamsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'teams'), where('coachId', '==', user.uid));
  }, [firestore, user]);

  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);

  const coachedPlayers = useMemo(() => {
    if (!teams) return [];
    const playersMap = new Map<string, Player>();
    teams.forEach(team => {
        team.roster?.forEach(player => {
            if (!playersMap.has(player.id)) {
                playersMap.set(player.id, player);
            }
        })
    });
    return Array.from(playersMap.values());
  }, [teams]);


  if (isUserLoading || teamsLoading) {
    return <CoachingPageSkeleton />;
  }
  
  if (!user) {
    return null; // or a redirect component
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Coaching Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage logs and development for your players.</p>
      </div>

       {coachedPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coachedPlayers.map(player => {
                const playerImage = placeholderImages.placeholderImages.find(p => p.id === player.imageId);
                return (
                    <Card key={player.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                               {playerImage && <AvatarImage src={playerImage.imageUrl} alt={player.name} />}
                               <AvatarFallback className="text-xl">{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{player.name}</CardTitle>
                                <CardDescription>Player</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <PlayerLogsDialog coachId={user.uid} player={player} />
                        </CardContent>
                    </Card>
                )
            })}
        </div>
       ) : (
        <Card className="mt-6 text-center py-12">
            <CardHeader>
                <CardTitle>No Players Found</CardTitle>
                <CardDescription>You are not currently coaching any players.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Go to the "Teams" page to create a team and add players to your roster.</p>
                <Button asChild className="mt-4">
                    <a href="/teams">Manage Teams</a>
                </Button>
            </CardContent>
        </Card>
       )}
    </div>
  );
}
