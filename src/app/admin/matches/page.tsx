'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const matchFormSchema = z.object({
  tournamentId: z.string({ required_error: 'Please select a tournament.' }),
  teamAId: z.string({ required_error: 'Please select Team A.' }),
  teamBId: z.string({ required_error: 'Please select Team B.' }),
  startTime: z.string().min(1, { message: 'Please enter a start time.' }),
}).refine(data => data.teamAId !== data.teamBId, {
  message: 'Team A and Team B cannot be the same.',
  path: ['teamBId'],
});

type Tournament = {
  id: string;
  name: string;
  teamIds: string[];
};

type Team = {
  id: string;
  name: string;
  imageId: string;
};

export default function CreateMatchPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [registeredTeams, setRegisteredTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tournaments');
  }, [firestore]);
  const { data: tournaments } = useCollection<Tournament>(tournamentsQuery);

  const form = useForm<z.infer<typeof matchFormSchema>>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      tournamentId: '',
      teamAId: '',
      teamBId: '',
      startTime: '',
    },
  });

  const handleTournamentChange = async (tournamentId: string) => {
    form.setValue('tournamentId', tournamentId);
    form.resetField('teamAId');
    form.resetField('teamBId');
    setSelectedTournamentId(tournamentId);
    setRegisteredTeams([]);
    if (!firestore || !tournamentId) return;

    setIsLoadingTeams(true);
    const tournament = tournaments?.find(t => t.id === tournamentId);
    if (tournament && tournament.teamIds) {
      try {
        const teamPromises = tournament.teamIds.map(id => getDoc(doc(firestore, 'teams', id)));
        const teamDocs = await Promise.all(teamPromises);
        const teamsData = teamDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Team));
        setRegisteredTeams(teamsData);
      } catch (e) {
        console.error("Error fetching teams: ", e);
        toast({variant: 'destructive', title: 'Error', description: 'Could not load registered teams.'});
      }
    }
    setIsLoadingTeams(false);
  };

  const onSubmit = async (values: z.infer<typeof matchFormSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);

    const teamA = registeredTeams.find(t => t.id === values.teamAId);
    const teamB = registeredTeams.find(t => t.id === values.teamBId);

    if (!teamA || !teamB) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find team data.' });
      setIsSubmitting(false);
      return;
    }

    const newMatch = {
      tournamentId: values.tournamentId,
      teamAId: values.teamAId,
      teamBId: values.teamBId,
      teamA: { name: teamA.name, score: 0, imageId: teamA.imageId, id: teamA.id },
      teamB: { name: teamB.name, score: 0, imageId: teamB.imageId, id: teamB.id },
      startTime: new Date(values.startTime).toISOString(),
      time: format(new Date(values.startTime), 'p'),
      status: 'Not Started',
    };

    try {
      const matchesCollection = collection(firestore, 'matches');
      addDocumentNonBlocking(matchesCollection, newMatch);
      toast({
        title: 'Match Created',
        description: `Match between ${teamA.name} and ${teamB.name} has been scheduled.`,
      });
      form.reset();
      setSelectedTournamentId(null);
      setRegisteredTeams([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.message || 'Could not create the match.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create New Match</CardTitle>
          <CardDescription>Select a tournament, teams, and set a start time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="tournamentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament</FormLabel>
                    <Select onValueChange={handleTournamentChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tournament..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tournaments?.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedTournamentId && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="teamAId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team A</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isLoadingTeams}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select Team A..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {registeredTeams.map(team => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="teamBId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team B</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isLoadingTeams}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select Team B..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {registeredTeams.map(team => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" disabled={isSubmitting || !selectedTournamentId}>
                {isSubmitting ? 'Creating...' : 'Create Match'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
