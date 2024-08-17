import React, { FC, createContext } from "react";
import { TimerStateOptions, useTimerState } from "../hooks/useTimerState";

export const TimerStateContext = createContext<TimerStateOptions | null>(
  null,
) as React.Context<TimerStateOptions>;

export const TimerStateProvider: FC<{}> = ({ children }) => {
  const state = useTimerState();

  return <TimerStateContext.Provider value={state}>{children}</TimerStateContext.Provider>;
};
