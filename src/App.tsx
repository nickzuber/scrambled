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
import { TimerStateProvider } from "./contexts/timer";
import { ToastProvider } from "./contexts/toast";
import "./layout.css";
import createPersistedState from "./libs/use-persisted-state";
import { Scene } from "./Scene";
import { Origin } from "./constants/app";

const useDarkTheme = createPersistedState<boolean>(PersistedStates.DarkTheme);

function App() {
  const [darkTheme, setDarkTheme] = useDarkTheme(false);

  const theme = useMemo(
    () => (darkTheme ? Themes.Dark : Themes.Light),
    [darkTheme]
  );

  const userOrigin = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get("from") ?? "";
    switch (origin) {
      case "crosswordle":
        return Origin.Crosswordle;
      default:
        return Origin.None;
    }
  }, []);

  useEffect(() => {
    document.body.style.background = theme.colors.primary;
    document.body.style.color = theme.colors.text;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <Analytics />
      <GlobalStatesProvider>
        <TimerStateProvider>
          <ModalsProvider>
            <ToastProvider>
              <PageProvider>
                <GameProvider>
                  <Scene
                    darkTheme={darkTheme}
                    setDarkTheme={setDarkTheme}
                    userOrigin={userOrigin}
                  />
                </GameProvider>
              </PageProvider>
            </ToastProvider>
          </ModalsProvider>
        </TimerStateProvider>
      </GlobalStatesProvider>
    </ThemeProvider>
  );
}

export default App;
