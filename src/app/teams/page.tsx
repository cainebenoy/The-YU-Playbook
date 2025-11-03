
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Trash2, UserPlus, Mail, Eye, Share2, Megaphone, CalendarPlus } from "lucide-react";
import placeholderImages from "@/lib/placeholder-images.json";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, doc, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';


type PlayerRole = 'Player' | 'Captain' | 'Handler' | 'Cutter';

type Player = {
  id: string;
  name: string;
  number: number;
  imageId: string;
  photoURL?: string;
  displayName?: string;
  role: PlayerRole;
}

type Team = {
  id: string;
  name: string;
  roster: Player[];
  imageId: string;
  coachId: string;
}

type JoinRequest = {
  id: string; // The user ID of the applicant
  displayName: string;
  photoURL?: string;
  status: 'pending';
}

type Announcement = {
    id: string;
    message: string;
    timestamp: string;
}

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  eventType: z.string({ required_error: 'Please select an event type.' }),
  startTime: z.date({ required_error: 'A start time is required.' }),
  endTime: z.date({ required_error: 'An end time is required.' }),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const ScheduleEventDialog = ({ team, user }: { team: Team; user: any }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            location: '',
            notes: '',
        }
    });

    const onSubmit = (values: z.infer<typeof eventFormSchema>) => {
        if (!firestore) return;
        
        const eventCollection = collection(firestore, `teams/${team.id}/events`);
        const newEvent = {
            teamId: team.id,
            teamName: team.name,
            coachId: user.uid,
            title: values.title,
            eventType: values.eventType,
            startTime: values.startTime.toISOString(),
            endTime: values.endTime.toISOString(),
            location: values.location || '',
            notes: values.notes || '',
        };

        addDocumentNonBlocking(eventCollection, newEvent);
        toast({ title: "Event Scheduled", description: `${values.title} has been added to the team's schedule.` });
        form.reset();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Schedule Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Schedule New Event for {team.name}</DialogTitle>
                    <DialogDescription>Fill in the details for the new team event.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><Label>Title</Label><FormControl><Input placeholder="e.g., Evening Practice" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="eventType" render={({ field }) => (
                            <FormItem><Label>Event Type</Label><Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an event type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Practice">Practice</SelectItem>
                                    <SelectItem value="Game">Game</SelectItem>
                                    <SelectItem value="Scrimmage">Scrimmage</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startTime" render={({ field }) => (
                                <FormItem><Label>Start Time</Label><FormControl><Input type="datetime-local" {...field} value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="endTime" render={({ field }) => (
                                <FormItem><Label>End Time</Label><FormControl><Input type="datetime-local" {...field} value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><Label>Location</Label><FormControl><Input placeholder="e.g., Central Park Field #3" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem><Label>Notes</Label><FormControl><Textarea placeholder="e.g., Bring both light and dark jerseys." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit">Create Event</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const ManageAnnouncementsDialog = ({ team, user }: { team: Team; user: any }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `teams/${team.id}/announcements`), orderBy('timestamp', 'desc'));
    }, [firestore, team.id]);

    const { data: announcements, isLoading } = useCollection<Announcement>(announcementsQuery);

    const handleSendAnnouncement = () => {
        if (!firestore || !newMessage) {
            toast({ variant: 'destructive', title: 'Message cannot be empty.' });
            return;
        }
        
        const announcementCollection = collection(firestore, `teams/${team.id}/announcements`);
        const newAnnouncement = {
            teamId: team.id,
            coachId: user.uid,
            message: newMessage,
            timestamp: new Date().toISOString(),
        };

        addDocumentNonBlocking(announcementCollection, newAnnouncement);
        toast({ title: "Announcement Sent", description: "Your message has been broadcast to the team." });
        setNewMessage("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Megaphone className="mr-2 h-4 w-4" />
                    Announcements ({announcements?.length || 0})
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Announcements for {team.name}</DialogTitle>
                    <DialogDescription>Broadcast messages to your team. They will appear on the public team page.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    <div className="space-y-2">
                        <Label htmlFor="announcement-message">New Announcement</Label>
                        <Textarea 
                            id="announcement-message"
                            placeholder="e.g., Practice is moved to 7 PM tonight." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSendAnnouncement} disabled={!newMessage}>Send Message</Button>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    <h3 className="font-semibold">Recent Announcements</h3>
                     {isLoading && <Skeleton className="h-20 w-full" />}
                     {announcements && announcements.length > 0 ? (
                        announcements.map(item => (
                            <div key={item.id} className="border-l-2 pl-3">
                               <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                               <p className="text-xs text-muted-foreground mt-1">
                                   {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                               </p>
                            </div>
                        ))
                     ) : (
                        !isLoading && <p className="text-sm text-center text-muted-foreground py-4">No announcements sent yet.</p>
                     )}
                </div>
            </DialogContent>
        </Dialog>
    );
};


const ManageRequestsDialog = ({ team }: { team: Team }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const requestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `teams/${team.id}/joinRequests`), where('status', '==', 'pending'));
    }, [firestore, team.id]);

    const { data: requests, isLoading } = useCollection<JoinRequest>(requestsQuery);

    const handleApprove = (request: JoinRequest) => {
        if (!firestore) return;
        
        const teamDocRef = doc(firestore, 'teams', team.id);
        const newPlayer: Player = {
            id: request.id,
            name: request.displayName,
            number: Math.floor(Math.random() * 100),
            imageId: 'user_avatar_1',
            photoURL: request.photoURL,
            displayName: request.displayName,
            role: 'Player', // Assign default role
        };
        updateDocumentNonBlocking(teamDocRef, {
            roster: arrayUnion(newPlayer)
        });

        const requestDocRef = doc(firestore, `teams/${team.id}/joinRequests`, request.id);
        deleteDocumentNonBlocking(requestDocRef);

        toast({ title: "Player Approved", description: `${request.displayName} has been added to ${team.name}.` });
    };

    const handleDeny = (requestId: string) => {
        if (!firestore) return;
        const requestDocRef = doc(firestore, `teams/${team.id}/joinRequests`, requestId);
        deleteDocumentNonBlocking(requestDocRef);
        toast({ title: "Request Denied", description: "The join request has been denied." });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Manage Requests ({requests?.length || 0})
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Join Requests for {team.name}</DialogTitle>
                    <DialogDescription>Approve or deny requests from players wanting to join your team.</DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                    {isLoading && <Skeleton className="h-20 w-full" />}
                    {requests && requests.length > 0 ? (
                        requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        {req.photoURL && <AvatarImage src={req.photoURL} alt={req.displayName} />}
                                        <AvatarFallback>{req.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{req.displayName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleDeny(req.id)}>Deny</Button>
                                    <Button size="sm" onClick={() => handleApprove(req)}>Approve</Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        !isLoading && <p className="text-center text-muted-foreground py-8">No pending requests.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};


const TeamPageSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-12 w-1/3 mb-4" />
        <Skeleton className="h-8 w-2/3 mb-8" />
        <Skeleton className="h-10 w-96 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
    </div>
)

export default function TeamsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [isRosterDialogOpen, setIsRosterDialogOpen] = useState(false);

  const teamsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'teams'), where('coachId', '==', user.uid));
  }, [firestore, user]);

  const { data: teams, isLoading: teamsLoading } = useCollection<Team>(teamsQuery);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (selectedTeam && teams) {
      const updatedTeam = teams.find(t => t.id === selectedTeam.id);
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
      }
    }
  }, [teams, selectedTeam]);

  const handleCopyLink = (teamId: string) => {
    const url = `${window.location.origin}/teams/${teamId}`;
    navigator.clipboard.writeText(url);
    toast({
        title: "Link Copied!",
        description: "The public team page URL has been copied to your clipboard.",
    });
  }

  if (isUserLoading || !user || teamsLoading) {
    return <TeamPageSkeleton />;
  }

  const handleRegisterTeam = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !user) return;

    const teamName = event.currentTarget.teamName.value;
    if (teamName) {
      const newTeam = {
        name: teamName,
        coachId: user.uid,
        roster: [],
        imageId: 'team_logo_2'
      };
      const teamsCollection = collection(firestore, 'teams');
      addDocumentNonBlocking(teamsCollection, newTeam);
      toast({ title: "Team Registered", description: `${teamName} has been created.`});
      event.currentTarget.reset();
    }
  };

  const handleAddPlayer = () => {
    if (!firestore || !selectedTeam || !newPlayerName || !newPlayerNumber) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter a player name and number."
        });
        return;
    }

    const teamDocRef = doc(firestore, 'teams', selectedTeam.id);
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: newPlayerName,
      number: parseInt(newPlayerNumber, 10),
      imageId: 'user_avatar_1',
      role: 'Player', // Default role
    };

    updateDocumentNonBlocking(teamDocRef, {
      roster: arrayUnion(newPlayer)
    });

    toast({ title: "Player Added", description: `${newPlayerName} has been added to the roster.` });
    setNewPlayerName("");
    setNewPlayerNumber("");
  };

  const handleRemovePlayer = (player: Player) => {
    if (!firestore || !selectedTeam) return;

    const teamDocRef = doc(firestore, 'teams', selectedTeam.id);
    updateDocumentNonBlocking(teamDocRef, {
        roster: arrayRemove(player)
    });
    toast({ title: "Player Removed", description: `${player.name || player.displayName} has been removed from the roster.` });
  };
  
  const handleRoleChange = (playerId: string, newRole: PlayerRole) => {
    if (!firestore || !selectedTeam) return;

    const updatedRoster = selectedTeam.roster.map(p => 
        p.id === playerId ? { ...p, role: newRole } : p
    );

    const teamDocRef = doc(firestore, 'teams', selectedTeam.id);
    updateDocumentNonBlocking(teamDocRef, {
        roster: updatedRoster
    });
    
    toast({
        title: "Role Updated",
        description: `The role has been updated to ${newRole}.`
    });
  }


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Team Management</h1>
        <p className="text-muted-foreground mt-2">Manage your teams, rosters, and public pages.</p>
      </div>

      <Tabs defaultValue="my-teams">
        <TabsList className="grid w-full grid-cols-2 md:w-96">
          <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          <TabsTrigger value="register">
            <PlusCircle className="mr-2 h-4 w-4" /> Register Team
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-teams">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {teams?.map((team) => {
              const teamImage = placeholderImages.placeholderImages.find(p => p.id === team.imageId);
              return (
              <Card key={team.id}>
                <CardHeader>
                    <div className="flex flex-row items-center gap-4">
                    {teamImage && (
                        <Image src={teamImage.imageUrl} alt={team.name} width={60} height={60} className="rounded-md" data-ai-hint={teamImage.imageHint} />
                    )}
                    <div>
                        <CardTitle className="font-headline">{team.name}</CardTitle>
                        <CardDescription>{team.roster?.length || 0} players</CardDescription>
                    </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button onClick={() => { setSelectedTeam(team); setIsRosterDialogOpen(true); }} className="w-full">Manage Roster</Button>
                     <ManageRequestsDialog team={team} />
                     <ManageAnnouncementsDialog team={team} user={user} />
                     <ScheduleEventDialog team={team} user={user} />
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/teams/${team.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Public Page
                        </Link>
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => handleCopyLink(team.id)}>
                        <Share2 className="mr-2 h-4 w-4" /> Share Link
                    </Button>
                </CardFooter>
              </Card>
            )})}
          </div>
        </TabsContent>
        <TabsContent value="register">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-headline">Register a New Team</CardTitle>
              <CardDescription>Fill out the details below to create a new team under your management.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterTeam} className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input id="teamName" name="teamName" placeholder="e.g., The Ultimate Force" required />
                </div>
                <Button type="submit">Create Team</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRosterDialogOpen} onOpenChange={setIsRosterDialogOpen}>
        {selectedTeam && (
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Manage Roster: {selectedTeam.name}</DialogTitle>
                    <DialogDescription>Add or remove players from your team and manage their roles.</DialogDescription>
                </DialogHeader>
                <div className="my-4">
                    <h3 className="font-semibold mb-2">Add New Player</h3>
                    <div className="flex gap-2 items-center">
                        <Input placeholder="Player Name" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} />
                        <Input type="number" placeholder="Number" className="w-24" value={newPlayerNumber} onChange={(e) => setNewPlayerNumber(e.target.value)} />
                        <Button onClick={handleAddPlayer} size="icon"><UserPlus className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>Number</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedTeam.roster?.map(player => {
                              const playerImage = player.photoURL || placeholderImages.placeholderImages.find(p => p.id === player.imageId)?.imageUrl;
                              return (
                                <TableRow key={player.id}>
                                    <TableCell className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          {playerImage && <AvatarImage src={playerImage} alt={player.name || player.displayName || 'Player'} />}
                                            <AvatarFallback>{(player.name || player.displayName || 'P').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {player.name || player.displayName}
                                    </TableCell>
                                    <TableCell>#{player.number}</TableCell>
                                    <TableCell>
                                      <Select value={player.role} onValueChange={(newRole: PlayerRole) => handleRoleChange(player.id, newRole)}>
                                        <SelectTrigger className="w-32">
                                          <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Player">Player</SelectItem>
                                          <SelectItem value="Captain">Captain</SelectItem>
                                          <SelectItem value="Handler">Handler</SelectItem>
                                          <SelectItem value="Cutter">Cutter</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(player)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
