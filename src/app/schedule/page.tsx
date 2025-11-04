'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Gamepad2, MapPin, NotebookPen, PersonStanding, Trophy } from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';


type Team = {
    id: string;
    name: string;
    imageId: string;
    roster: { id: string }[];
}

type Event = {
    id: string;
    teamId: string;
    teamName: string;
    title: string;
    eventType: 'Practice' | 'Game' | 'Scrimmage' | 'Other';
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
}

const eventTypeIcons = {
    Practice: <PersonStanding className="h-5 w-5 text-blue-500" />,
    Game: <Trophy className="h-5 w-5 text-yellow-500" />,
    Scrimmage: <Gamepad2 className="h-5 w-5 text-green-500" />,
    Other: <NotebookPen className="h-5 w-5 text-gray-500" />,
};

const SchedulePageSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-8 w-1/4 mb-4" />
                    <div className="space-y-4">
                        <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader></Card>
                        <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader></Card>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


export default function SchedulePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(true);

    useEffect(() => {
        if (!user || !firestore) return;
        
        const fetchMyTeams = async () => {
            setIsLoadingTeams(true);
            const teamsRef = collection(firestore, 'teams');
            
            // Query for teams where user is coach OR user is in roster
            const coachedTeamsQuery = query(teamsRef, where('coachId', '==', user.uid));
            const playerTeamsQuery = query(teamsRef, where('roster', 'array-contains', { id: user.uid, name: user.displayName, number: 0, imageId: '', role: 'Player' }));

            const [coachedTeamsSnapshot, playerTeamsSnapshot] = await Promise.all([
                getDocs(coachedTeamsQuery),
                getDocs(query(teamsRef, where('roster', 'array-contains', { id: user.uid }))) // More robust query
            ]);
            
            const teamIds = new Set<string>();
            coachedTeamsSnapshot.forEach(doc => teamIds.add(doc.id));
            
            // This part is tricky because array-contains needs the full object.
            // A better structure might be a simple array of player IDs.
            // For now, let's fetch all teams and filter client-side. This is NOT scalable.
             const allTeamsSnapshot = await getDocs(teamsRef);
             allTeamsSnapshot.forEach(doc => {
                 const team = doc.data() as Team;
                 if (team.roster?.some(player => player.id === user.uid)) {
                     teamIds.add(doc.id);
                 }
             });


            setMyTeamIds(Array.from(teamIds));
            setIsLoadingTeams(false);
        };
        fetchMyTeams();
    }, [user, firestore]);

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || myTeamIds.length === 0) return null;
        return query(
            collectionGroup(firestore, 'events'), 
            where('teamId', 'in', myTeamIds),
            orderBy('startTime', 'asc')
        );
    }, [firestore, myTeamIds]);

    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);
    
    const groupedEvents = useMemo(() => {
        if (!events) return {};
        return events.reduce((acc, event) => {
            const date = format(new Date(event.startTime), 'EEEE, MMMM d, yyyy');
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {} as Record<string, Event[]>);
    }, [events]);


    if (isUserLoading || isLoadingTeams) {
        return <SchedulePageSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">Team Schedule</h1>
                <p className="mt-4 text-lg text-muted-foreground">Upcoming practices, games, and events for your teams.</p>
            </div>

            {isLoadingEvents && <SchedulePageSkeleton />}

            {!isLoadingEvents && events && events.length > 0 ? (
                 <div className="space-y-8 max-w-4xl mx-auto">
                    {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                        <div key={date}>
                            <h2 className="font-headline text-2xl font-bold mb-4 border-b pb-2">{date}</h2>
                            <div className="space-y-4">
                                {dayEvents.map(event => {
                                    const teamImage = placeholderImages.placeholderImages.find(p => p.id === 'team_logo_2');
                                    return (
                                        <Card key={event.id} className="shadow-md hover:shadow-primary/20 transition-shadow">
                                            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                                                <div className="flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-0 p-4 rounded-md bg-muted/50 sm:w-32 text-center">
                                                    {eventTypeIcons[event.eventType]}
                                                    <p className="font-semibold">{event.eventType}</p>
                                                    <p className="text-sm text-muted-foreground hidden sm:block">{format(new Date(event.startTime), 'p')}</p>
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-xl">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground mb-2">For Team: <Link href={`/teams/${event.teamId}`} className="font-semibold hover:underline text-primary">{event.teamName}</Link></p>
                                                    
                                                    <div className="text-sm space-y-1 mt-2">
                                                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {format(new Date(event.startTime), 'p')} - {format(new Date(event.endTime), 'p')}</p>
                                                        {event.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</p>}
                                                    </div>
                                                     {event.notes && <p className="text-sm mt-2 pt-2 border-t">{event.notes}</p>}
                                                </div>
                                                <div className="self-center">
                                                    {/* RSVP button will go here */}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoadingEvents && (
                     <Card className="mt-6 text-center py-12 max-w-lg mx-auto">
                        <CardHeader>
                            <CardTitle>No Upcoming Events</CardTitle>
                            <CardDescription>There are no events scheduled for your teams. Coaches can add events from the "Team Management" page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {user?.role === 'coach' && (
                             <Button asChild className="mt-4">
                                <Link href="/teams">Manage My Teams</Link>
                            </Button>
                           )}
                           {user?.role !== 'coach' && (
                             <Button asChild className="mt-4">
                                <Link href="/teams/discover">Discover Teams</Link>
                            </Button>
                           )}
                        </CardContent>
                    </Card>
                )
            )}
        </div>
    );
}