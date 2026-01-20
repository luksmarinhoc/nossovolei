export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Feminino'
}

export type TeamSide = 'A' | 'B' | 'WAITING';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  team: TeamSide;
  sequenceNumber: number;
  createdAt: number;
}