import { seed } from "../utils/words-helper";

export const PersistedStorage = {
  Stamp: "_cross-wordle-game__",
  SeedDivider: "_.-sEeD-dIvIdEr-._",
};

export const PersistedStates = {
  SubmitCounter: PersistedStorage.Stamp + "submit-counter",
  FirstTime: PersistedStorage.Stamp + "first-time",
  GameOver: seed + PersistedStorage.SeedDivider + PersistedStorage.Stamp + "game-over",
  Board: seed + PersistedStorage.SeedDivider + PersistedStorage.Stamp + "todays-board",
  Letters: seed + PersistedStorage.SeedDivider + PersistedStorage.Stamp + "todays-letters",
  /** @deprecated */
  Stats: PersistedStorage.Stamp + "stats",
  DarkTheme: PersistedStorage.Stamp + "dark-theme",
  HardMode: PersistedStorage.Stamp + "hard-mode",
  ScoreMode: PersistedStorage.Stamp + "score-mode",

  Streak: PersistedStorage.Stamp + "streak",
  TotalWordCount: PersistedStorage.Stamp + "total-word-count",
  TotalCompletionCount: PersistedStorage.Stamp + "total-completion-count",
  LastCompledPuzzleNumber: PersistedStorage.Stamp + "last-completion-ts",
};
