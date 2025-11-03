
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
// This uses service account credentials for backend access, which you need to create
// in your Firebase project settings and provide as environment variables.
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

type Match = {
  id: string;
  tournamentId: string;
  teamA: { name: string; score: number; };
  teamB: { name: string; score: number; };
  status: string;
}

type Standing = {
  rank: number;
  team: string;
  wins: number;
  losses: number;
  points: number;
}

export async function POST(req: NextRequest) {
  const { tournamentId, secret } = await req.json();

  // Basic security: check for a secret key
  if (secret !== process.env.STANDINGS_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!tournamentId) {
    return NextResponse.json({ error: 'Missing tournamentId' }, { status: 400 });
  }

  try {
    // 1. Fetch all matches for the tournament that are 'Final'
    const matchesSnapshot = await db.collection('matches')
      .where('tournamentId', '==', tournamentId)
      .where('status', '==', 'Final')
      .get();

    const matches = matchesSnapshot.docs.map(doc => doc.data() as Match);

    // 2. Fetch the tournament document to get the list of all registered teams
    const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();
    if (!tournamentDoc.exists) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    const tournamentData = tournamentDoc.data();
    const teamIds = tournamentData?.teamIds || [];

    // Fetch team names
    const teamDocs = await Promise.all(teamIds.map((id: string) => db.collection('teams').doc(id).get()));
    const teamIdToNameMap = new Map(teamDocs.map(doc => [doc.id, doc.data()?.name]));


    // 3. Calculate stats for each team
    const stats: { [key: string]: { wins: number, losses: number, points: number } } = {};
    
    // Initialize stats for all registered teams
    teamIdToNameMap.forEach(name => {
        if(name) {
            stats[name] = { wins: 0, losses: 0, points: 0 };
        }
    });

    matches.forEach(match => {
      const teamAName = match.teamA.name;
      const teamBName = match.teamB.name;
      const scoreA = match.teamA.score;
      const scoreB = match.teamB.score;

      if (scoreA > scoreB) { // Team A wins
        stats[teamAName].wins += 1;
        stats[teamAName].points += 3;
        stats[teamBName].losses += 1;
      } else if (scoreB > scoreA) { // Team B wins
        stats[teamBName].wins += 1;
        stats[teamBName].points += 3;
        stats[teamAName].losses += 1;
      } else { // Draw
        stats[teamAName].points += 1;
        stats[teamBName].points += 1;
      }
    });

    // 4. Create and sort standings array
    const newStandings: Omit<Standing, 'rank'>[] = Object.entries(stats).map(([team, data]) => ({
      team,
      ...data,
    }));

    newStandings.sort((a, b) => {
      // Sort by points descending, then by wins descending
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.wins - a.wins;
    });

    const rankedStandings: Standing[] = newStandings.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // 5. Update the tournament document in Firestore
    await db.collection('tournaments').doc(tournamentId).update({
      standings: rankedStandings,
    });

    return NextResponse.json({ success: true, newStandings: rankedStandings });
  } catch (error) {
    console.error('Error updating standings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
