import { Player, Gender, TeamSide } from "../types";

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const balanceTeams = (players: Player[]): Player[] => {
  // 1. Sort EVERYONE by sequenceNumber (Arrival Order)
  // This ensures the first people who arrived get priority to play
  const sortedPlayers = [...players].sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

  // 2. Select the Game Pool (Max 12 players)
  const gameCapacity = 12;
  const gamePool = sortedPlayers.slice(0, gameCapacity);
  const waitingPool = sortedPlayers.slice(gameCapacity);

  // 3. Balance the Game Pool into A and B based on Gender
  const men = gamePool.filter(p => p.gender === Gender.MALE);
  const women = gamePool.filter(p => p.gender === Gender.FEMALE);

  // Shuffle the subsets just so A vs B isn't always fixed by arrival order within the game
  const shuffledMen = shuffleArray(men);
  const shuffledWomen = shuffleArray(women);

  const teamA: Player[] = [];
  const teamB: Player[] = [];

  // Distribute Men
  shuffledMen.forEach((p, i) => {
    if (i % 2 === 0) teamA.push({ ...p, team: 'A' });
    else teamB.push({ ...p, team: 'B' });
  });

  // Distribute Women (filling the smaller team first to ensure numerical balance)
  shuffledWomen.forEach(p => {
    if (teamA.length <= teamB.length) {
      teamA.push({ ...p, team: 'A' });
    } else {
      teamB.push({ ...p, team: 'B' });
    }
  });

  // 4. Prepare Waiting List
  const waitingWithTeam = waitingPool.map(p => ({ ...p, team: 'WAITING' as TeamSide }));

  return [...teamA, ...teamB, ...waitingWithTeam];
};

export const getNextTeamForNewPlayer = (players: Player[]): TeamSide => {
  const countA = players.filter(p => p.team === 'A').length;
  const countB = players.filter(p => p.team === 'B').length;
  
  // Strict filling order: Fill A (up to 6), then B (up to 6), then Waiting
  if (countA < 6) return 'A';
  if (countB < 6) return 'B';
  
  return 'WAITING';
};

export const processGameResult = (players: Player[], winnerSide: 'A' | 'B'): Player[] => {
  // Calculate max sequence safely handling potential undefined values
  let maxSeq = players.reduce((max, p) => Math.max(max, p.sequenceNumber || 0), 0);
  
  const winners = players.filter(p => p.team === winnerSide);
  const losers = players.filter(p => p.team !== winnerSide && p.team !== 'WAITING');
  
  // Ensure we sort waiting list safely
  const waiting = players
    .filter(p => p.team === 'WAITING')
    .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
  
  // LOGIC:
  // If Waiting List is "Complete" (Enough for 2 teams, i.e., >= 12 people), EVERYONE LEAVES (Winner + Loser -> End of Queue).
  // Else (Waiting List < 12), WINNER STAYS ON THEIR SIDE, Loser -> End of Queue, Waiting -> Loser's Side.
  
  const isWaitingListFullForTwoTeams = waiting.length >= 12;

  if (isWaitingListFullForTwoTeams) {
    // 1. Move Winners and Losers to end of line
    const oldPlayers = [...winners, ...losers];
    
    // We append them to the end, updating sequence numbers
    const movedToWaiting = oldPlayers.map(p => {
      maxSeq++;
      return { ...p, team: 'WAITING' as TeamSide, sequenceNumber: maxSeq };
    });

    // 2. Promote Top 12 from Waiting to Active
    const nextGameGroup = waiting.slice(0, 12);
    const remainingWaiting = waiting.slice(12);

    // Distribute these 12 into A and B respecting order (Top 6 -> A, Next 6 -> B)
    const nextA = nextGameGroup.slice(0, 6).map(p => ({ ...p, team: 'A' as TeamSide }));
    const nextB = nextGameGroup.slice(6, 12).map(p => ({ ...p, team: 'B' as TeamSide }));

    return [...nextA, ...nextB, ...remainingWaiting, ...movedToWaiting];

  } else {
    // Standard Rotation: Winner Stays, Loser Leaves, Top of Waiting enters.
    
    // 1. Winners stay on their OWN side (A stays A, B stays B)
    const keptWinners = winners.map(p => ({ ...p, team: winnerSide }));

    // 2. Losers go to end of waiting list
    const movedLosers = losers.map(p => {
      maxSeq++;
      return { ...p, team: 'WAITING' as TeamSide, sequenceNumber: maxSeq };
    });

    // 3. Top of waiting list fills the LOSER'S side
    const loserSide = winnerSide === 'A' ? 'B' : 'A';
    const neededForChallengers = 6; // Standard team size
    
    const nextInLine = waiting.slice(0, neededForChallengers);
    const remainingWaiting = waiting.slice(neededForChallengers);

    const newChallengers = nextInLine.map(p => ({ ...p, team: loserSide as TeamSide }));

    return [...keptWinners, ...newChallengers, ...remainingWaiting, ...movedLosers];
  }
};

export const removePlayerAndRefill = (players: Player[], idToRemove: string): Player[] => {
  const playerToRemove = players.find(p => p.id === idToRemove);
  
  // If player doesn't exist, just return the list as is
  if (!playerToRemove) return players;

  // Remove the player from the list
  const remainingPlayers = players.filter(p => p.id !== idToRemove);

  // If the removed player was in WAITING, we don't need to refill anything
  if (playerToRemove.team === 'WAITING') {
    return remainingPlayers;
  }

  // If the removed player was in Team A or Team B, we need to find a substitute
  const waitingPlayers = remainingPlayers
    .filter(p => p.team === 'WAITING')
    .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

  if (waitingPlayers.length > 0) {
    // Get the first player from the waiting list
    const substitute = waitingPlayers[0];
    
    // Create a new list where the substitute is moved to the removed player's team
    return remainingPlayers.map(p => {
      if (p.id === substitute.id) {
        return { ...p, team: playerToRemove.team };
      }
      return p;
    });
  }

  return remainingPlayers;
};