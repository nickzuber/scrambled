import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useContext, useEffect } from "react";
import { Canvas } from "./components";
import { Controls } from "./components/Controls";
import { Header } from "./components/Header";
import { Intro } from "./components/Intro";
import { Modal } from "./components/Modal";
import { AppTheme } from "./constants/themes";
import { GameContext } from "./contexts/game";
import { GlobalStatesContext } from "./contexts/global";
import { ModalsContext } from "./contexts/modals";
import { PageContext } from "./contexts/page";
import { useLocalStorageGC } from "./hooks/useLocalStorageGC";
import { Page } from "./hooks/usePage";

export interface SceneProps {
  darkTheme: boolean;
  setDarkTheme: (state: boolean) => void;
}

export const Scene: FC<SceneProps> = ({ darkTheme, setDarkTheme }) => {
  const theme = useTheme() as AppTheme;
  const { openInstructions, openStats, isStatsOpen } = useContext(ModalsContext);
  const { page } = useContext(PageContext);
  const { board, isGameOver } = useContext(GameContext);
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
            <Modal />
          </Container>
        );
    }
  }

  return <>{renderScene()}</>;
};

const Container = styled.div`
  max-width: 600px;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;

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
