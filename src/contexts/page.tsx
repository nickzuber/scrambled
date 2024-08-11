import React, { FC, createContext } from "react";
import { PageProps, usePage } from "../hooks/usePage";

export const PageContext = createContext<PageProps | null>(null) as React.Context<PageProps>;

export const PageProvider: FC<{}> = ({ children }) => {
  const state = usePage();

  return <PageContext.Provider value={state}>{children}</PageContext.Provider>;
};
