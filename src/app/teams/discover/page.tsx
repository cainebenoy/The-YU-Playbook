'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';
import { Users, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Team = {
  id: string;
  name: string;
  roster: any[];
  imageId: string;
  coachId: string;
};

type JoinRequest = {
  id: string;
  status: 'pending' | 'approved' | 'denied';
}

const RequestToJoinButton = ({ teamId }: { teamId: string }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `teams/${teamId}/joinRequests`, user.uid);
  }, [firestore, teamId, user]);

  const { data: request, isLoading } = useDoc<JoinRequest>(requestRef);

  const handleRequest = () => {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'You must be logged in to join a team.' });
      return;
    }
    setIsSubmitting(true);
    const requestDocRef = doc(firestore, `teams/${teamId}/joinRequests`, user.uid);
    const newRequest = {
      displayName: user.displayName || user.email,
      photoURL: user.photoURL || '',
      status: 'pending',
    };
    setDocumentNonBlocking(requestDocRef, newRequest, {});
    toast({ title: 'Request Sent', description: 'Your request to join the team has been sent to the coach.' });
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (request?.status === 'pending') {
    return <Button disabled className="w-full"><Clock className="mr-2 h-4 w-4"/>Request Pending</Button>;
  }

  // A more complex check would be needed to see if the user is ALREADY on the roster
  // For now, we assume if a request existed and is gone, it was approved.
  // A better implementation would check the team's roster array.

  return (
    <Button onClick={handleRequest} disabled={isSubmitting} className="w-full">
      {isSubmitting ? 'Sending...' : 'Request to Join'}
    </Button>
  );
};


const TeamCard = ({ team }: { team: Team }) => {
  const teamImage = placeholderImages.placeholderImages.find(p => p.id === team.imageId);
  const { user } = useUser();

  const isCoach = user?.uid === team.coachId;
  const isPlayer = team.roster?.some(p => p.id === user?.uid);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {teamImage && <Image src={teamImage.imageUrl} alt={team.name} width={60} height={60} className="rounded-md" data-ai-hint={teamImage.imageHint} />}
        <div>
          <CardTitle className="font-headline">{team.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {team.roster?.length || 0} players
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        {isCoach ? (
             <Button disabled className="w-full" variant="outline">You are the coach</Button>
        ) : isPlayer ? (
            <Button disabled className="w-full"><Check className="mr-2 h-4 w-4" />Joined</Button>
        ) : (
            <RequestToJoinButton teamId={team.id} />
        )}
      </CardFooter>
    </Card>
  );
};

const DiscoverSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-[60px] w-[60px] rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </CardHeader>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function DiscoverTeamsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/teams/discover');
    }
  }, [isUserLoading, user, router]);

  const teamsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'teams'));
  }, [firestore]);

  const { data: teams, isLoading } = useCollection<Team>(teamsQuery);

  if (isUserLoading || !user) {
    return (
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">Discover Teams</h1>
                <p className="mt-4 text-lg text-muted-foreground">Find a team and start your journey.</p>
            </div>
            <DiscoverSkeleton />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Discover Teams</h1>
        <p className="mt-4 text-lg text-muted-foreground">Find a team and start your journey.</p>
      </div>

      {isLoading ? <DiscoverSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams?.map(team => <TeamCard key={team.id} team={team} />)}
        </div>
      )}
    </div>
  );
}
