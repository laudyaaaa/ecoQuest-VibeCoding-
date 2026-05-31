export type GameState = 'INTRO' | 'MAP' | 'MISSION' | 'OUTCOME' | 'GAMEOVER' | 'VICTORY';

export type HeroType = 'SEA' | 'FOREST' | 'AIR';

export interface Player {
  name: string;
  type: HeroType;
  xp: number;
  level: number;
  ecoScore: number;
  badges: string[];
}

export type CityStatus = 'DANGER' | 'WARNING' | 'SAFE';

export interface City {
  id: string;
  name: string;
  status: CityStatus;
  completed: boolean;
  description: string;
}

export interface Choice {
  id: string;
  text: string;
}

export interface MissionData {
  story: string;
  choices: Choice[];
}

export interface OutcomeData {
  label: string;
  outcomeStory: string;
  explanation: string;
  xpChange: number;
  ecoScoreChange: number;
  fact: string;
}

export interface LevelInfo {
  title: string;
  minXp: number;
}
