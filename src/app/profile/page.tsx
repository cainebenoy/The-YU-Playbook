"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { coachingLogs, tournamentHistory } from "@/lib/placeholder-data";
import { Skeleton } from "@/components/ui/skeleton";
import placeholderImages from "@/lib/placeholder-images.json";

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === "user_avatar_1");

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

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-12">
          <Avatar className="h-24 w-24 border-4 border-background">
             {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.email || 'User'} data-ai-hint={userAvatar.imageHint}/>}
            <AvatarFallback className="text-3xl">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-headline font-bold">
              {user.email?.split('@')[0] || "User Profile"}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
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
                    {tournamentHistory.map((item) => (
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
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="coaching">
            <Card>
              <CardHeader>
                <CardTitle>Coaching Logs</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {coachingLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.date}</TableCell>
                        <TableCell>{log.focus}</TableCell>
                        <TableCell className="max-w-sm truncate">{log.notes}</TableCell>
                        <TableCell className="text-right">{log.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
