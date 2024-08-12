import { ThemeProvider } from "@emotion/react";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useMemo } from "react";
import "./App.css";
import { PersistedStates } from "./constants/state";
import { Themes } from "./constants/themes";
import { GameProvider } from "./contexts/game";
import { ModalsProvider } from "./contexts/modals";
import { PageProvider } from "./contexts/page";
import { ToastProvider } from "./contexts/toast";
import "./layout.css";
import createPersistedState from "./libs/use-persisted-state";
import { Scene } from "./Scene";

const useDarkTheme = createPersistedState(PersistedStates.DarkTheme);

function App() {
  const [darkTheme] = useDarkTheme() as [boolean, unknown];

  const theme = useMemo(() => (darkTheme ? Themes.Dark : Themes.Light), [darkTheme]);

  useEffect(() => {
    document.body.style.background = theme.colors.primary;
    document.body.style.color = theme.colors.text;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <Analytics />
      <ModalsProvider>
        <ToastProvider>
          <PageProvider>
            <GameProvider>
              <Scene />
            </GameProvider>
          </PageProvider>
        </ToastProvider>
      </ModalsProvider>
    </ThemeProvider>
  );
}

export default App;
