import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import createPersistedState from "use-persisted-state";
import { Canvas } from "./components";
import { Controls } from "./components/Controls";
import { Header } from "./components/Header";
import { Intro } from "./components/Intro";
import { Modal } from "./components/Modal";
import { PersistedStates } from "./constants/state";
import { AppTheme } from "./constants/themes";
import { GameContext } from "./contexts/game";
import { ModalsContext } from "./contexts/modals";
import { PageContext } from "./contexts/page";
import { useLocalStorageGC } from "./hooks/useLocalStorageGC";
import { Page } from "./hooks/usePage";
import { countValidLettersOnBoard } from "./utils/board-validator";

const useFirstTime = createPersistedState(PersistedStates.FirstTime);
const useScoreMode = createPersistedState(PersistedStates.ScoreMode);

export const Scene: FC = () => {
  const theme = useTheme() as AppTheme;
  const { openInstructions, openStats, isStatsOpen } = useContext(ModalsContext);
  const { page } = useContext(PageContext);
  const { board, isGameOver } = useContext(GameContext);
  const [isFirstTime] = useFirstTime(true);

  const score = useMemo(() => countValidLettersOnBoard(board), [board]);

  // Faux loading state, helps with font and vibes.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const ts = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(ts);
  }, []);

  // Clean up old keys.
  useLocalStorageGC();

  // Open modal(s) for first-time player and for completed game.
  useEffect(() => {
    let ts: ReturnType<typeof setTimeout>;

    if (isGameOver) {
      // + 1000ms for all animations to kick off.
      // + 500ms for the last animation to finish.
      // + 500 for some buffer room to soak in the tile flipping animation.
      ts = setTimeout(openStats, 2000);
    } else if (isFirstTime) {
      // + 100 for some buffer room.
      ts = setTimeout(openInstructions, 100);
    }

    return () => {
      if (ts) {
        clearTimeout(ts);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ===========================================================================
  // Disable for now, might want to kill confetti altogether.
  // ===========================================================================
  // Showing confetti on load.
  // useEffect(() => {
  //   if (!alreadyShowedConfetti.current && isStatsOpen && isGameOver && score === 20) {
  //     alreadyShowedConfetti.current = true;
  //     setShowConfetti(true);
  //   }
  // }, [isGameOver, isStatsOpen, score]);

  function renderScene() {
    switch (page) {
      case Page.Intro:
        return <Intro loading={loading} />;
      case Page.Game:
      default:
        return (
          <Container className="fadeIn">
            <Header />
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
  const [scoreMode, setScoreMode] = useScoreMode(false);

  useEffect(() => {
    if (scoreMode) {
      setScoreMode(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
