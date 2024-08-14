import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FadeIn, PopIn } from "../constants/animations";
import { PersistedStates } from "../constants/state";
import { AppTheme } from "../constants/themes";
import { GameContext } from "../contexts/game";
import { ToastContext } from "../contexts/toast";
import createPersistedState from "../libs/use-persisted-state";
import { validateBoard } from "../utils/board-validator";
import { Directions, Letter } from "../utils/game";
import { BottomDrawer } from "./BottomDrawer";

const useHardMode = createPersistedState(PersistedStates.HardMode);

export const Controls: FC = () => {
  const theme = useTheme() as AppTheme;
  const {
    board,
    letters,
    boardLetterIds,
    setLetterOnBoard,
    shiftBoard,
    shuffleLetters,
    positionOfShuffle,
    moveCursorInDirection,
    requestFinish,
    backspaceBoard,
    canFinish,
    isGameOver,
    flipCursorDirection,
    unusedLetters,
  } = useContext(GameContext);
  const { sendToast } = useContext(ToastContext);
  const [hardMode] = useHardMode(false);

  const [isInShiftBoardMode, setIsInShiftBoardMode] = useState(false);

  const disableEnterButton = !canFinish || isGameOver;

  const allWordsAreValid = useMemo(() => {
    const [_, allWordsAreValid] = validateBoard(board);
    return allWordsAreValid;
  }, [board]);

  const onEnterPress = useCallback(() => {
    if (disableEnterButton) {
      if (hardMode) {
        const message =
          unusedLetters.length > 0
            ? "You have to place every letter on the board"
            : "All words must be connected like a crossword"; // Assumed based on this is the only scenario left
        sendToast(message);
      } else {
        const message =
          unusedLetters.length > 0
            ? "You have to place every letter on the board"
            : !allWordsAreValid
            ? "At least one of your words aren't valid"
            : "All words must be connected like a crossword"; // Assumed based on this is the only scenario left
        sendToast(message);
      }
    } else {
      requestFinish();
    }
  }, [
    hardMode,
    sendToast,
    allWordsAreValid,
    disableEnterButton,
    unusedLetters,
    requestFinish,
  ]);

  const onLetterButtonPress = useCallback(
    (letter: Letter) => {
      setLetterOnBoard(letter);
    },
    [setLetterOnBoard],
  );

  useEffect(() => {
    if (isGameOver) return;

    function listenForKeyboard(event: KeyboardEvent) {
      const key = event.key.toLowerCase();

      // Don't try to place letters if the user is trying to perform a keyboard shortcut
      // like Cmd + R to reload the page, etc.
      if (event.metaKey) {
        return;
      }

      switch (key) {
        case "enter":
          requestFinish();
          break;
        case "backspace":
          backspaceBoard();
          break;
        case " ":
          flipCursorDirection();
          break;
        case "arrowdown":
          moveCursorInDirection(Directions.Down);
          break;
        case "arrowup":
          moveCursorInDirection(Directions.Up);
          break;
        case "arrowleft":
          moveCursorInDirection(Directions.Left);
          break;
        case "arrowright":
          moveCursorInDirection(Directions.Right);
          break;
        default:
          const letterForKeypress = letters.find(
            (letter) => letter.letter.toLowerCase() === key && !boardLetterIds.has(letter.id),
          );
          if (letterForKeypress) {
            setLetterOnBoard(letterForKeypress);
          }
          break;
      }
    }

    document.addEventListener("keydown", listenForKeyboard);
    return () => document.removeEventListener("keydown", listenForKeyboard);
  }, [
    letters,
    boardLetterIds,
    backspaceBoard,
    setLetterOnBoard,
    flipCursorDirection,
    moveCursorInDirection,
    requestFinish,
    isGameOver,
  ]);

  const topLetters = letters.slice(0, 8);
  const middleLetters = letters.slice(8, 15);
  const bottomLetters = letters.slice(15, 20);

  return (
    <Container id="keyboard">
      <ButtonsContainer theme={theme}>
        <BoardButton theme={theme} disabled={isGameOver} onClick={shuffleLetters}>
          Shuffle
        </BoardButton>
        <BoardButton theme={theme} disabled={isGameOver} onClick={flipCursorDirection}>
          Pivot cursor
        </BoardButton>
        <BottomDrawer
          onOpenChange={setIsInShiftBoardMode}
          renderContents={() => (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                paddingBottom: 32,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <BoardButton
                  theme={theme}
                  disabled={isGameOver}
                  onClick={() => shiftBoard(Directions.Up)}
                >
                  Shift Up
                </BoardButton>
                <BoardButton
                  theme={theme}
                  disabled={isGameOver}
                  onClick={() => shiftBoard(Directions.Left)}
                >
                  Shift Left
                </BoardButton>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <BoardButton
                  theme={theme}
                  disabled={isGameOver}
                  onClick={() => shiftBoard(Directions.Down)}
                >
                  Shift Down
                </BoardButton>
                <BoardButton
                  theme={theme}
                  disabled={isGameOver}
                  onClick={() => shiftBoard(Directions.Right)}
                >
                  Shift Right
                </BoardButton>
              </div>
            </div>
          )}
        >
          <BoardButton theme={theme} disabled={isGameOver} style={{ width: 132 }}>
            Shift board
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              style={{
                marginRight: -10,
                transform: isInShiftBoardMode ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 500ms cubic-bezier(0.08, 0.535, 0.1, 1.025)",
              }}
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15.25 10.75L12 14.25L8.75 10.75"
              ></path>
            </svg>
          </BoardButton>
        </BottomDrawer>
      </ButtonsContainer>

      <LettersContainer theme={theme}>
        <LettersRow>
          {topLetters.map((letter) =>
            boardLetterIds.has(letter.id) ? (
              <DisabledLetterButton
                key={`${positionOfShuffle}-${letter.id}`}
                disabled={true}
                theme={theme}
              />
            ) : (
              <LetterButton
                key={`${positionOfShuffle}-${letter.id}`}
                disabled={isGameOver}
                onClick={() => onLetterButtonPress(letter)}
                theme={theme}
              >
                {letter.letter}
              </LetterButton>
            ),
          )}
        </LettersRow>

        <LettersRow>
          {middleLetters.map((letter) =>
            boardLetterIds.has(letter.id) ? (
              <DisabledLetterButton
                key={`${positionOfShuffle}-${letter.id}`}
                disabled={true}
                theme={theme}
              />
            ) : (
              <LetterButton
                key={`${positionOfShuffle}-${letter.id}`}
                disabled={isGameOver}
                onClick={() => onLetterButtonPress(letter)}
                theme={theme}
              >
                {letter.letter}
              </LetterButton>
            ),
          )}
        </LettersRow>

        <LettersRow>
          <ActionButton disabled={isGameOver} onClick={() => onEnterPress()} theme={theme}>
            {"Submit"}
          </ActionButton>
          {bottomLetters.map((letter) =>
            boardLetterIds.has(letter.id) ? (
              <DisabledLetterButton
                key={`${positionOfShuffle}-${letter.id}`}
                disabled={true}
                theme={theme}
              />
            ) : (
              <LetterButton
                key={`${positionOfShuffle}-${letter.id}`}
                disabled={isGameOver}
                onClick={() => onLetterButtonPress(letter)}
                theme={theme}
              >
                {letter.letter}
              </LetterButton>
            ),
          )}
          <ActionButton disabled={isGameOver} onClick={backspaceBoard} theme={theme}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path
                fill={theme.colors.text}
                d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"
              ></path>
            </svg>
          </ActionButton>
        </LettersRow>
      </LettersContainer>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  flex: 0 0 200px;
  margin: 0;
  padding-bottom: 18px;

  @media (max-height: 670px) {
    flex: 0 0 140px;
  }
`;

const ButtonsContainer = styled.div<{ theme: AppTheme }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${(p) => p.theme.colors.primary};
  width: 100%;
  min-height: 50px;
  max-width: 360px;
  padding: 0;

  margin-bottom: 12px;

  @media (max-height: 712px) {
    margin-bottom: 8px;
  }

  @media (max-height: 670px) {
    margin-bottom: 4px;
  }

  @media (max-height: 670px) {
    min-height: 40px;
  }
`;

const LettersContainer = styled.div<{ theme: AppTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  background: ${(p) => p.theme.colors.primary};
  width: 360px; // 6 tiles * tile size
  min-height: 50px;
`;

const LettersRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LetterButton = styled.button<{ theme: AppTheme }>`
  height: 56px;
  width: 38px;
  color: ${(p) => p.theme.colors.text};
  font-weight: 700;
  font-size: 14px;
  border: 0;
  padding: 0;
  margin: 3px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.theme.colors.letterBackground};
  user-select: none;
  text-transform: uppercase;
  transition: all 50ms ease-in, height: 200ms ease-in;
  animation: ${PopIn} 150ms;

  &:active:not([disabled]) {
    background: ${(p) => p.theme.colors.buttonActive};
    transform: translateY(2px);
  }

  @media (max-height: 670px) {
    height: 52px;
  }

  @media (max-height: 646px) {
    height: 48px;
  }

  @media (max-height: 630px) {
    height: 44px;
  }

  @media (max-width: 370px) {
    width: 34px;
  }
`;

const DisabledLetterButton = styled(LetterButton)`
  opacity: 0.5;
`;

const ActionButton = styled(LetterButton)`
  width: 64px;
  text-transform: none;
  transition: opacity 100ms ease-in;

  &:disabled {
    opacity: 0.5;
  }

  @media (max-width: 370px) {
    width: 60px;
  }
`;

const BoardButton = styled(LetterButton)`
  margin: 0;
  width: fit-content;
  padding: 8px 16px;
  text-transform: none;
  white-space: nowrap;

  font-size: 15px;
  font-weight: 600;
  display: flex;
  width: fit-content;
  text-align: center;
  justify-content: center;
  align-items: center;
  border-radius: 32px;
  cursor: pointer;
  border: 1px solid ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.primary};
  animation: ${FadeIn} 150ms;

  height: 44px;

  &:disabled {
    opacity: 0.5;
  }

  &:active:not([disabled]) {
    cursor: pointer;
    background: ${(p) => p.theme.colors.primary};
    transform: none;
    opacity: 0.5;
  }

  @media (max-height: 670px) {
    height: 38px;
  }

  @media (max-height: 646px) {
    height: 38px;
  }

  @media (max-height: 630px) {
    height: 36px;
  }

  @media (max-width: 370px) {
    width: fit-content;
    font-size: 14px;
    padding: 8px 12px;
    height: 42px;
  }
`;
