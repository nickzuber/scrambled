import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppTheme } from "../constants/themes";
import { GlobalStatesContext } from "../contexts/global";
import { PageContext } from "../contexts/page";
import { TimerStateContext } from "../contexts/timer";
import { Page } from "../hooks/usePage";
import { formatAsTimer } from "../utils/game";
import { BottomDrawer } from "./BottomDrawer";
import { InstructionsModalImpl } from "./Modal/InstructionsModal";
import { SettingsModalImpl } from "./Modal/SettingsModal";
import { StatsModalImpl } from "./Modal/StatsModal";

export interface HeaderProps {
  isFirstTime: boolean;
  setIsFirstTime: (nextState: boolean) => void;
  isGameOver: boolean;
  darkTheme: boolean;
  setDarkTheme: (nextState: boolean) => void;
}

export const Header: FC<HeaderProps> = ({
  isFirstTime,
  setIsFirstTime,
  isGameOver,
  darkTheme,
  setDarkTheme,
}) => {
  const theme = useTheme() as AppTheme;
  const [showStats, setShowStats] = useState<boolean>(false);
  const { setPage } = useContext(PageContext);
  const { showTimer } = useContext(GlobalStatesContext);

  const [secret, setSecret] = useState(false);
  const tapsRef = useRef(0);
  const tapsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const updaterRef = useRef(false);

  const handleSecretTaps = useCallback(() => {
    tapsRef.current += 1;
    if (tapsTimeoutRef.current) {
      clearTimeout(tapsTimeoutRef.current);
    }

    if (tapsRef.current >= 10) {
      setSecret(true);
    }

    tapsTimeoutRef.current = setTimeout(() => {
      tapsRef.current = 0;
    }, 500);
  }, []);

  useEffect(() => {
    if (isGameOver && !updaterRef.current) {
      // + 1000ms for all animations to kick off.
      // + 500ms for the last animation to finish.
      // + 250 for some buffer room to soak in the tile flipping animation.
      setTimeout(() => setShowStats(true), 1750);

      // Only do this once per lifecycle.
      updaterRef.current = true;
    }
  }, [isGameOver]);

  return (
    <Container theme={theme}>
      <ButtonContainer style={{ marginLeft: 8 }}>
        {/* Back */}
        <BackButton theme={theme} onClick={() => setPage(Page.Intro)}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: "scale(2.25)" }}
          >
            <path
              d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </BackButton>
      </ButtonContainer>

      <ButtonContainer>
        {/* Timer */}
        {showTimer ? <RunningTimer /> : null}
        {/* Help */}
        <BottomDrawer
          pessimisticallyAssumeOverflow
          open={isFirstTime === true ? true : undefined}
          title={"How to play"}
          renderContents={() => <InstructionsModalImpl />}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsFirstTime(false);
            }
          }}
        >
          <Button theme={theme}>Help</Button>
        </BottomDrawer>
        {/* Stats */}
        <BottomDrawer
          open={showStats === true ? true : undefined}
          title={"Statistics"}
          renderContents={() => <StatsModalImpl />}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setShowStats(false);
            }
          }}
        >
          <Button theme={theme}>Stats</Button>
        </BottomDrawer>
        {/* Settings */}
        <BottomDrawer
          title={<span onTouchStart={handleSecretTaps}>Settings</span>}
          renderContents={() => (
            <SettingsModalImpl
              darkTheme={darkTheme}
              setDarkTheme={setDarkTheme}
              secret={secret}
            />
          )}
        >
          <Button theme={theme}>Settings</Button>
        </BottomDrawer>
      </ButtonContainer>
    </Container>
  );
};

function RunningTimer() {
  const theme = useTheme() as AppTheme;
  const { timer } = useContext(TimerStateContext);

  return (
    <TimerContainer theme={theme}>
      <PauseSvg style={{ marginTop: 0 }} />
      {formatAsTimer(timer)}
    </TimerContainer>
  );
}

const TimerContainer = styled.div<{ theme: AppTheme }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  font-size: 1.125em;
  margin-top: -1px;

  border: 0;
  background: none;
  width: fit-content;
  padding: 6px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme.colors.text};
  cursor: default;
  transition: all 50ms ease-in;

  padding-top: 10px;
  gap: 4px;
`;

const PauseSvg = (props: { style?: React.CSSProperties }) => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 22 25"
      fill={theme.colors.text}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={props.style}
    >
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </svg>
  );
};

const Container = styled.div<{ theme: AppTheme }>`
  position: relative;
  border-bottom: 1px solid ${(p) => p.theme.colors.tileSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 50px;
  z-index: 2;
  padding-inline: 12px;
`;

const ButtonContainer = styled.div`
  height: 100%;
  width: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button<{ theme: AppTheme }>`
  border: 0;
  background: none;
  width: fit-content;
  padding: 6px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme.colors.text};
  cursor: pointer;
  transition: all 50ms ease-in;

  font-size: 1.125em;
  line-height: 45px;
  display: inline-block;
  padding: 6px 13px 4px;

  &:active {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const BackButton = styled(Button)`
  transform: scale(0.95);

  &:active {
    cursor: pointer;
    opacity: 0.5;
    background-color: transparent;
  }
`;

const Title = styled.h1<{ theme: AppTheme }>`
  margin: 0;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  text-align: center;
  color: ${(p) => p.theme.colors.text} @media (max-width: 430px) {
    font-size: 24px;
  }

  @media (max-width: 380px) {
    font-size: 20px;
  }
`;
