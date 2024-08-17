import { PersistedStates } from "../constants/state";
import createPersistedState from "../libs/use-persisted-state";

const useTimer = createPersistedState<number>(PersistedStates.Timer);

export type TimerStateOptions = ReturnType<typeof useTimerState>;

export function useTimerState() {
  const [timer, setTimer] = useTimer(0);

  return {
    timer,
    setTimer,
  };
}
