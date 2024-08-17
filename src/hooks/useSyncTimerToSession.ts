import { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../contexts/game";
import { PageContext } from "../contexts/page";
import { TimerStateContext } from "../contexts/timer";
import { Page } from "./usePage";

export function useSyncTimerToSession() {
  const { timer, setTimer } = useContext(TimerStateContext);
  const { page } = useContext(PageContext);
  const { isGameOver } = useContext(GameContext);

  // Ugh.. we do this because we want to udpate the timer state inside
  // the `setInterval` timer but our persisted state doesn't have a true
  // callback function value.
  //
  // There might be a better way of approaching this problem entirely, like
  // storing and computing time when the blur/focus occur, but that limits
  // us (e.g. we can't really show a running timer without some tricks).
  const [tempTimerState, setTempTimerState] = useState(timer);

  useEffect(() => {
    setTimer(tempTimerState);
  }, [tempTimerState, setTimer]);

  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>();

  useEffect(() => {
    function startTimer() {
      // In case this function gets run before `blur` (race condition).
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Only start the timer up if:
      //   1. The game is still running.
      //   2. The page is running the game actively.
      if (isGameOver) return;
      if (page !== Page.Game) return;

      // Update every second.
      timerRef.current = setInterval(() => {
        setTempTimerState((prev) => prev + 1);
      }, 1000);
    }

    function pauseTimer() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    window.addEventListener("focus", startTimer);
    window.addEventListener("blur", pauseTimer);

    // Initial start request.
    startTimer();

    return () => {
      window.removeEventListener("focus", startTimer);
      window.removeEventListener("blur", pauseTimer);
    };
  }, [setTempTimerState, isGameOver, page]);

  return null;
}
