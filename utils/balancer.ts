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
  const loserSide: TeamSide = winnerSide === 'A' ? 'B' : 'A';
  
  // Sort losers by arrival (sequenceNumber) ascending (Low = arrived first/oldest)
  const losers = players
    .filter(p => p.team === loserSide)
    .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
  
  // Sort waiting list
  const waiting = players
    .filter(p => p.team === 'WAITING')
    .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
  
  const TEAM_SIZE = 6;
  const waitingCount = waiting.length;
  
  // Lists for the next state
  let nextWinners = winners.map(p => ({ ...p })); // Winners stay as is (preserve sequence)
  let nextLoserSide: Player[] = [];
  let nextWaiting: Player[] = [];

  if (waitingCount >= TEAM_SIZE) {
    // SCENARIO 1: Enough substitutes for a full team swap
    // (Standard Logic: Winners Stay, Losers go to Waiting, Waiting enters)
    
    // 1. All losers go to Waiting (End of line)
    const movedLosers = losers.map(p => {
      maxSeq++;
      return { ...p, team: 'WAITING' as TeamSide, sequenceNumber: maxSeq };
    });

    // 2. Top 'TEAM_SIZE' from Waiting go to Loser Side
    const entering = waiting.slice(0, TEAM_SIZE).map(p => ({ ...p, team: loserSide }));
    
    // 3. Remaining Waiting stay in Waiting
    const remainingWaiting = waiting.slice(TEAM_SIZE);

    nextLoserSide = entering;
    nextWaiting = [...remainingWaiting, ...movedLosers];

  } else {
    // SCENARIO 2: Not enough substitutes (Partial swap)
    
    // We need to fill TEAM_SIZE spots.
    // We have waitingCount available.
    // We need to keep (TEAM_SIZE - waitingCount) players from the losing team.
    const numToKeep = Math.max(0, TEAM_SIZE - waitingCount);
    
    // "Ficará no time o jogador que chegou primeiro"
    // Since we sorted 'losers' by sequenceNumber ascending, the first elements are the "oldest".
    const losersToStay = losers.slice(0, numToKeep);
    const losersToLeave = losers.slice(numToKeep);

    // "Ficando entre os últimos do time" -> They stay on the team, but get updated sequence numbers 
    // to reflect they are now effectively "newer" than the winners or existing players, 
    // ensuring rotation in future rounds.
    const updatedStaying = losersToStay.map(p => {
      maxSeq++;
      return { ...p, team: loserSide, sequenceNumber: maxSeq };
    });

    // Leaving losers go to Waiting (End of line)
    const movedLosers = losersToLeave.map(p => {
      maxSeq++;
      return { ...p, team: 'WAITING' as TeamSide, sequenceNumber: maxSeq };
    });

    // All currently waiting players enter the team
    const entering = waiting.map(p => ({ ...p, team: loserSide }));

    nextLoserSide = [...entering, ...updatedStaying];
    nextWaiting = movedLosers;
  }

  return [...nextWinners, ...nextLoserSide, ...nextWaiting];
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