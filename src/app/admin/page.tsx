'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Gamepad2, ClipboardEdit, Eye, PlusSquare } from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';


type Tournament = {
    id: string;
    name: string;
    date: string;
    location: string;
};

const AdminDashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const tournamentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'tournaments'));
    }, [firestore]);

    const { data: tournaments, isLoading } = useCollection<Tournament>(tournamentsQuery);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Manage all tournaments and events.</p>
                </div>
                 <Button asChild>
                    <Link href="/admin/tournaments">
                        <PlusSquare className="mr-2 h-4 w-4" />
                        Create Tournament
                    </Link>
                </Button>
            </div>

            {isLoading ? <AdminDashboardSkeleton /> : (
                tournaments && tournaments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((tournament) => (
                            <Card key={tournament.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="font-headline">{tournament.name}</CardTitle>
                                    <CardDescription>{tournament.date} &bull; {tournament.location}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     <p className="text-sm text-muted-foreground">Quick actions to manage this event.</p>
                                </CardContent>
                                <CardFooter className="flex-col sm:flex-row gap-2">
                                     <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link href={`/admin/scoring`}>
                                            <ClipboardEdit className="mr-2 h-4 w-4" /> Score
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" className="w-full">
                                        <Link href={`/admin/matches`}>
                                            <Gamepad2 className="mr-2 h-4 w-4" /> Matches
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-xl font-semibold">No Tournaments Found</h2>
                        <p className="text-muted-foreground mt-2">Get started by creating your first tournament.</p>
                        <Button asChild className="mt-4">
                            <Link href="/admin/tournaments">Create Tournament</Link>
                        </Button>
                    </div>
                )
            )}
        </div>
    );
}
