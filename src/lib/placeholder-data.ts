export const tournaments = [
  {
    id: 't1',
    name: 'Summer Showdown 2024',
    date: 'July 20-22, 2024',
    location: 'Grand Park, Westfield, IN',
    teams: ['Red Dragons', 'Blue Jays', 'Green Giants', 'Yellow Jackets'],
    standings: [
      { rank: 1, team: 'Red Dragons', wins: 3, losses: 0, points: 9 },
      { rank: 2, team: 'Green Giants', wins: 2, losses: 1, points: 6 },
      { rank: 3, team: 'Blue Jays', wins: 1, losses: 2, points: 3 },
      { rank: 4, team: 'Yellow Jackets', wins: 0, losses: 3, points: 0 },
    ],
    imageId: 'tournament_image_1'
  },
  {
    id: 't2',
    name: 'Autumn Invitational',
    date: 'October 12-14, 2024',
    location: 'Surf Cup Sports Park, Del Mar, CA',
    teams: ['Black Knights', 'White Wizards', 'Silver Sharks', 'Bronze Bears'],
    standings: [
        { rank: 1, team: 'White Wizards', wins: 3, losses: 0, points: 9 },
        { rank: 2, team: 'Black Knights', wins: 2, losses: 1, points: 6 },
        { rank: 3, team: 'Bronze Bears', wins: 1, losses: 2, points: 3 },
        { rank: 4, team: 'Silver Sharks', wins: 0, losses: 3, points: 0 },
    ],
    imageId: 'tournament_image_2'
  },
];

export const teams = [
  {
    id: 'team1',
    name: 'Red Dragons',
    captain: 'User',
    roster: [
      { id: 'p1', name: 'Alice', number: 7, imageId: 'user_avatar_1' },
      { id: 'p2', name: 'Bob', number: 12, imageId: 'user_avatar_2' },
      { id: 'p3', name: 'Charlie', number: 99, imageId: 'user_avatar_3' },
    ],
    imageId: 'team_logo_1'
  },
    {
    id: 'team2',
    name: 'Dynamo FC',
    captain: 'User',
    roster: [
      { id: 'p4', name: 'David', number: 10, imageId: 'user_avatar_4' },
      { id: 'p5', name: 'Eve', number: 5, imageId: 'user_avatar_5' },
    ],
    imageId: 'team_logo_2'
  },
];

export const liveScores = [
  {
    id: 'g1',
    teamA: { name: 'Red Dragons', score: 10, imageId: 'team_logo_1' },
    teamB: { name: 'Blue Jays', score: 8, imageId: 'team_logo_3' },
    status: 'In Progress',
    time: '3rd Quarter'
  },
  {
    id: 'g2',
    teamA: { name: 'Green Giants', score: 12, imageId: 'team_logo_4' },
    teamB: { name: 'Yellow Jackets', score: 12, imageId: 'team_logo_5' },
    status: 'In Progress',
    time: 'Halftime'
  },
  {
    id: 'g3',
    teamA: { name: 'Black Knights', score: 5, imageId: 'team_logo_6' },
    teamB: { name: 'White Wizards', score: 14, imageId: 'team_logo_7' },
    status: 'Final',
    time: 'FT'
  },
];

export const coachingLogs = [
  {
    id: 'cl1',
    date: '2024-06-15',
    focus: 'Throwing Mechanics',
    notes: 'Worked on backhand and forehand form. Showed significant improvement in accuracy.',
    duration: '60 min',
  },
  {
    id: 'cl2',
    date: '2024-06-18',
    focus: 'Defensive Positioning',
    notes: 'Drills on man-to-man defense. Emphasized footwork and hip rotation.',
    duration: '90 min',
  },
  {
    id: 'cl3',
    date: '2024-06-22',
    focus: 'Cutting and Field Awareness',
    notes: 'Practiced timing on cuts and reading the field. Better spacing observed.',
    duration: '75 min',
  },
];

export const tournamentHistory = [
  {
    id: 'th1',
    tournamentName: 'Spring Fling 2024',
    team: 'Red Dragons',
    result: 'Champions',
    record: '5-0',
    date: '2024-04-12',
  },
  {
    id: 'th2',
    tournamentName: 'Winter Classic 2023',
    team: 'Red Dragons',
    result: '3rd Place',
    record: '3-2',
    date: '2023-12-09',
  },
  {
    id: 'th3',
    tournamentName: 'Fall Brawl 2023',
    team: 'Dynamo FC',
    result: 'Quarter-finalist',
    record: '2-2',
    date: '2023-10-21',
  },
];
