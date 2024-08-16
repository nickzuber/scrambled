import React, { FC, createContext } from "react";
import { GlobalStatesOptions, useGlobalStates } from "../hooks/useGlobalState";

export const GlobalStatesContext = createContext<GlobalStatesOptions | null>(
  null,
) as React.Context<GlobalStatesOptions>;

export const GlobalStatesProvider: FC<{}> = ({ children }) => {
  const state = useGlobalStates();

  return <GlobalStatesContext.Provider value={state}>{children}</GlobalStatesContext.Provider>;
};
