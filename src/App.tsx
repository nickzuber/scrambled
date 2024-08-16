import { ThemeProvider } from "@emotion/react";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useMemo } from "react";
import "./App.css";
import { PersistedStates } from "./constants/state";
import { Themes } from "./constants/themes";
import { GameProvider } from "./contexts/game";
import { GlobalStatesProvider } from "./contexts/global";
import { ModalsProvider } from "./contexts/modals";
import { PageProvider } from "./contexts/page";
import { ToastProvider } from "./contexts/toast";
import "./layout.css";
import createPersistedState from "./libs/use-persisted-state";
import { Scene } from "./Scene";

const useDarkTheme = createPersistedState<boolean>(PersistedStates.DarkTheme);

function App() {
  const [darkTheme, setDarkTheme] = useDarkTheme(false);

  const theme = useMemo(() => (darkTheme ? Themes.Dark : Themes.Light), [darkTheme]);

  useEffect(() => {
    document.body.style.background = theme.colors.primary;
    document.body.style.color = theme.colors.text;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <Analytics />
      <GlobalStatesProvider>
        <ModalsProvider>
          <ToastProvider>
            <PageProvider>
              <GameProvider>
                <Scene darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
              </GameProvider>
            </PageProvider>
          </ToastProvider>
        </ModalsProvider>
      </GlobalStatesProvider>
    </ThemeProvider>
  );
}

export default App;
