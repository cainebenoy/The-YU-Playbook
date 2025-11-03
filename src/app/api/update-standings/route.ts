
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { format } from 'date-fns';

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

type Team = {
    id: string;
    name: string;
    roster: { id: string; name: string; }[];
}

type Match = {
  id: string;
  tournamentId: string;
  teamA: { id: string; name: string; score: number; };
  teamB: { id: string; name: string; score: number; };
  status: string;
}

type Standing = {
  rank: number;
  team: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}

type TournamentHistory = {
    tournamentName: string;
    team: string;
    result: 'Win' | 'Loss' | 'Draw';
    record: string;
    date: string;
    userId: string;
}

const createTournamentHistory = async (
    teamId: string,
    result: 'Win' | 'Loss' | 'Draw',
    record: string,
    tournamentName: string
) => {
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) return;

    const teamData = teamDoc.data() as Team;
    const batch = db.batch();
    
    if (teamData.roster && teamData.roster.length > 0) {
        teamData.roster.forEach(player => {
            const historyDocRef = db.collection('users').doc(player.id).collection('tournamentHistory').doc();
            const historyEntry: TournamentHistory = {
                tournamentName: tournamentName,
                team: teamData.name,
                result: result,
                record: record,
                date: format(new Date(), 'yyyy-MM-dd'),
                userId: player.id,
            };
            batch.set(historyDocRef, historyEntry);
        });
    }
    await batch.commit();
}


export async function POST(req: NextRequest) {
  const { tournamentId, secret } = await req.json();

  if (secret !== process.env.STANDINGS_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!tournamentId) {
    return NextResponse.json({ error: 'Missing tournamentId' }, { status: 400 });
  }

  try {
    const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();
    if (!tournamentDoc.exists) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    const tournamentData = tournamentDoc.data();
    if (!tournamentData) {
       return NextResponse.json({ error: 'Tournament data not found' }, { status: 404 });
    }
    
    const matchesSnapshot = await db.collection('matches')
      .where('tournamentId', '==', tournamentId)
      .where('status', '==', 'Final')
      .get();

    const matches = matchesSnapshot.docs.map(doc => ({...doc.data(), id: doc.id }) as Match);
    
    const teamIds = tournamentData?.teamIds || [];

    const teamDocs = await Promise.all(teamIds.map((id: string) => db.collection('teams').doc(id).get()));
    const teamIdToNameMap = new Map(teamDocs.map(doc => [doc.id, doc.data()?.name]));

    const stats: { [key: string]: { wins: number, losses: number, draws: number, points: number } } = {};
    
    teamIdToNameMap.forEach(name => {
        if(name) {
            stats[name] = { wins: 0, losses: 0, draws: 0, points: 0 };
        }
    });

    const historyCreationPromises: Promise<void>[] = [];

    matches.forEach(match => {
      const teamAName = match.teamA.name;
      const teamBName = match.teamB.name;
      const teamAId = match.teamA.id;
      const teamBId = match.teamB.id;
      const scoreA = match.teamA.score;
      const scoreB = match.teamB.score;

      if (scoreA > scoreB) { // Team A wins
        if(stats[teamAName]) {
            stats[teamAName].wins += 1;
            stats[teamAName].points += 3;
        }
        if(stats[teamBName]) {
            stats[teamBName].losses += 1;
        }
        historyCreationPromises.push(createTournamentHistory(teamAId, 'Win', `${scoreA}-${scoreB}`, tournamentData.name));
        historyCreationPromises.push(createTournamentHistory(teamBId, 'Loss', `${scoreB}-${scoreA}`, tournamentData.name));

      } else if (scoreB > scoreA) { // Team B wins
        if(stats[teamBName]) {
            stats[teamBName].wins += 1;
            stats[teamBName].points += 3;
        }
        if(stats[teamAName]) {
            stats[teamAName].losses += 1;
        }
        historyCreationPromises.push(createTournamentHistory(teamBId, 'Win', `${scoreB}-${scoreA}`, tournamentData.name));
        historyCreationPromises.push(createTournamentHistory(teamAId, 'Loss', `${scoreA}-${scoreB}`, tournamentData.name));
      } else { // Draw
        if(stats[teamAName]) {
            stats[teamAName].draws += 1;
            stats[teamAName].points += 1;
        }
        if(stats[teamBName]) {
            stats[teamBName].draws += 1;
            stats[teamBName].points += 1;
        }
        historyCreationPromises.push(createTournamentHistory(teamAId, 'Draw', `${scoreA}-${scoreB}`, tournamentData.name));
        historyCreationPromises.push(createTournamentHistory(teamBId, 'Draw', `${scoreB}-${scoreA}`, tournamentData.name));
      }
    });

    await Promise.all(historyCreationPromises);
    
    const newStandings: Omit<Standing, 'rank'>[] = Object.entries(stats).map(([team, data]) => ({
      team,
      ...data,
    }));

    newStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });

    const rankedStandings: Standing[] = newStandings.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    await db.collection('tournaments').doc(tournamentId).update({
      standings: rankedStandings,
    });

    return NextResponse.json({ success: true, newStandings: rankedStandings });
  } catch (error) {
    console.error('Error updating standings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
