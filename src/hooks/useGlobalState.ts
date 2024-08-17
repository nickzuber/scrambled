import { useState } from "react";
import { PersistedStates } from "../constants/state";
import createPersistedState from "../libs/use-persisted-state";

const useSubmitCounter = createPersistedState<number>(PersistedStates.SubmitCounter);
const useFirstTime = createPersistedState<boolean>(PersistedStates.FirstTime);
const useIsGameOver = createPersistedState<boolean>(PersistedStates.GameOver);
const useHardMode = createPersistedState<boolean>(PersistedStates.HardMode);
const useScoreMode = createPersistedState<boolean>(PersistedStates.ScoreMode);

const useStreak = createPersistedState<number>(PersistedStates.Streak);
const useTotalWordCount = createPersistedState<number>(PersistedStates.TotalWordCount);
const useTotalCompletionCount = createPersistedState<number>(
  PersistedStates.TotalCompletionCount,
);
const useLastCompletedPuzzleNumber = createPersistedState<number | undefined>(
  PersistedStates.LastCompledPuzzleNumber,
);
const useMostWordsInAPuzzle = createPersistedState<number>(PersistedStates.MostWordsInAPuzzle);

export type GlobalStatesOptions = ReturnType<typeof useGlobalStates>;

export function useGlobalStates() {
  const [submitCount, setSubmitCount] = useState(0);
  const [isFirstTime, setIsFirstTime] = useFirstTime(false);
  const [isGameOver, setIsGameOver] = useIsGameOver(false);
  const [hardMode, setHardMode] = useHardMode(false);
  const [scoreMode, setScoreMode] = useScoreMode(false);

  const [streakCount, setStreakCount] = useStreak(0);
  const [totalWordCount, setTotalWordCount] = useTotalWordCount(0);
  const [totalCompletionCount, setTotalCompletionCount] = useTotalCompletionCount(0);
  const [lastCompletedPuzzleNumber, setLastCompletedPuzzleNumber] =
    useLastCompletedPuzzleNumber(undefined);
  const [mostWordsInAPuzzle, setMostWordsInAPuzzle] = useMostWordsInAPuzzle(0);

  return {
    submitCount,
    setSubmitCount,

    isFirstTime,
    setIsFirstTime,

    isGameOver,
    setIsGameOver,

    hardMode,
    setHardMode,

    scoreMode,
    setScoreMode,

    streakCount,
    setStreakCount,

    totalWordCount,
    setTotalWordCount,

    totalCompletionCount,
    setTotalCompletionCount,

    lastCompletedPuzzleNumber,
    setLastCompletedPuzzleNumber,

    mostWordsInAPuzzle,
    setMostWordsInAPuzzle,
  };
}
