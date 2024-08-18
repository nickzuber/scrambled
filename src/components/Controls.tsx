import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { FadeIn, PopIn } from "../constants/animations";
import { AppTheme } from "../constants/themes";
import { GameContext } from "../contexts/game";
import { GlobalStatesContext } from "../contexts/global";
import { ToastContext } from "../contexts/toast";
import { validateBoard } from "../utils/board-validator";
import { Directions, Letter } from "../utils/game";
import { BottomDrawer } from "./BottomDrawer";

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
    setBoard,
  } = useContext(GameContext);
  const { sendToast } = useContext(ToastContext);
  const { hardMode, setSubmitCount } = useContext(GlobalStatesContext);

  const [isInShiftBoardMode, setIsInShiftBoardMode] = useState(false);

  const disableEnterButton = !canFinish || isGameOver;

  const onEnterPress = useCallback(() => {
    const [checkedBoard, allWordsAreValid] = validateBoard({ board, mode: "validate" });
    setSubmitCount((curCount) => curCount + 1);

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

        // If every letter is used and there are some invalid words, call those out.
        // Intentionally allow for a shake-check even if all the letters aren't placed.
        if (!allWordsAreValid) {
          setBoard(checkedBoard);
        }
      }
    } else {
      if (hardMode) {
        const shouldContinue = window.confirm(
          "You're playing on hard mode, so you only get one chance to submit! Are you sure you're done?",
        );
        if (shouldContinue) {
          requestFinish();
        }
      } else {
        requestFinish();
      }
    }
  }, [
    hardMode,
    sendToast,
    disableEnterButton,
    unusedLetters,
    requestFinish,
    board,
    setBoard,
    setSubmitCount,
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
          onEnterPress();
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
    onEnterPress,
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
          title={"Move letters around"}
          renderContents={() => <BoardShiftDrawerImpl />}
        >
          <BoardButton theme={theme} disabled={isGameOver} style={{ width: 132 }}>
            Move letters
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

function BoardShiftDrawerImpl() {
  const theme = useTheme() as AppTheme;
  const { shiftBoard } = useContext(GameContext);

  return (
    <>
      <Paragraph>
        Make way for more words by shifting every letter on the board at once in the same
        direction.
      </Paragraph>

      <ShiftContainer>
        <div style={{ flex: 1 }}>
          <ShiftButton theme={theme} onClick={() => shiftBoard(Directions.Left)}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.05005 13.5C2.05005 13.7485 2.25152 13.95 2.50005 13.95C2.74858 13.95 2.95005 13.7485 2.95005 13.5L2.95005 1.49995C2.95005 1.25142 2.74858 1.04995 2.50005 1.04995C2.25152 1.04995 2.05005 1.25142 2.05005 1.49995L2.05005 13.5ZM8.4317 11.0681C8.60743 11.2439 8.89236 11.2439 9.06809 11.0681C9.24383 10.8924 9.24383 10.6075 9.06809 10.4317L6.58629 7.94993L14.5 7.94993C14.7485 7.94993 14.95 7.74846 14.95 7.49993C14.95 7.2514 14.7485 7.04993 14.5 7.04993L6.58629 7.04993L9.06809 4.56813C9.24383 4.39239 9.24383 4.10746 9.06809 3.93173C8.89236 3.75599 8.60743 3.75599 8.4317 3.93173L5.1817 7.18173C5.00596 7.35746 5.00596 7.64239 5.1817 7.81812L8.4317 11.0681Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
            Left
          </ShiftButton>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          <ShiftButton theme={theme} onClick={() => shiftBoard(Directions.Up)}>
            Up
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.50005 1.05005C1.25152 1.05005 1.05005 1.25152 1.05005 1.50005C1.05005 1.74858 1.25152 1.95005 1.50005 1.95005L13.5 1.95005C13.7486 1.95005 13.95 1.74858 13.95 1.50005C13.95 1.25152 13.7486 1.05005 13.5 1.05005H1.50005ZM3.93188 7.43169C3.75614 7.60743 3.75614 7.89236 3.93188 8.06809C4.10761 8.24383 4.39254 8.24383 4.56827 8.06809L7.05007 5.58629V13.5C7.05007 13.7485 7.25155 13.95 7.50007 13.95C7.7486 13.95 7.95007 13.7485 7.95007 13.5L7.95007 5.58629L10.4319 8.06809C10.6076 8.24383 10.8925 8.24383 11.0683 8.06809C11.244 7.89235 11.244 7.60743 11.0683 7.43169L7.81827 4.18169C7.64254 4.00596 7.35761 4.00596 7.18188 4.18169L3.93188 7.43169Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </ShiftButton>
          <ShiftButton theme={theme} onClick={() => shiftBoard(Directions.Down)}>
            Down
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 13.95C13.7485 13.95 13.95 13.7485 13.95 13.5C13.95 13.2514 13.7485 13.05 13.5 13.05L1.49995 13.05C1.25142 13.05 1.04995 13.2514 1.04995 13.5C1.04995 13.7485 1.25142 13.95 1.49995 13.95L13.5 13.95ZM11.0681 7.5683C11.2439 7.39257 11.2439 7.10764 11.0681 6.93191C10.8924 6.75617 10.6075 6.75617 10.4317 6.93191L7.94993 9.41371L7.94993 1.49998C7.94993 1.25146 7.74846 1.04998 7.49993 1.04998C7.2514 1.04998 7.04993 1.25146 7.04993 1.49998L7.04993 9.41371L4.56813 6.93191C4.39239 6.75617 4.10746 6.75617 3.93173 6.93191C3.75599 7.10764 3.75599 7.39257 3.93173 7.5683L7.18173 10.8183C7.35746 10.994 7.64239 10.994 7.81812 10.8183L11.0681 7.5683Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </ShiftButton>
        </div>
        <div style={{ flex: 1 }}>
          <ShiftButton theme={theme} onClick={() => shiftBoard(Directions.Right)}>
            Right
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.95 1.50005C12.95 1.25152 12.7485 1.05005 12.5 1.05005C12.2514 1.05005 12.05 1.25152 12.05 1.50005L12.05 13.5C12.05 13.7486 12.2514 13.95 12.5 13.95C12.7485 13.95 12.95 13.7486 12.95 13.5L12.95 1.50005ZM6.5683 3.93188C6.39257 3.75614 6.10764 3.75614 5.93191 3.93188C5.75617 4.10761 5.75617 4.39254 5.93191 4.56827L8.41371 7.05007L0.499984 7.05007C0.251456 7.05007 0.0499847 7.25155 0.0499847 7.50007C0.0499846 7.7486 0.251457 7.95007 0.499984 7.95007L8.41371 7.95007L5.93191 10.4319C5.75617 10.6076 5.75617 10.8925 5.93191 11.0683C6.10764 11.244 6.39257 11.244 6.56831 11.0683L9.8183 7.81827C9.99404 7.64254 9.99404 7.35761 9.8183 7.18188L6.5683 3.93188Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </ShiftButton>
        </div>
      </ShiftContainer>

      {/* <Setting style={{ marginTop: 24 }}>
        <Label>
          <Name>Shift up</Name>
          <Description>Moves all letters on the board upwards</Description>
        </Label>
        <ToggleContainer>
          <Toggle onClick={() => shiftBoard(Directions.Up)} enabled={false} />
        </ToggleContainer>
      </Setting>
      <Setting>
        <Label>
          <Name>Shift left</Name>
          <Description>Moves all letters on the board leftwards</Description>
        </Label>
        <ToggleContainer>
          <Toggle onClick={() => shiftBoard(Directions.Left)} enabled={false} />
        </ToggleContainer>
      </Setting> */}
    </>
  );
}

const Paragraph = styled.p`
  margin: 0;
  margin-bottom: 12px;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  text-align: left;
`;

const Setting = styled.div`
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

const Label = styled.div`
  font-weight: 500;
  font-size: 1rem;
  text-align: left;
  height: 100%;
  flex: 3;
`;

const Name = styled.p`
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 0.9rem;
  text-align: left;
  height: 100%;
  flex: 2;
`;

const Description = styled.p`
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

const ShiftContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  margin-top: 18px;
  margin-bottom: 24px;
`;

const ShiftButton = styled(BoardButton)`
  text-align: center;
  width: 100%;
  line-height: 0.9em;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;
