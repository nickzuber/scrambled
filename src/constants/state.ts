import { seed } from "../utils/words-helper";

export const PersistedStorage = {
  // Longer lasting data.
  // There should be no logic for deleting this.
  Stamp: "_cross-wordle-game__",

  // Unique string for dividing data when it should be deleted.
  // ===============
  // === WARNING ===
  // ===============
  // Any key marked with both this and `Stamp` WILL BE deleted
  // at the start of a new day.
  SeedDivider: "_.-sEeD-dIvIdEr-._",
};

export const PersistedStates = {
  // Ephemeral bits of data that will be reset at the start of each day.
  GameOver: seed + PersistedStorage.SeedDivider + PersistedStorage.Stamp + "game-over",
  Board: seed + PersistedStorage.SeedDivider + PersistedStorage.Stamp + "todays-board",
  Letters: seed + PersistedStorage.SeedDivider + PersistedStorage.Stamp + "todays-letters",

  // Long lasting bits of data.
  SubmitCounter: PersistedStorage.Stamp + "submit-counter",
  FirstTime: PersistedStorage.Stamp + "first-time",
  /** @deprecated */
  Stats: PersistedStorage.Stamp + "stats",
  DarkTheme: PersistedStorage.Stamp + "dark-theme",
  HardMode: PersistedStorage.Stamp + "hard-mode",
  ScoreMode: PersistedStorage.Stamp + "score-mode",
  Streak: PersistedStorage.Stamp + "streak",
  TotalWordCount: PersistedStorage.Stamp + "total-word-count",
  TotalCompletionCount: PersistedStorage.Stamp + "total-completion-count",
  LastCompledPuzzleNumber: PersistedStorage.Stamp + "last-completion-ts",
  MostWordsInAPuzzle: PersistedStorage.Stamp + "most-words-in-a-puzzle",
};
