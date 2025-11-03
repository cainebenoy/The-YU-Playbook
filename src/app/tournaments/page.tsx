
"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import placeholderImages from '@/lib/placeholder-images.json';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';


type Standing = {
  rank: number;
  team: string;
  wins: number;
  losses: number;
  points: number;
}

type Tournament = {
  id: string;
  name:string;
  date: string;
  location: string;
  standings: Standing[];
  imageId: string;
  teamIds?: string[];
}

type Team = {
  id: string;
  name: string;
  coachId: string;
}

const TournamentCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-56 w-full" />
    <CardHeader>
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-full" />
    </CardContent>
    <CardFooter>
        <Skeleton className="h-10 w-24" />
    </CardFooter>
  </Card>
);

const RegisterTeamDialog = ({ tournament, teams }: { tournament: Tournament; teams: Team[] }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleRegistration = () => {
        if (!firestore || !selectedTeamId) {
            toast({
                variant: 'destructive',
                title: 'Selection Required',
                description: 'Please select a team to register.',
            });
            return;
        }

        if (tournament.teamIds?.includes(selectedTeamId)) {
             toast({
                variant: 'default',
                title: 'Already Registered',
                description: 'This team is already registered for the tournament.',
            });
            setIsOpen(false);
            return;
        }

        const tournamentDocRef = doc(firestore, 'tournaments', tournament.id);
        updateDocumentNonBlocking(tournamentDocRef, {
            teamIds: arrayUnion(selectedTeamId)
        });

        toast({
            title: 'Registration Successful',
            description: `Your team has been registered for ${tournament.name}.`,
        });
        setIsOpen(false);
    }


    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Register Team</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register for {tournament.name}</DialogTitle>
                    <DialogDescription>Select one of your teams to register for this tournament.</DialogDescription>
                </DialogHeader>
                
                <Select onValueChange={setSelectedTeamId} value={selectedTeamId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a team..." />
                    </SelectTrigger>
                    <SelectContent>
                        {teams.map(team => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleRegistration} disabled={!selectedTeamId}>Confirm Registration</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default function TournamentsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const tournamentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tournaments'));
  }, [firestore]);

  const { data: tournaments, isLoading } = useCollection<Tournament>(tournamentsQuery);

  const coachTeamsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'teams'), where('coachId', '==', user.uid));
  }, [firestore, user]);

  const { data: coachTeams, isLoading: teamsLoading } = useCollection<Team>(coachTeamsQuery);

  const showRegistration = !isUserLoading && user && coachTeams && coachTeams.length > 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Tournaments</h1>
        <p className="mt-4 text-lg text-muted-foreground">Find and follow upcoming tournaments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading && (
          <>
            <TournamentCardSkeleton />
            <TournamentCardSkeleton />
          </>
        )}
        {tournaments?.map(tournament => {
          const tournamentImage = placeholderImages.placeholderImages.find(p => p.id === tournament.imageId);
          return (
          <Card key={tournament.id} className="flex flex-col overflow-hidden">
            {tournamentImage && (
              <div className="relative h-56 w-full">
                <Image 
                  src={tournamentImage.imageUrl} 
                  alt={tournament.name} 
                  fill 
                  className="object-cover"
                  data-ai-hint={tournamentImage.imageHint} 
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{tournament.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4"/>
                    <span>{tournament.date}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4"/>
                    <span>{tournament.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4"/>
                    <span>{tournament.teamIds?.length || 0} teams registered</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <Accordion type="single" collapsible>
                <AccordionItem value="standings">
                  <AccordionTrigger>View Standings</AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>W</TableHead>
                          <TableHead>L</TableHead>
                          <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tournament.standings?.map(standing => (
                          <TableRow key={standing.team}>
                            <TableCell className="font-bold">{standing.rank}</TableCell>
                            <TableCell>{standing.team}</TableCell>
                            <TableCell>{standing.wins}</TableCell>
                            <TableCell>{standing.losses}</TableCell>
                            <TableCell className="text-right">{standing.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
             <CardFooter>
                {showRegistration && coachTeams && (
                    <RegisterTeamDialog tournament={tournament} teams={coachTeams} />
                )}
             </CardFooter>
          </Card>
        )})}
      </div>
    </div>
  );
}
