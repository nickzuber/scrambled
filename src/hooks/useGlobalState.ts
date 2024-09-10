import { useState } from "react";
import { PersistedStates } from "../constants/state";
import createPersistedState from "../libs/use-persisted-state";

const useFirstTime = createPersistedState<boolean>(PersistedStates.FirstTime);
const useIsGameOver = createPersistedState<boolean>(PersistedStates.GameOver);
const useHardMode = createPersistedState<boolean>(PersistedStates.HardMode);
const useScoreMode = createPersistedState<boolean>(PersistedStates.ScoreMode);

const useStreak = createPersistedState<number>(PersistedStates.Streak);
const useTotalWordCount = createPersistedState<number>(PersistedStates.TotalWordCount);
const useTotalPointCount = createPersistedState<number>(PersistedStates.TotalPointCount);
const useHighestScore = createPersistedState<number>(PersistedStates.HighestScore);
const useHighestStreak = createPersistedState<number>(PersistedStates.HighestStreak);
const useTotalCompletionCount = createPersistedState<number>(
  PersistedStates.TotalCompletionCount,
);
const useLastCompletedPuzzleNumber = createPersistedState<number | undefined>(
  PersistedStates.LastCompledPuzzleNumber,
);
const useMostWordsInAPuzzle = createPersistedState<number>(PersistedStates.MostWordsInAPuzzle);
const useFastedCompletion = createPersistedState<number | undefined>(
  PersistedStates.FastedCompletion,
);
const useShowTimer = createPersistedState<boolean>(PersistedStates.ShowTimer);
const useShareHideSolution = createPersistedState<boolean>(PersistedStates.ShareHideSolution);

export type GlobalStatesOptions = ReturnType<typeof useGlobalStates>;

export function useGlobalStates() {
  const [submitCount, setSubmitCount] = useState(0);
  const [isFirstTime, setIsFirstTime] = useFirstTime(true);
  const [isGameOver, setIsGameOver] = useIsGameOver(false);
  const [hardMode, setHardMode] = useHardMode(false);
  const [scoreMode, setScoreMode] = useScoreMode(false);
  const [showTimer, setShowTimer] = useShowTimer(false);
  const [shareHideSolution, setShareHideSolution] = useShareHideSolution(false);

  const [streakCount, setStreakCount] = useStreak(0);
  const [totalWordCount, setTotalWordCount] = useTotalWordCount(0);
  const [totalPointCount, setTotalPointCount] = useTotalPointCount(0);
  const [highestScore, setHighestScore] = useHighestScore(0);
  const [highestStreak, setHighestStreak] = useHighestStreak(0);
  const [totalCompletionCount, setTotalCompletionCount] = useTotalCompletionCount(0);
  const [lastCompletedPuzzleNumber, setLastCompletedPuzzleNumber] =
    useLastCompletedPuzzleNumber(undefined);
  const [mostWordsInAPuzzle, setMostWordsInAPuzzle] = useMostWordsInAPuzzle(0);
  const [fastedCompletion, setFastedCompletion] = useFastedCompletion(undefined);

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

    showTimer,
    setShowTimer,

    streakCount,
    setStreakCount,

    totalWordCount,
    setTotalWordCount,

    highestScore, 
    setHighestScore,

    highestStreak, 
    setHighestStreak,

    totalPointCount,
    setTotalPointCount,

    totalCompletionCount,
    setTotalCompletionCount,

    lastCompletedPuzzleNumber,
    setLastCompletedPuzzleNumber,

    mostWordsInAPuzzle,
    setMostWordsInAPuzzle,

    fastedCompletion,
    setFastedCompletion,

    shareHideSolution,
    setShareHideSolution,
  };
}
