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
  const sortedPlayers = [...players].sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

  // 2. Select the Game Pool (Max 12 players)
  const gameCapacity = 12;
  const gamePool = sortedPlayers.slice(0, gameCapacity);
  const waitingPool = sortedPlayers.slice(gameCapacity);

  // 3. Balance the Game Pool into A and B based on Gender
  const men = gamePool.filter(p => p.gender === Gender.MALE);
  const women = gamePool.filter(p => p.gender === Gender.FEMALE);

  // Shuffle for randomness within the selected pool
  const shuffledMen = shuffleArray(men);
  const shuffledWomen = shuffleArray(women);

  const teamA: Player[] = [];
  const teamB: Player[] = [];

  // Distribute Men (alternating)
  shuffledMen.forEach((p, i) => {
    if (i % 2 === 0) teamA.push({ ...p, team: 'A' });
    else teamB.push({ ...p, team: 'B' });
  });

  // Distribute Women (fill smaller team first)
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
  
  if (countA < 6) return 'A';
  if (countB < 6) return 'B';
  
  return 'WAITING';
};

export const processGameResult = (players: Player[], winnerSide: 'A' | 'B'): Player[] => {
  // 1. Determine highest current sequence number to append players to end of line
  let maxSeq = players.reduce((max, p) => Math.max(max, p.sequenceNumber || 0), 0);
  
  const winners = players.filter(p => p.team === winnerSide);
  // Explicitly cast loserSide to TeamSide to avoid string inference issues
  const loserSide: TeamSide = winnerSide === 'A' ? 'B' : 'A';
  
  // 2. Sort losers by arrival (Low sequence = arrived earlier)
  const losers = players
    .filter(p => p.team === loserSide)
    .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
  
  // 3. Sort waiting list by arrival
  const waiting = players
    .filter(p => p.team === 'WAITING')
    .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
  
  const TEAM_SIZE = 6;
  const waitingCount = waiting.length;
  
  // Prepare next state lists
  let nextWinners = winners.map(p => ({ ...p })); // Winners stay
  let nextLoserSide: Player[] = [];
  let nextWaiting: Player[] = [];

  if (waitingCount >= TEAM_SIZE) {
    // SCENARIO 1: Full Swap
    // Enough players in waiting to replace the whole losing team.
    
    // All losers go to Waiting (new sequence numbers to put them at end)
    const movedLosers = losers.map(p => {
      maxSeq++;
      return { ...p, team: 'WAITING' as TeamSide, sequenceNumber: maxSeq };
    });

    // Top 6 from Waiting enter the team
    const entering = waiting.slice(0, TEAM_SIZE).map(p => ({ ...p, team: loserSide }));
    
    // Remaining Waiting stay in Waiting
    const remainingWaiting = waiting.slice(TEAM_SIZE);

    nextLoserSide = entering;
    nextWaiting = [...remainingWaiting, ...movedLosers];

  } else {
    // SCENARIO 2: Partial Swap (Not enough waiters)
    // Rule: "Se não tiver 6... ficará no time o jogador que chegou primeiro"
    
    // Number of spots we can fill with waiting players
    const spotsToFill = waitingCount;
    // Number of losers we MUST keep to complete the team of 6
    const spotsToKeep = TEAM_SIZE - spotsToFill;
    
    // We keep the "Oldest" losers (First arrived -> Lowest sequence)
    // losers array is already sorted by sequence ascending.
    const stayers = losers.slice(0, spotsToKeep);
    const leavers = losers.slice(spotsToKeep);

    // Update Stayers: They stay on team, but get new sequence numbers 
    // so they become the "newest" members of the team (rotate out last next time)
    const updatedStayers = stayers.map(p => {
      maxSeq++;
      return { ...p, team: loserSide, sequenceNumber: maxSeq };
    });

    // All waiting players enter the team
    const entering = waiting.map(p => ({ ...p, team: loserSide }));

    // The "Leavers" (Newer losers) go to waiting list
    const movedLeavers = leavers.map(p => {
      maxSeq++;
      return { ...p, team: 'WAITING' as TeamSide, sequenceNumber: maxSeq };
    });

    nextLoserSide = [...entering, ...updatedStayers];
    nextWaiting = movedLeavers;
  }

  return [...nextWinners, ...nextLoserSide, ...nextWaiting];
};

export const removePlayerAndRefill = (players: Player[], idToRemove: string): Player[] => {
  const playerToRemove = players.find(p => p.id === idToRemove);
  if (!playerToRemove) return players;

  const remainingPlayers = players.filter(p => p.id !== idToRemove);

  if (playerToRemove.team === 'WAITING') {
    return remainingPlayers;
  }

  const waitingPlayers = remainingPlayers
    .filter(p => p.team === 'WAITING')
    .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

  if (waitingPlayers.length > 0) {
    const substitute = waitingPlayers[0];
    return remainingPlayers.map(p => {
      if (p.id === substitute.id) {
        return { ...p, team: playerToRemove.team };
      }
      return p;
    });
  }

  return remainingPlayers;
};