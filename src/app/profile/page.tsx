'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useAuth, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';

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
  focus: string;
  notes: string;
  duration: string;
};

type TournamentHistory = {
  id: string;
  tournamentName: string;
  team: string;
  result: string;
  record: string;
  date: string;
};

export default function ProfilePage() {
  const { user, isUserLoading, setUser } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const handleProfileUpdate = () => {
    // This is a bit of a hack to force the useUser hook to re-render.
    // A more robust solution might involve a dedicated refresh function in the auth context.
    if (user) {
        setUser({...user});
    }
  };


  const coachingLogsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/coachingLogs`));
  }, [firestore, user]);

  const { data: coachingLogs, isLoading: coachingLoading } = useCollection<CoachingLog>(coachingLogsQuery);

   const tournamentHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/tournamentHistory`));
  }, [firestore, user]);

  const { data: tournamentHistory, isLoading: historyLoading } = useCollection<TournamentHistory>(tournamentHistoryQuery);


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
    <div className="bg-muted/40">
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

        <Tabs defaultValue="history">
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="history">Tournament History</TabsTrigger>
            <TabsTrigger value="coaching">Coaching Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Tournament History</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? <Skeleton className="h-40 w-full" /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tournament</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Record</TableHead>
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
                          <TableCell className="text-right">{item.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="coaching">
            <Card>
              <CardHeader>
                <CardTitle>Coaching Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {coachingLoading ? <Skeleton className="h-40 w-full" /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Focus</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coachingLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.date}</TableCell>
                          <TableCell>{log.focus}</TableCell>
                          <TableCell className="max-w-sm truncate">{log.notes}</TableCell>
                          <TableCell className="text-right">{log.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
