import { PersistedStates } from "../constants/state";
import createPersistedState from "../libs/use-persisted-state";

const useSubmitCounter = createPersistedState<number>(PersistedStates.SubmitCounter);
const useFirstTime = createPersistedState<boolean>(PersistedStates.FirstTime);
const useIsGameOver = createPersistedState<boolean>(PersistedStates.GameOver);
const useHardMode = createPersistedState<boolean>(PersistedStates.HardMode);
const useScoreMode = createPersistedState<boolean>(PersistedStates.ScoreMode);

export type GlobalStatesOptions = ReturnType<typeof useGlobalStates>;

export function useGlobalStates() {
  const [submitCount, setSubmitCount] = useSubmitCounter(0);
  const [isFirstTime, setIsFirstTime] = useFirstTime(false);
  const [isGameOver, setIsGameOver] = useIsGameOver(false);
  const [hardMode, setHardMode] = useHardMode(false);
  const [scoreMode, setScoreMode] = useScoreMode(false);

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
  };
}
