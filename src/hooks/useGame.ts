import { toBlob } from "html-to-image";
import React, { useCallback, useContext, useMemo } from "react";
import { ModalsContext } from "../contexts/modals";
import { ToastContext } from "../contexts/toast";

import { GlobalStatesContext } from "../contexts/global";
import { publishEvent } from "../utils/analytics";
import {
  countBoardScore,
  countSolutionBoardScore,
  createScoredBoard,
  createUnscoredBoard,
  getInvalidWords,
  getValidWords,
  validateBoard,
  validateWordIsland,
} from "../utils/board-validator";
import {
  Board,
  Config,
  Directions,
  Letter,
  getPuzzleNumber,
  isBoardScored,
} from "../utils/game";
import { ScoredSolutionBoard, SolutionBoard } from "../utils/words-helper";
import { useBoard } from "./useBoard";
import { useLetters } from "./useLetters";

export type GameOptions = {
  solutionBoard: SolutionBoard;
  isGameOver: boolean;
  board: Board;
  letters: Letter[];
  unusedLetters: Letter[];
  boardLetterIds: Set<string>;
  setLetterOnBoard: (letter: Letter) => void;
  shuffleLetters: () => void;
  positionOfShuffle: number;
  hasStartedGame: boolean;
  requestFinish: () => void;
  clearBoard: () => void;
  flipCursorDirection: () => void;
  canFinish: boolean;
  updateCursor: (row: number, col: number) => void;
  backspaceBoard: () => void;
  getShareClipboardItem: () => Promise<[ClipboardItem, File] | null>;
  getScoredShareClipboardItem: () => Promise<[ClipboardItem, File] | null>;
  shiftBoard: (direction: Directions) => void;
  moveCursorInDirection: (direction: Directions) => void;
  updateBoardWithNewScoreMode: (newScoreMode: boolean) => void;
};

