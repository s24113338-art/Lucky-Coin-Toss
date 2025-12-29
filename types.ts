
export interface GameState {
  isTossing: boolean;
  result: number | null;
  history: number[];
  dealerMessage: string;
  balance: number;
  betAmount: number;
  isBetPlaced: boolean;
  selectedNumbers: number[];
  streak: number;
  logs: string[];
}

export interface GridCell {
  id: number;
  label: string;
}

export const GRID_CONFIG = {
  rows: 3,
  cols: 4,
  numbers: Array.from({ length: 12 }, (_, i) => i + 1)
};
