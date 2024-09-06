import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useContext, useEffect, useRef } from "react";
import { Canvas } from "./components";
import { Controls } from "./components/Controls";
import { Header } from "./components/Header";
import { Intro } from "./components/Intro";
import { AppTheme } from "./constants/themes";
import { GameContext } from "./contexts/game";
import { GlobalStatesContext } from "./contexts/global";
import { PageContext } from "./contexts/page";
import { TimerStateContext } from "./contexts/timer";
import { useLocalStorageGC } from "./hooks/useLocalStorageGC";
import { Page } from "./hooks/usePage";
import { useSyncTimerToSession } from "./hooks/useSyncTimerToSession";
import { Origin } from "./constants/app";
import { ToastContext } from "./contexts/toast";

export interface SceneProps {
  darkTheme: boolean;
  setDarkTheme: (state: boolean) => void;
  userOrigin: Origin;
}

export const Scene: FC<SceneProps> = ({
  darkTheme,
  setDarkTheme,
  userOrigin,
}) => {
  const theme = useTheme() as AppTheme;
  const { sendToast } = useContext(ToastContext);
  const { page, setPage } = useContext(PageContext);
  const { isGameOver } = useContext(GameContext);
  const { isFirstTime, setIsFirstTime } = useContext(GlobalStatesContext);

  // Clean up old keys.
  useLocalStorageGC();

  // Change the app theme based on which screen is rendered.
  useEffect(() => {
    const elem = document.querySelector("meta[name='theme-color']");
    if (!elem) return;

    if (page === Page.Intro) {
      elem.setAttribute("content", theme.colors.app);
    } else {
      elem.setAttribute("content", theme.colors.primary);
    }
  }, [page, theme]);

  // Greeting toast for Crosswordle users.
  useEffect(() => {
    if (userOrigin === Origin.Crosswordle) {
      setPage(Page.Game);
      if (isFirstTime) {
        const greeting = `Welcome from Crosswordle 👋`;
        setTimeout(() => sendToast(greeting), 500);
      }
    }
  }, [userOrigin]);

  function renderScene() {
    switch (page) {
      case Page.Intro:
        return <Intro />;
      case Page.Game:
      default:
        return (
          <Container className="fadeIn">
            <Header
              isFirstTime={isFirstTime}
              setIsFirstTime={setIsFirstTime}
              isGameOver={isGameOver}
              darkTheme={darkTheme}
              setDarkTheme={setDarkTheme}
            />
            <Canvas />
            <Controls />
            <Timer />
          </Container>
        );
    }
  }

  return <>{renderScene()}</>;
};

/**
 * This is its own component so that the syncer doesn't disrupt the rest of the
 * components' lifecycles that don't really want to subscribe to timer updates.
 */
function Timer() {
  const { isGameOver } = useContext(GameContext);
  const { timer, setTimer } = useContext(TimerStateContext);
  const { setFastedCompletion } = useContext(GlobalStatesContext);
  const alreadySetRef = useRef(false);

  useSyncTimerToSession();

  useEffect(() => {
    if (isGameOver && !alreadySetRef.current) {
      setFastedCompletion((prevFastest) => {
        if (!prevFastest) {
          return timer;
        } else {
          return Math.min(prevFastest, timer);
        }
      });
    }
  }, [isGameOver, timer, setFastedCompletion, setTimer]);

  return null;
}

const Container = styled.div`
  max-width: 600px;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;

  @media (min-height: 615px) {
    overflow-y: hidden;
  }

  canvas {
    z-index: 9999 !important;
  }
`;

function useResetScoreMode() {
  const { scoreMode, setScoreMode } = useContext(GlobalStatesContext);

  useEffect(() => {
    if (scoreMode) {
      setScoreMode(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
