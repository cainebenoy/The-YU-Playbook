
'use client';

import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import placeholderImages from '@/lib/placeholder-images.json';
import { format } from 'date-fns';
import { Trophy, Shield, Calendar as CalendarIcon, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user_avatar_1');

type Player = {
  id: string;
  displayName: string;
  photoURL?: string;
  email: string;
  role: string;
}

type TournamentHistory = {
  id: string;
  tournamentName: string;
  team: string;
  result: string;
  record: string;
  date: string;
};

const ProfilePageSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <Skeleton className="h-32 w-32 rounded-full shadow-lg" />
            <div className="space-y-3 text-center md:text-left">
                <Skeleton className="h-12 w-80" />
                <Skeleton className="h-6 w-48" />
            </div>
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-48 w-full" />
            </CardContent>
        </Card>
    </div>
);


export default function PlayerProfilePage() {
    const params = useParams();
    const playerId = params.playerId as string;
    const firestore = useFirestore();

    const playerDocRef = useMemoFirebase(() => {
        if (!firestore || !playerId) return null;
        return doc(firestore, 'users', playerId);
    }, [firestore, playerId]);

    const tournamentHistoryQuery = useMemoFirebase(() => {
        if (!firestore || !playerId) return null;
        return query(collection(firestore, `users/${playerId}/tournamentHistory`), orderBy('date', 'desc'));
    }, [firestore, playerId]);

    const { data: player, isLoading: isPlayerLoading } = useDoc<Player>(playerDocRef);
    const { data: history, isLoading: isHistoryLoading } = useCollection<TournamentHistory>(tournamentHistoryQuery);

    const isLoading = isPlayerLoading || isHistoryLoading;

    if (isLoading) {
        return <ProfilePageSkeleton />;
    }

    if (!player) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-4xl font-headline font-bold">Player Not Found</h1>
                <p className="text-muted-foreground mt-4">The player you are looking for does not exist.</p>
                 <Button asChild className="mt-6">
                    <Link href="/teams/discover">Discover Teams</Link>
                </Button>
            </div>
        );
    }
    
    const displayAvatar = player.photoURL || userAvatar?.imageUrl;

    return (
        <div className="bg-muted/40 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-12">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        {displayAvatar && <AvatarImage src={displayAvatar} alt={player.displayName} data-ai-hint={userAvatar?.imageHint} />}
                        <AvatarFallback className="text-3xl">
                            {player.displayName ? player.displayName[0].toUpperCase() : 'P'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h1 className="text-3xl font-headline font-bold">{player.displayName}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                           <Mail className="h-4 w-4" /> {player.email}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="text-primary" />
                            Tournament History
                        </CardTitle>
                        <CardDescription>A record of past tournament results.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {history && history.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tournament</TableHead>
                                        <TableHead><Shield className="inline-block mr-1 h-4 w-4" />Team</TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead>Record</TableHead>
                                        <TableHead className="text-right"><CalendarIcon className="inline-block mr-1 h-4 w-4" />Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.tournamentName}</TableCell>
                                            <TableCell>{item.team}</TableCell>
                                            <TableCell>{item.result}</TableCell>
                                            <TableCell>{item.record}</TableCell>
                                            <TableCell className="text-right">{format(new Date(item.date), 'PP')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No tournament history found for this player.</p>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