export const useGame = (): GameOptions => {
  const { openStats } = useContext(ModalsContext);
  const { clearToast } = useContext(ToastContext);
  const { isGameOver, setIsGameOver, hardMode, scoreMode } = useContext(GlobalStatesContext);
  const { letters, solutionBoard, shuffleLetters, positionOfShuffle } = useLetters();
  const {
    board,
    setLetterOnBoard,
    resetBoard,
    setBoard,
    updateCursor,
    backspaceBoard,
    flipCursorDirection,
    shiftBoard,
    moveCursorInDirection,
  } = useBoard();

  const updateBoardWithNewScoreMode = useCallback(
    (newScoreMode: boolean) => {
      if (!isGameOver) return;

      if (!newScoreMode && isBoardScored(board)) {
        setBoard(createUnscoredBoard(board));
        return;
      }

      if (newScoreMode && !isBoardScored(board)) {
        setBoard(createScoredBoard(board));
        return;
      }
    },
    [isGameOver, board, setBoard],
  );

  const tilesAreConnected = React.useMemo(() => validateWordIsland(board), [board]);

  const boardLetterIds = React.useMemo(
    () =>
      new Set(
        board.tiles
          .map((row) => row.map((tile) => tile.letter))
          .flat()
          .filter((letter) => letter !== null)
          .map((letter) => (letter as Letter).id),
      ),
    [board],
  );

  const canFinish = useMemo(() => {
    const [_, allWordsAreValid] = validateBoard(board);
    const isBoardComplete = tilesAreConnected && boardLetterIds.size === Config.MaxLetters;

    // Hard mode lets you submit without every word guarenteed to be valid.
    if (hardMode) {
      return isBoardComplete;
    } else {
      return isBoardComplete && allWordsAreValid;
    }
  }, [hardMode, board, tilesAreConnected, boardLetterIds]);

  const requestFinish = useCallback(() => {
    if (!canFinish) return;
    clearToast();

    // Validate the board.
    const [newBoard] = validateBoard(board);

    // Score the board.
    const finalBoard = scoreMode ? createScoredBoard(newBoard) : newBoard;

    publishEvent("submit", {
      final_score: scoreMode ? countBoardScore(createScoredBoard(newBoard)) : -1,
      valid_words: getValidWords(finalBoard),
      invalid_words: getInvalidWords(finalBoard),
    });

    // Animate the tiles.
    setBoard(finalBoard);

    // End the game.
    setIsGameOver(true);

    // Show the stats modal.
    setTimeout(openStats, 2000);
  }, [board, canFinish, clearToast, scoreMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const unusedLetters = letters.filter((letter) => !boardLetterIds.has(letter.id));
  const hasStartedGame = unusedLetters.length !== Config.MaxLetters;

  const getShareClipboardItem = useCallback(async () => {
    const node = document.getElementById("canvas");

    if (!node) {
      return null;
    }

    const imgBlob = await toBlob(node);

    if (!imgBlob) {
      return null;
    }

    try {
      const clipboardItem = new ClipboardItem({
        "image/png": imgBlob as Blob,
      });
      const blobFile = new File([imgBlob], `Crosswordle-${getPuzzleNumber()}.png`, {
        type: "image/png",
      });
      return [clipboardItem, blobFile] as [ClipboardItem, File];
    } catch (error) {
      return null;
    }
  }, []);

  const getScoredShareClipboardItem = useCallback(async () => {
    const node = document.getElementById("canvas");
    const keyboardNode = document.getElementById("keyboard");
    const scoreNode = document.getElementById("score");
    if (!node || !keyboardNode || !scoreNode) {
      return null;
    }

    const prevScoreStyles = scoreNode.style.cssText;
    scoreNode.style.cssText = "display: flex";
    const prevKeyboardStyles = keyboardNode.style.cssText;
    keyboardNode.style.cssText = "display: none";

    const imgBlob = await toBlob(node);

    if (!imgBlob) {
      return null;
    }

    try {
      const clipboardItem = new ClipboardItem({
        "image/png": imgBlob as Blob,
      });
      const blobFile = new File([imgBlob], `Crosswordle-${getPuzzleNumber()}.png`, {
        type: "image/png",
      });

      keyboardNode.style.cssText = prevKeyboardStyles;
      scoreNode.style.cssText = prevScoreStyles;

      return [clipboardItem, blobFile] as [ClipboardItem, File];
    } catch (error) {
      keyboardNode.style.cssText = prevKeyboardStyles;
      scoreNode.style.cssText = prevScoreStyles;
      return null;
    }
  }, []);

  return {
    solutionBoard,
    board,
    letters,
    unusedLetters,
    boardLetterIds,
    setLetterOnBoard,
    shuffleLetters,
    positionOfShuffle,
    hasStartedGame,
    requestFinish,
    clearBoard: resetBoard,
    canFinish,
    updateCursor,
    flipCursorDirection,
    backspaceBoard,
    shiftBoard,
    moveCursorInDirection,
    isGameOver: isGameOver as boolean,
    getShareClipboardItem,
    getScoredShareClipboardItem,
    updateBoardWithNewScoreMode,
  };
};

function printEmojiScoredSolutionBoard(board: ScoredSolutionBoard) {
  const parts = [""];
  const styles = [];
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r < 6; r++) {
      const tile = board[c][r];
      const letter = tile.letter?.toLocaleLowerCase();
      switch (tile.score) {
        case 1:
          parts.push(`%c${letter}`);
          styles.push("color: #da77f2");
          break;
        case 2:
          parts.push(`%c${letter}`);
          styles.push("color: #ffd43b");
          break;
        case 3:
          parts.push(`%c${letter}`);
          styles.push("color: #40c057");
          break;
        case 4:
          parts.push(`%c${letter}`);
          styles.push("color: #fa5252");
          break;
        default:
          parts.push("%c" + (letter ?? " "));
          styles.push("color: #495057");
      }
      parts.push(" ");
    }
    parts.push("\n");
  }

  console.info(parts.join(""), ...styles);

  const score = countSolutionBoardScore(board);
  console.info(
    `Score: %c${score}`,
    `color: ${score > 30 ? "green" : score > 24 ? "blue" : "#aaa"}`,
  );
  console.info(
    `%c1, %c2, %c3, %c4`,
    "color: #da77f2",
    "color: #ffd43b",
    "color: #40c057",
    "color: #fa5252",
  );
}
