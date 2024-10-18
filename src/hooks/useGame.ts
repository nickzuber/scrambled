import { toBlob } from "html-to-image";
import generator from "random-seed";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { ToastContext } from "../contexts/toast";

import { GlobalStatesContext } from "../contexts/global";
import { publishEvent } from "../utils/analytics";
import {
  countBoardScore,
  countSolutionBoardScore,
  countValidWordsOnBoard,
  createScoredBoard,
  createUnscoredBoard,
  getInvalidWords,
  getValidWords,
  validateBoard,
  validateWordIsland,
} from "../utils/board-validator";
import { Config, Letter, getPuzzleNumber, isBoardScored } from "../utils/game";
import { ScoredSolutionBoard } from "../utils/words-helper";
import { useBoard } from "./useBoard";
import { useLetters } from "./useLetters";

export type GameOptions = ReturnType<typeof useGame>;

export const useGame = () => {
  const { clearToast } = useContext(ToastContext);
  const {
    isGameOver,
    setIsGameOver,
    hardMode,
    scoreMode,
    setStreakCount,
    setMostWordsInAPuzzle,
    setTotalWordCount,
    setTotalPointCount,
    setTotalCompletionCount,
    setLastCompletedPuzzleNumber,
    setHighestScore,
    setHighestStreak,
    lastCompletedPuzzleNumber,
  } = useContext(GlobalStatesContext);
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
    setLockedLettersOnBoard,
    unlockAllTilesOnBoard,
    lockedTilesCount,
  } = useBoard();
  const { letters, solutionBoard, shuffleLetters, positionOfShuffle } =
    useLetters();

  // Hard-mode listener: sets and locks some letters onto the board.
  useEffect(() => {
    // If hard mode is disabled, just make sure every tile on the board is unlocked.
    if (!hardMode) {
      unlockAllTilesOnBoard();
      return;
    }
    // We've already locked the max tiles, so no-op.
    else if (lockedTilesCount >= 2) {
      return;
    }
    // Otherwise, go set and lock some random tiles on the board.

    const denseBoardWithPositions: Array<{
      letter: string;
      position: { row: number; col: number };
    }> = [];

    for (let r = 0; r < solutionBoard.length; r++) {
      for (let c = 0; c < solutionBoard[0].length; c++) {
        const tile: string | undefined = solutionBoard[r][c];
        if (tile) {
          denseBoardWithPositions.push({
            letter: tile,
            position: { row: r, col: c },
          });
        }
      }
    }

    // Step 1.
    // =======
    // Randomly choose two letters from two positions from the dense board.
    const date = new Date();
    const seed = `${date.getMonth()}${date.getDate()}${date.getFullYear()}`;
    const randomGenerator = generator.create(seed);
    const firstIndex = randomGenerator.range(denseBoardWithPositions.length);
    const firstChosenTile = denseBoardWithPositions[firstIndex];
    // Remove the first chosen letter from the board altogether.
    denseBoardWithPositions.splice(firstIndex, 1);
    const secondIndex = randomGenerator.range(denseBoardWithPositions.length);
    const secondChosenTile = denseBoardWithPositions[secondIndex];

    // Step 2.
    // =======
    // Select separate Letter objects from the letters array.
    const firstChosenLetter = letters.find(
      (letter) => letter.letter === firstChosenTile.letter
    );
    const secondChosenLetter = letters.find(
      (letter) =>
        letter.letter === secondChosenTile.letter &&
        letter.id !== firstChosenLetter?.id
    );

    if (!firstChosenLetter || !secondChosenLetter) return;

    // Step 3.
    // =======
    // Place the letters on the board.
    setLockedLettersOnBoard([
      {
        letter: firstChosenLetter,
        ...firstChosenTile.position,
      },
      {
        letter: secondChosenLetter,
        ...secondChosenTile.position,
      },
    ]);
  }, [hardMode]);

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
    [isGameOver, board, setBoard]
  );

  const tilesAreConnected = React.useMemo(
    () => validateWordIsland(board),
    [board]
  );

  const boardLetterIds = React.useMemo(
    () =>
      new Set(
        board.tiles
          .map((row) => row.map((tile) => tile.letter))
          .flat()
          .filter((letter) => letter !== null)
          .map((letter) => (letter as Letter).id)
      ),
    [board]
  );

  const canFinish = useMemo(() => {
    const [_, allWordsAreValid] = validateBoard({ board, mode: "submit" });
    const isBoardComplete =
      tilesAreConnected && boardLetterIds.size === Config.MaxLetters;

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
    const [newBoard] = validateBoard({ board, mode: "submit" });

    // Score the board's tiles if needed.
    const finalBoard = scoreMode ? createScoredBoard(newBoard) : newBoard;

    // Count the score on the board.
    const finalScore = countBoardScore(createScoredBoard(newBoard));

    publishEvent("submit", {
      final_score: scoreMode ? finalScore : -1,
      valid_words: getValidWords(finalBoard),
      invalid_words: getInvalidWords(finalBoard),
    });

    // Animate the tiles.
    setBoard(finalBoard);

    // End the game.
    setIsGameOver(true);

    // Update stats.
    const wordCount = countValidWordsOnBoard(board);
    setMostWordsInAPuzzle((prev) => Math.max(wordCount, prev));
    setTotalWordCount((prevCount) => prevCount + wordCount);
    setTotalPointCount((prevCount) => prevCount + finalScore);
    setTotalCompletionCount((prevCount) => prevCount + 1);
    setStreakCount((prevStreak) => {
      if (!lastCompletedPuzzleNumber) {
        // First completion.
        // Initial highest streak setting as well.
        setHighestStreak((prevHighestStreak) => Math.max(prevHighestStreak, 1));
        return 1;
      } else if (getPuzzleNumber() - lastCompletedPuzzleNumber <= 1) {
        // If the current puzzle is 1 away from the last completed puzzle, then
        // they just completed the next one so streak continues.
        //
        // E.g. 265 - 264 = 1
        //
        // Note that this supports the same puzzle being completed twice as a streak;
        // this is for testing since its not normally possible.
        const nextStreakCount = prevStreak + 1;
        setHighestStreak((prevHighestStreak) =>
          Math.max(prevHighestStreak, nextStreakCount)
        );
        return nextStreakCount;
      } else {
        // If this wasn't the next puzzle, reset the streak.
        // Highest streak should never need to be set here.
        return 1;
      }
    });
    setHighestScore((prevHighestScore) =>
      Math.max(prevHighestScore, finalScore)
    );
    setLastCompletedPuzzleNumber(getPuzzleNumber());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    board,
    canFinish,
    clearToast,
    scoreMode,
    setStreakCount,
    setTotalWordCount,
    setTotalPointCount,
    setTotalCompletionCount,
    setLastCompletedPuzzleNumber,
    lastCompletedPuzzleNumber,
  ]);

  const unusedLetters = letters.filter(
    (letter) => !boardLetterIds.has(letter.id)
  );
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
      const blobFile = new File(
        [imgBlob],
        `Scrambled #${getPuzzleNumber()}.png`,
        {
          type: "image/png",
        }
      );
      return [clipboardItem, blobFile] as [ClipboardItem, File];
    } catch (error) {
      console.error(error);
      const blobFile = new File(
        [imgBlob],
        `Scrambled #${getPuzzleNumber()}.png`,
        {
          type: "image/png",
        }
      );
      return [null, blobFile] as [null, File];
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
      const blobFile = new File(
        [imgBlob],
        `Scrambled #${getPuzzleNumber()}.png`,
        {
          type: "image/png",
        }
      );

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
    setBoard,
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
    `color: ${score > 30 ? "green" : score > 24 ? "blue" : "#aaa"}`
  );
  console.info(
    `%c1, %c2, %c3, %c4`,
    "color: #da77f2",
    "color: #ffd43b",
    "color: #40c057",
    "color: #fa5252"
  );
}
