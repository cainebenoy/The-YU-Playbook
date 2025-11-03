import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tournaments } from '@/lib/placeholder-data';
import placeholderImages from '@/lib/placeholder-images.json';
import { MapPin, Calendar } from 'lucide-react';

export default function TournamentsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Tournaments</h1>
        <p className="mt-4 text-lg text-muted-foreground">Find and follow upcoming tournaments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tournaments.map(tournament => {
          const tournamentImage = placeholderImages.placeholderImages.find(p => p.id === tournament.imageId);
          return (
          <Card key={tournament.id} className="overflow-hidden">
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
              </div>
            </CardHeader>
            <CardContent>
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
                        {tournament.standings.map(standing => (
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
          </Card>
        )})}
      </div>
    </div>
  );
}
