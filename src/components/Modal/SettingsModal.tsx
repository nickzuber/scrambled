import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useContext, useMemo } from "react";
import { AppTheme } from "../../constants/themes";
import { GameContext } from "../../contexts/game";
import { GlobalStatesContext } from "../../contexts/global";
import { deleteEphemeralData } from "../../hooks/useLocalStorageGC";
import { Modal } from "./Modal";

type CrosswordleObj = {
  hash: string;
};

type LoadedWindowObj = Window &
  typeof globalThis & { crosswordle: CrosswordleObj | undefined };

function getAppHash() {
  const loadedWindow = window as LoadedWindowObj;
  return loadedWindow.crosswordle?.hash || "0000000";
}

/**
 * @deprecated
 * Eventually remove these modal components.
 */
export const SettingsModal: FC = () => {
  return (
    <Modal>
      <SettingsModalImpl darkTheme={false} setDarkTheme={() => {}} />
    </Modal>
  );
};

export interface SettingsModalImplProps {
  darkTheme: boolean;
  setDarkTheme: (state: boolean) => void;
  secret?: boolean;
}

export const SettingsModalImpl: FC<SettingsModalImplProps> = ({
  darkTheme,
  setDarkTheme,
  secret,
}) => {
  const theme = useTheme() as AppTheme;
  const {
    hardMode,
    setHardMode,
    scoreMode,
    setScoreMode,
    showTimer,
    setShowTimer,
    isGameOver,
  } = useContext(GlobalStatesContext);
  const { updateBoardWithNewScoreMode, clearBoard, hasStartedGame } =
    useContext(GameContext);
  const hash = useMemo(() => getAppHash(), []);

  return (
    <>
      <Setting style={{ marginTop: 24 }}>
        <Label>
          <Name>Dark theme</Name>
          <Description>Toggles the theme to appear dark</Description>
        </Label>
        <ToggleContainer>
          <Toggle
            onClick={() => setDarkTheme(!darkTheme)}
            enabled={darkTheme}
          />
        </ToggleContainer>
      </Setting>
      <Setting>
        <Label>
          <Name>Hard mode</Name>
          <Description>You cannot use any 2 letter words</Description>
        </Label>
        <ToggleContainer>
          <Toggle onClick={() => setHardMode(!hardMode)} enabled={hardMode} />
        </ToggleContainer>
      </Setting>
      <Setting>
        <Label>
          <Name>Show timer</Name>
          <Description>See your speed in stats</Description>
        </Label>
        <ToggleContainer>
          <Toggle
            onClick={() => setShowTimer(!showTimer)}
            enabled={showTimer}
          />
        </ToggleContainer>
      </Setting>
      <Setting>
        <Label>
          <Name>Show score</Name>
          <Description>Includes a score for each letter</Description>
        </Label>
        <ToggleContainer>
          <Toggle
            onClick={() => {
              const nextScoreMode = !scoreMode;
              setScoreMode(nextScoreMode);
              updateBoardWithNewScoreMode(nextScoreMode);
            }}
            enabled={scoreMode}
          />
        </ToggleContainer>
      </Setting>
      <Setting>
        <Button
          theme={theme}
          onClick={clearBoard}
          disabled={!hasStartedGame || isGameOver}
          presentAsDisabled={!hasStartedGame || isGameOver}
        >
          {"Clear all letters from puzzle"}
        </Button>
      </Setting>
      {secret ? (
        <Setting>
          <Label>
            <Name>Redo puzzle</Name>
            <Description>Start today's puzzle over again</Description>
          </Label>
          <ToggleContainer>
            <Toggle
              onClick={() => {
                deleteEphemeralData();
                window.location.reload();
              }}
              enabled={false}
            />
          </ToggleContainer>
        </Setting>
      ) : null}
      <TagContainer
        onClick={() => {
          window.open("https://github.com/nickzuber/scrambled", "_blank");
        }}
      >
        <Tag>© {new Date().getFullYear()} — Nick Zuber</Tag>
        <Tag>Build {`#${hash}`}</Tag>
      </TagContainer>
    </>
  );
};

const Button = styled.button<{ theme: AppTheme; presentAsDisabled?: boolean }>`
  animation-delay: 0ms;
  user-select: none;

  padding: 14px 32px;
  text-transform: none;
  white-space: nowrap;

  width: 100%;
  font-size: 1em;
  font-weight: 600;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 32px;
  cursor: pointer;

  color: ${(p) => p.theme.colors.invertedText};
  border: 1px solid ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.text};

  opacity: ${(p) => (p.presentAsDisabled ? 0.5 : 1)};
`;

export const Setting = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto 18px;
`;

const ToggleContainer = styled.div`
  font-weight: 500;
  font-size: 1rem;
  text-align: left;
  height: 100%;
  flex: 1;
`;

export const Label = styled.div`
  font-weight: 500;
  font-size: 1rem;
  text-align: left;
  height: 100%;
  flex: 3;
`;

export const Name = styled.p`
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 0.9rem;
  text-align: left;
  height: 100%;
  flex: 2;
`;

export const Description = styled.p`
  margin: 0;
  font-weight: 400;
  font-size: 0.9rem;
  text-align: left;
  opacity: 0.75;
  height: 100%;
`;

const Toggle = styled.div<{ enabled: boolean }>`
  position: relative;
  height: 24px;
  width: 44px;
  border-radius: 40px;
  margin-left: auto;
  margin-right: 0;
  cursor: pointer;
  background: ${(p) => (p.enabled ? "#6aaa64" : "#787c7e")};
  transition: all 150ms ease;

  &:after {
    content: "";
    border-radius: 100%;
    background: #ffffff;
    height: 18px;
    width: 18px;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: all 150ms ease;

    transform: translateX(${(p) => (p.enabled ? "20px" : "0px")});
  }
`;

const TagContainer = styled.div`
  margin: 36px auto 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 100ms ease-in;

  &:hover {
    opacity: 1;
  }
`;

const Tag = styled.span`
  font-weight: 500;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;
