
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useAuth, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Target, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user_avatar_1');

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name cannot be longer than 50 characters.' }),
  photoURL: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
});

const EditProfileDialog = ({ user, onProfileUpdate }: { user: any, onProfileUpdate: () => void }) => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!auth.currentUser) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: values.displayName,
        photoURL: values.photoURL,
      });
      
      // Update Firestore document
      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userDocRef, {
            displayName: values.displayName,
            photoURL: values.photoURL,
        });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      onProfileUpdate(); // Trigger a re-fetch or state update in the parent
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An error occurred while updating your profile.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/your-photo.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


const ProfileSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="flex items-center space-x-4 mb-8">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
    </div>
    <Skeleton className="h-10 w-full" />
    <Card className="mt-4">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-40 w-full" />
      </CardContent>
    </Card>
  </div>
);

type CoachingLog = {
  id: string;
  date: string;
  notes: string;
  coachId: string; // We can use this to show who made the log
};

type TournamentHistory = {
  id: string;
  tournamentName: string;
  team: string;
  result: string;
  record: string;
  date: string;
};

type Goal = {
  id: string;
  description: string;
  status: 'In Progress' | 'Completed';
  createdAt: string;
};

export default function ProfilePage() {
  const { user, isUserLoading, setUser } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newGoal, setNewGoal] = useState('');

  const handleProfileUpdate = () => {
    // This is a bit of a hack to force the useUser hook to re-render.
    // A more robust solution might involve a dedicated refresh function in the auth context.
    if (user) {
        setUser({...user});
    }
  };


  const coachingLogsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/coachingLogs`), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: coachingLogs, isLoading: coachingLoading } = useCollection<CoachingLog>(coachingLogsQuery);

   const tournamentHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/tournamentHistory`), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: tournamentHistory, isLoading: historyLoading } = useCollection<TournamentHistory>(tournamentHistoryQuery);

   const goalsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/goals`), orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  
  const { data: goals, isLoading: goalsLoading } = useCollection<Goal>(goalsQuery);


  const handleAddGoal = () => {
    if (!firestore || !user || !newGoal) {
        toast({ variant: 'destructive', title: 'Goal cannot be empty.' });
        return;
    }
    const goalsCollection = collection(firestore, `users/${user.uid}/goals`);
    const goalData = {
        userId: user.uid,
        description: newGoal,
        status: 'In Progress',
        createdAt: new Date().toISOString(),
    };
    addDocumentNonBlocking(goalsCollection, goalData);
    toast({ title: 'Goal Added', description: 'Your new goal has been saved.' });
    setNewGoal('');
  };

  const handleGoalStatusChange = (goal: Goal, completed: boolean) => {
    if (!firestore || !user) return;
    const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
    updateDocumentNonBlocking(goalDocRef, {
        status: completed ? 'Completed' : 'In Progress',
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!firestore || !user) return;
    const goalDocRef = doc(firestore, `users/${user.uid}/goals`, goalId);
    deleteDocumentNonBlocking(goalDocRef);
    toast({ title: 'Goal Removed' });
  };


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <ProfileSkeleton />;
  }
  
  const displayAvatar = user.photoURL || userAvatar?.imageUrl;

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-12">
          <Avatar className="h-24 w-24 border-4 border-background">
             {displayAvatar && <AvatarImage src={displayAvatar} alt={user.email || 'User'} data-ai-hint={userAvatar?.imageHint}/>}
            <AvatarFallback className="text-3xl">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-headline font-bold">
              {user.displayName || user.email?.split('@')[0] || 'User Profile'}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <EditProfileDialog user={user} onProfileUpdate={handleProfileUpdate} />
        </div>

        <Tabs defaultValue="goals">
          <TabsList className="grid w-full grid-cols-3 md:w-[480px]">
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="coaching">Coaching Logs</TabsTrigger>
            <TabsTrigger value="history">Tournament History</TabsTrigger>
          </TabsList>
          <TabsContent value="goals">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="text-primary"/> My Personal Goals</CardTitle>
                    <CardDescription>Set and track your development goals. Coaches can see your active goals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 mb-6">
                        <Label htmlFor="new-goal">Add a new goal</Label>
                        <div className="flex gap-2">
                           <Textarea 
                                id="new-goal" 
                                placeholder="e.g., Improve my backhand throw accuracy."
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                            />
                           <Button onClick={handleAddGoal} disabled={!newGoal}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                        </div>
                    </div>
                    
                    {goalsLoading ? <Skeleton className="h-40 w-full" /> : (
                        goals && goals.length > 0 ? (
                           <div className="space-y-4">
                                {goals.map((goal) => (
                                    <div key={goal.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id={`goal-${goal.id}`}
                                                checked={goal.status === 'Completed'}
                                                onCheckedChange={(checked) => handleGoalStatusChange(goal, !!checked)}
                                            />
                                            <div>
                                                <label 
                                                    htmlFor={`goal-${goal.id}`} 
                                                    className={`text-sm font-medium leading-none ${goal.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}
                                                >
                                                    {goal.description}
                                                </label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Set on {format(new Date(goal.createdAt), 'PP')}
                                                </p>
                                            </div>
                                        </div>
                                       <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                       </Button>
                                    </div>
                                ))}
                           </div>
                        ) : (
                             <p className="text-center text-muted-foreground py-8">You haven't set any goals yet. Add one above to get started!</p>
                        )
                    )}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="coaching">
            <Card>
              <CardHeader>
                <CardTitle>Coaching Logs</CardTitle>
                <CardDescription>A record of coaching sessions and feedback.</CardDescription>
              </CardHeader>
              <CardContent>
                {coachingLoading ? <Skeleton className="h-40 w-full" /> : (
                  coachingLogs && coachingLogs.length > 0 ? (
                    <div className="space-y-4">
                      {coachingLogs.map((log) => (
                        <div key={log.id} className="border-l-2 pl-4">
                          <p className="text-sm text-muted-foreground">{format(new Date(log.date), "PPP 'at' p")}</p>
                          <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No coaching logs found.</p>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Tournament History</CardTitle>
                <CardDescription>Your past tournament results and records.</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? <Skeleton className="h-40 w-full" /> : (
                  tournamentHistory && tournamentHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tournament</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tournamentHistory?.map((item) => (
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
                     <p className="text-center text-muted-foreground py-8">No tournament history found.</p>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
