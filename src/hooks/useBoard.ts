import { useCallback, useContext, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { PersistedStates } from "../constants/state";
import createPersistedState from "../libs/use-persisted-state";
import { resetBoardTileState } from "../utils/board-validator";
import {
  Board,
  Config,
  CursorDirections,
  decrementCursor,
  Directions,
  getTileAtCursor,
  incrementCursor,
  Letter,
  moveBoard,
  TileChangeReason,
  TileState,
  updateCursorInDirection,
} from "../utils/game";
import { ToastContext } from "../contexts/toast";
import { GlobalStatesContext } from "../contexts/global";

const LOCKED_TILE_MESSAGE = "You cannot edit a locked tile in hard mode";

const usePersistedBoard = createPersistedState<Board>(PersistedStates.Board);
const defaultBoard = initalizeBoard();

export const useBoard = () => {
  const { sendToast } = useContext(ToastContext);
  const { hardMode } = useContext(GlobalStatesContext);
  const [board, setBoard] = usePersistedBoard(defaultBoard);

  const messageRef = useRef(false);

  const shiftBoard = useCallback(
    (direction: Directions) => {
      if (hardMode) {
        if (!messageRef.current) {
          sendToast("You cannot move letters in hard mode");

          // Prevent spamming the toast while its active, roughly 2s feels good.
          messageRef.current = true;
          setTimeout(() => {
            messageRef.current = false;
          }, 2000);
        }
      } else {
        setBoard(moveBoard(board, direction));
      }
    },
    [board, hardMode] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const moveCursorInDirection = useCallback(
    (direction: Directions) => {
      setBoard(updateCursorInDirection(board, direction));
    },
    [board] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const setLetterOnBoard = useCallback(
    (letter: Letter) => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement?.blur();
      }

      const { row, col } = board.cursor;
      const newCursor = incrementCursor(board);
      const newTiles = resetBoardTileState(board).tiles;

      // If the tile that we're going to delete is locked, we can't delete it.
      if (!newTiles[row][col].isLocked) {
        // Set new tile.
        newTiles[row][col].letter = letter;
        newTiles[row][col].state = TileState.IDLE;
        newTiles[row][col].changeReason = TileChangeReason.LETTER;
      } else {
        sendToast(LOCKED_TILE_MESSAGE);
      }

      setBoard({ cursor: newCursor, tiles: newTiles });
    },
    [board] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const backspaceBoard = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement?.blur();
    }

    const { row, col } = board.cursor;
    const currentTileHasLetter = getTileAtCursor(board);

    // Letter on current tile, just delete it but don't move cursor backwards.
    // This is how the NYT crossword UX works and its nice.
    // If the current tile is locked, you cannot edit it.
    if (currentTileHasLetter.letter && !currentTileHasLetter.isLocked) {
      const newTiles = resetBoardTileState(board).tiles;

      // Set new tile.
      newTiles[row][col].letter = null;
      newTiles[row][col].state = TileState.IDLE;
      newTiles[row][col].changeReason = undefined;

      return setBoard({ cursor: board.cursor, tiles: newTiles });
    } else if (currentTileHasLetter.letter && currentTileHasLetter.isLocked) {
      sendToast(LOCKED_TILE_MESSAGE);
    }

    // No letter on current tile, we want to delete the letter before the next
    // decemented cursor.
    const newCursor = decrementCursor(board);
    const newTiles = board.tiles.slice();

    // If the tile that we're going to delete is locked, we can't delete it.
    if (!newTiles[newCursor.row][newCursor.col].isLocked) {
      // Set new tile.
      newTiles[newCursor.row][newCursor.col].letter = null;
      newTiles[newCursor.row][newCursor.col].state = TileState.IDLE;
      newTiles[newCursor.row][newCursor.col].changeReason = undefined;
    } else {
      sendToast(LOCKED_TILE_MESSAGE);
    }

    setBoard({ cursor: newCursor, tiles: newTiles });
  }, [board]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetBoard = useCallback(() => {
    setBoard({
      ...board,
      tiles: board.tiles.map((row) =>
        row.map((tile) => ({ ...tile, letter: null, changeReason: undefined }))
      ),
    });
  }, [board]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLockedLettersOnBoard = useCallback(
    (tiles: Array<{ letter: Letter; row: number; col: number }>) => {
      setBoard((board) => {
        const newTiles = resetBoardTileState(board).tiles;

        console.info(tiles.map((l) => l.letter.id));
        console.info(newTiles.map((l) => l));

        // Check to see if any of the given tiles are already on the board.
        // If so, we should remove them first.
        for (let r = 0; r < newTiles.length; r++) {
          for (let c = 0; c < newTiles[0].length; c++) {
            const isGivenTileOnBoard = tiles.find(
              (givenTile) => givenTile.letter.id === newTiles[r][c].letter?.id
            );

            if (isGivenTileOnBoard) {
              newTiles[r][c].letter = null;
              newTiles[r][c].changeReason = undefined;
              newTiles[r][c].state = TileState.IDLE;
              newTiles[r][c].isLocked = false;
            }
          }
        }

        // Place all given tiles on the board.
        for (const { letter, row, col } of tiles) {
          // Set new tile.
          newTiles[row][col].letter = letter;
          newTiles[row][col].state = TileState.IDLE;
          newTiles[row][col].changeReason = TileChangeReason.LETTER;
          newTiles[row][col].isLocked = true;
        }

        return { ...board, tiles: newTiles };
      });
    },
    [setBoard]
  );

  const unlockAllTilesOnBoard = useCallback(() => {
    setBoard((board) => {
      return {
        ...board,
        tiles: board.tiles.map((row) =>
          row.map((tile) => ({ ...tile, isLocked: false }))
        ),
      };
    });
  }, [setBoard]);

  const publicSetBoard = useCallback(
    (board: Board) => setBoard(board),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const flipCursorDirection = useCallback(() => {
    setBoard((board) => ({
      ...board,
      cursor: {
        ...board.cursor,
        direction:
          board.cursor.direction === CursorDirections.LeftToRight
            ? CursorDirections.TopToBottom
            : CursorDirections.LeftToRight,
      },
    }));
  }, [setBoard]);

  const updateCursor = useCallback(
    (row: number, col: number) => {
      setBoard((board) => {
        if (board.cursor.row === row && board.cursor.col === col) {
          return {
            ...board,
            cursor: {
              ...board.cursor,
              direction:
                board.cursor.direction === CursorDirections.LeftToRight
                  ? CursorDirections.TopToBottom
                  : CursorDirections.LeftToRight,
            },
          };
        } else {
          return {
            ...board,
            cursor: {
              ...board.cursor,
              row,
              col,
            },
          };
        }
      });
    },
    [setBoard]
  );

  const lockedTilesCount = board.tiles
    .flat()
    .reduce((prev, tile) => (tile.isLocked ? prev + 1 : prev), 0);

  return {
    board,
    setLetterOnBoard,
    resetBoard,
    setBoard: publicSetBoard,
    updateCursor,
    flipCursorDirection,
    backspaceBoard,
    shiftBoard,
    moveCursorInDirection,
    setLockedLettersOnBoard,
    unlockAllTilesOnBoard,
    lockedTilesCount,
  };
};

function initalizeBoard(): Board {
  const initalCursor = {
    row: 0,
    col: 0,
    direction: CursorDirections.LeftToRight,
  };

  const tiles = new Array(Config.TileCount).fill(null).map((_, row) =>
    new Array(Config.TileCount).fill(null).map((_, col) => ({
      id: uuidv4(),
      row,
      col,
      letter: null,
      state: TileState.IDLE,
      changeReason: undefined,
    }))
  );

  return { cursor: initalCursor, tiles };
}
