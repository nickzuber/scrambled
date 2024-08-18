import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  FC,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FadeIn,
  PopIn,
  Shine,
  createIncorrectReveal,
  createInvalidReveal,
  createMixedReveal,
  createSuccessReveal,
} from "../constants/animations";
import { AppTheme } from "../constants/themes";
import { GameContext } from "../contexts/game";
import { GlobalStatesContext } from "../contexts/global";
import { countBoardScore, createScoredBoard } from "../utils/board-validator";
import {
  CursorDirections,
  Directions,
  Letter,
  ScoredTile,
  Tile,
  TileChangeReason,
  TileState,
  isTileScored,
  shouldShowTileScore,
} from "../utils/game";

type GridTileProps = {
  tile: Tile | ScoredTile;
  innerKey: string;
  hasCursor: boolean;
  hasCursorHighlight: boolean;
  cursorDirection: CursorDirections;
  handleTileClick: (tile: Tile) => void;
  isGameOver: boolean;
};

export const Board: FC = () => {
  const theme = useTheme() as AppTheme;
  const { scoreMode, submitCount } = useContext(GlobalStatesContext);
  const { board, updateCursor, shiftBoard, isGameOver } = useContext(GameContext);

  const score = useMemo(
    () => (isGameOver ? countBoardScore(createScoredBoard(board)) : null),
    [board, isGameOver],
  );

  const handleTileClick = useCallback(
    (tile: Tile) => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement?.blur();
      }

      updateCursor(tile.row, tile.col);
    },
    [updateCursor],
  );

  const [isShifting, setIsShifting] = useState(false);
  const xRef = useRef<number | null>(null);
  const yRef = useRef<number | null>(null);

  return (
    <Container
      id="inner-canvas"
      theme={theme}
      onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => {
        const firstTouch = event.touches[0];
        xRef.current = firstTouch.clientX;
        yRef.current = firstTouch.clientY;
      }}
      onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => {
        if (!xRef.current || !yRef.current) {
          return;
        }

        if (!isShifting) {
          setIsShifting(true);
        }

        const xUp = event.touches[0].clientX;
        const yUp = event.touches[0].clientY;
        const xDiff = xRef.current - xUp;
        const yDiff = yRef.current - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          if (xDiff < -50) {
            shiftBoard(Directions.Right);
            xRef.current = xUp;
            yRef.current = yUp;
          } else if (xDiff > 50) {
            shiftBoard(Directions.Left);
            xRef.current = xUp;
            yRef.current = yUp;
          }
        } else {
          if (yDiff < -50) {
            shiftBoard(Directions.Down);
            xRef.current = xUp;
            yRef.current = yUp;
          } else if (yDiff > 50) {
            shiftBoard(Directions.Up);
            xRef.current = xUp;
            yRef.current = yUp;
          }
        }
      }}
      onTouchEnd={() => {
        setIsShifting(false);
        xRef.current = null;
        yRef.current = null;
      }}
    >
      {board.tiles.map((row) => {
        const rowId = row.map(({ id }) => id).join(",");
        return (
          <Row key={rowId}>
            {row.map((tile) => (
              <GridTile
                key={tile.id}
                innerKey={`submit-key--${submitCount}`}
                tile={tile}
                cursorDirection={board.cursor.direction}
                handleTileClick={handleTileClick}
                hasCursor={board.cursor.row === tile.row && board.cursor.col === tile.col}
                hasCursorHighlight={
                  board.cursor.direction === CursorDirections.LeftToRight
                    ? board.cursor.row === tile.row
                    : board.cursor.col === tile.col
                }
                isGameOver={isGameOver}
              />
            ))}
          </Row>
        );
      })}
      {scoreMode && score !== null ? (
        <Fragment>
          <Spacer theme={theme} />
          <ScoreContainer id="score" theme={theme}>
            <ScoreLabel>Score</ScoreLabel>
            <ScoreValue score={score}>{score}</ScoreValue>
          </ScoreContainer>
        </Fragment>
      ) : null}
    </Container>
  );
};

enum GridTileState {
  Idle = "idle",
  PopIn = "pop-in",
  RevealSuccess = "reveal-success",
  RevealMixed = "reveal-mixed",
  RevealFail = "reveal-fail",
  RevealIncorrect = "reveal-incorrect",
}

const GridTile: FC<GridTileProps> = ({
  tile,
  innerKey,
  hasCursor,
  handleTileClick,
  cursorDirection,
  hasCursorHighlight,
  isGameOver,
}) => {
  const theme = useTheme() as AppTheme;
  const prevLetter = useRef<Letter | null>(tile.letter);
  const prevChangeReason = useRef<TileChangeReason | undefined>(tile.changeReason);
  const [gridTileState, setGridTileState] = useState<GridTileState>(GridTileState.Idle);
  const [enableShine, setEnableShine] = useState(false);

  useEffect(() => {
    let ts: ReturnType<typeof setTimeout>;
    if (isGameOver) {
      // + 1000ms for all animations to kick off.
      // + 500ms for the last animation to finish.
      // + 100 for some buffer room.
      ts = setTimeout(() => setEnableShine(true), 600);
    }

    return () => {
      if (ts) {
        clearTimeout(ts);
      }
    };
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;

    if (!prevChangeReason.current && tile.changeReason === TileChangeReason.LETTER) {
      setGridTileState(GridTileState.PopIn);
    } else if (tile.changeReason === TileChangeReason.LETTER) {
      setGridTileState(GridTileState.PopIn);
    }

    prevChangeReason.current = tile.changeReason;
  }, [tile.changeReason, isGameOver]);

  useEffect(() => {
    if (isGameOver) return;

    if (
      tile.changeReason === TileChangeReason.LETTER &&
      tile.letter &&
      prevLetter.current !== tile.letter
    ) {
      setGridTileState(GridTileState.PopIn);
    }

    prevLetter.current = tile.letter;
  }, [tile.letter, tile.changeReason, isGameOver]);

  useEffect(() => {
    const state = tile.state;

    if (state === TileState.VALID) {
      setGridTileState(GridTileState.RevealSuccess);
    } else if (state === TileState.MIXED) {
      setGridTileState(GridTileState.RevealMixed);
    } else if (state === TileState.INVALID) {
      setGridTileState(GridTileState.RevealFail);
    } else if (state === TileState.INCORRECT) {
      setGridTileState(GridTileState.RevealIncorrect);
    } else if (state === TileState.IDLE) {
      setGridTileState(GridTileState.Idle);
    }
  }, [tile.state]);

  // @DEBUGGING
  // if (tile.row === 3 && tile.col === 3) {
  //   console.info(tile.letter?.letter, tile.state, gridTileState);
  // }

  const shouldShowPivotLine =
    !isGameOver &&
    hasCursorHighlight &&
    (cursorDirection === CursorDirections.LeftToRight ? tile.col !== 0 : true) &&
    (cursorDirection === CursorDirections.TopToBottom ? tile.row !== 0 : true);

  const didMoveRef = useRef(false);

  return (
    <TileWrapper
      // onTouchStart={() => handleTileClick(tile)}
      onClick={() => handleTileClick(tile)}
      onTouchMove={() => {
        didMoveRef.current = true;
      }}
      // This prevents `onClick` from being fired if `onTouchStart` was fired.
      // https://stackoverflow.com/a/56970849/5055063
      onTouchEnd={(e) => {
        e.preventDefault();
        if (!didMoveRef.current) {
          handleTileClick(tile);
        }
        didMoveRef.current = false;
      }}
    >
      {isTileScored(tile) ? (
        <ScoredTileContents
          key={gridTileState === GridTileState.RevealIncorrect ? innerKey : undefined}
          score={tile.score}
          hasLetter={!!tile.letter?.letter}
          hasCursor={hasCursor && !isGameOver}
          hasCursorHighlight={hasCursorHighlight && !isGameOver}
          state={gridTileState}
          revealDelay={tile.row * 100 + tile.col * 100}
          theme={theme}
        >
          {tile.letter?.letter}
          {enableShine && shouldShowTileScore(tile) ? (
            <>
              <ShineContainer>
                <ShineWrapper score={tile.score} />
              </ShineContainer>
              <Score revealDelay={tile.row * 100 + tile.col * 100}>{tile?.score}</Score>
            </>
          ) : null}
        </ScoredTileContents>
      ) : (
        <TileContents
          key={gridTileState === GridTileState.RevealIncorrect ? innerKey : undefined}
          hasLetter={!!tile.letter?.letter}
          hasCursor={hasCursor && !isGameOver}
          hasCursorHighlight={hasCursorHighlight && !isGameOver}
          state={gridTileState}
          revealDelay={tile.row * 100 + tile.col * 100}
          theme={theme}
        >
          {tile.letter?.letter}
        </TileContents>
      )}
      {shouldShowPivotLine ? (
        cursorDirection === CursorDirections.LeftToRight ? (
          <PivotIndicatorLeftToRight theme={theme} delayOffsetMs={tile.col * 100} />
        ) : (
          <PivotIndicatorTopToBottom theme={theme} delayOffsetMs={tile.row * 100} />
        )
      ) : null}
    </TileWrapper>
  );
};

const Spacer = styled.div<{ theme: AppTheme }>`
  position: relative;
  box-sizing: border-box;
  background: ${(p) => p.theme.colors.primary};
  height: 12px;
  width: 360px; // 6 tiles * tile size

  @media (max-height: 620px), (max-width: 370px) {
    width: 320px; // 6 tiles * tile size
  }

  @media (max-height: 600px) {
    width: 290px; // 6 tiles * tile size
  }
`;

const ScoreContainer = styled.div<{ theme: AppTheme }>`
  position: relative;
  box-sizing: border-box;
  background: ${(p) => p.theme.colors.primary};
  width: 360px; // 6 tiles * tile size
  height: calc(60px + 8px);
  border-top: 2px solid ${(p) => p.theme.colors.tileSecondary};
  padding: 12px 8px;

  @media (max-height: 620px), (max-width: 370px) {
    width: 320px; // 6 tiles * tile size
    height: calc(54px + 8px);
  }

  @media (max-height: 600px) {
    width: 290px; // 6 tiles * tile size
    height: calc(48px + 8px);
  }

  align-items: center;
  justify-content: space-between;
  // display: flex;
  display: none;
`;

const ScoreLabel = styled.span`
  font-weight: 700;
  font-size: 24px;
  text-transform: uppercase;
`;

const ScoreValue = styled.span<{ score: number }>`
  font-weight: 700;
  font-size: 28px;
  color: #ffffff;

  text-shadow: 2px 2px 4px ${(p) => (p.score < 40 ? "#4f824b" : "#ae8e44")};
  border: 2px solid ${(p) => (p.score < 40 ? "#5a9755" : "#ceaa55")};
  background: ${(p) =>
    p.score < 40
      ? "#6aaa64"
      : `
        radial-gradient(
          ellipse farthest-corner at right bottom,
          #c6a818 0%,
          #ce9b34 8%,
          #daae53 30%,
          #ddaf47 40%,
          #fcc52a 80%,
          #dbab4b 100%
        ),
        radial-gradient(
          ellipse farthest-corner at left top,
          #c9aa2f 0%,
          #e2c427 8%,
          #e3b32c 25%,
          #9a7a30 62.5%,
          #c19738 100%
        );
  `};
  border-radius: 4px;
  padding: 2px 8px;
  text-align: center;
`;

const Container = styled.div<{ theme: AppTheme }>`
  position: relative;
  background: ${(p) => p.theme.colors.primary};
  width: 360px; // 6 tiles * tile size
  height: 360px;

  @media (max-height: 620px), (max-width: 370px) {
    width: 320px; // 6 tiles * tile size
    height: 320px;
  }

  @media (max-height: 600px) {
    width: 290px; // 6 tiles * tile size
    height: 290px;
  }
`;

const Row = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TileWrapper = styled.div`
  position: relative;
  min-height: 60px;
  min-width: 60px;
  max-height: 60px;
  max-width: 60px;
  height: 100%;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-height: 620px), (max-width: 370px) {
    min-height: 54px;
    min-width: 54px;
    max-height: 54px;
    max-width: 54px;
  }

  @media (max-height: 600px) {
    min-height: 48px;
    min-width: 48px;
    max-height: 48px;
    max-width: 48px;
  }
`;

const Score = styled.div<{ revealDelay: number }>(({ revealDelay }) => {
  return css`
    position: absolute;
    bottom: 2px;
    right: 3px;
    font-size: 14px;
    line-height: 14px;
    font-weight: 600;
    opacity: 0;

    animation: ${FadeIn} 300ms ease-in-out 1;
    animation-delay: ${revealDelay}ms;
    animation-fill-mode: forwards;
  `;
});

const ShineContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
`;

const ShineWrapper = styled.div<{ score: number | undefined }>(({ score }) => {
  if (!score) {
    return css``;
  }

  if (score === 1) {
    return css``;
  }

  return css`
    animation: ${Shine} 4s ease-in-out infinite;
    animation-fill-mode: forwards;
    content: "";
    position: absolute;
    top: -110%;
    left: -210%;
    width: 200%;
    height: 200%;
    opacity: 0;
    transform: rotate(30deg);

    background: rgba(255, 255, 255, 0.13);
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.13) 0%,
      rgba(255, 255, 255, 0.13) 77%,
      rgba(255, 255, 255, 0.5) 92%,
      rgba(255, 255, 255, 0) 100%
    );
  `;
});

const PivotIndicatorLeftToRight = styled.div<{ theme: AppTheme; delayOffsetMs: number }>`
  position: absolute;
  height: 2px;
  width: 20px;
  left: -10px;
  background: ${(p) => p.theme.colors.tileSecondary};
  z-index: 1;

  opacity: 0;
  animation: ${FadeIn} 300ms ease-in-out 1;
  animation-delay: ${(p) => p.delayOffsetMs}ms;
  animation-fill-mode: forwards;
`;

const PivotIndicatorTopToBottom = styled.div<{ theme: AppTheme; delayOffsetMs: number }>`
  position: absolute;
  height: 20px;
  width: 2px;
  top: -10px;
  background: ${(p) => p.theme.colors.tileSecondary};
  z-index: 1;

  opacity: 0;
  animation: ${FadeIn} 300ms ease-in-out 1;
  animation-delay: ${(p) => p.delayOffsetMs}ms;
  animation-fill-mode: forwards;
`;

const TileContents = styled.div<{
  hasLetter: boolean;
  hasCursor: boolean;
  hasCursorHighlight: boolean;
  state: GridTileState;
  revealDelay: number;
  theme: AppTheme;
}>(({ hasLetter, hasCursor, hasCursorHighlight, state, revealDelay, theme }) => {
  let animation;
  let animationDelay = "0ms";

  switch (state) {
    case GridTileState.PopIn:
      animation = css`
        animation: ${PopIn} 100ms;
      `;
      break;
    case GridTileState.RevealSuccess:
      animationDelay = `${revealDelay}ms`;
      animation = css`
        animation: ${createSuccessReveal(
            theme.colors.text,
            theme.colors.tileSecondary,
            theme.colors.primary,
          )}
          500ms ease-in;
      `;
      break;
    case GridTileState.RevealMixed:
      animationDelay = `${revealDelay}ms`;
      animation = css`
        animation: ${createMixedReveal(
            theme.colors.text,
            theme.colors.tileSecondary,
            theme.colors.primary,
          )}
          500ms ease-in;
      `;
      break;
    case GridTileState.RevealFail:
      animationDelay = `${revealDelay}ms`;
      animation = css`
        animation: ${createInvalidReveal(
            theme.colors.text,
            theme.colors.tileSecondary,
            theme.colors.primary,
          )}
          500ms ease-in;
      `;
      break;
    case GridTileState.RevealIncorrect:
      animationDelay = `100ms`;
      animation = css`
        animation: ${createIncorrectReveal(
            theme.colors.text,
            theme.colors.tileSecondary,
            theme.colors.primary,
          )}
          500ms ease-in;
      `;
      break;
  }

  const cursorColor = theme.colors.app;
  const cursorColorBgTemp = theme.colors.appAlt;

  const backgroundColor = hasCursor
    ? `${cursorColorBgTemp}`
    : hasLetter && hasCursorHighlight
    ? `${theme.colors.highlight}`
    : hasCursorHighlight
    ? theme.colors.highlight
    : theme.colors.primary;
  const borderColor = hasCursor
    ? cursorColor
    : hasLetter
    ? theme.colors.highlightBorder
    : theme.colors.tileSecondary;

  // @NOTE
  // We center the contents of this div using line-height instead of flexbox
  // because when we generate png images in the share modal, the image doesn't
  // respect flexbox for some reason.
  return css`
    z-index: 2;
    background: ${backgroundColor};
    border: 2px solid ${borderColor};
    transition: border 50ms ease-in, background 50ms ease-in;
    color: ${theme.colors.text};
    min-height: 53px;
    min-width: 53px;
    max-height: 53px;
    max-width: 53px;
    height: calc(100% - 10px);
    width: calc(100% - 10px);
    opacity: 1;
    font-weight: 700;
    font-size: 24px;

    text-align: center;
    line-height: 48px;

    user-select: none;
    ${animation}
    animation-delay: ${animationDelay};
    animation-fill-mode: forwards;
    text-transform: uppercase;

    @media (max-height: 620px), (max-width: 370px) {
      min-height: 47px;
      min-width: 47px;
      max-height: 47px;
      max-width: 47px;

      line-height: 43px;
    }

    @media (max-height: 600px) {
      min-height: 42px;
      min-width: 42px;
      max-height: 42px;
      max-width: 42px;

      line-height: 38px;
    }
  `;
});

/**
 * Yes, this is pretty much a copy + paste of <TileContents />
 * There's probably a better way to do this but it doesn't really matter rn.
 */
const ScoredTileContents = styled.div<{
  score: number | undefined;
  hasLetter: boolean;
  hasCursor: boolean;
  hasCursorHighlight: boolean;
  state: GridTileState;
  revealDelay: number;
  theme: AppTheme;
}>(({ score, hasLetter, hasCursor, hasCursorHighlight, state, revealDelay, theme }) => {
  let animation;
  let animationDelay = "0ms";

  switch (state) {
    case GridTileState.PopIn:
      animation = css`
        animation: ${PopIn} 100ms;
      `;
      break;
    case GridTileState.RevealSuccess:
      animationDelay = `${revealDelay}ms`;
      animation = css`
        animation: ${createSuccessReveal(
            theme.colors.text,
            theme.colors.tileSecondary,
            theme.colors.primary,
            score,
          )}
          500ms ease-in;
      `;
      break;
    case GridTileState.RevealMixed:
      animationDelay = `${revealDelay}ms`;
      animation = css`
        animation: ${createMixedReveal(
            theme.colors.text,
            theme.colors.tileSecondary,
            theme.colors.primary,
          )}
          500ms ease-in;
      `;
      break;
    case GridTileState.RevealFail:
      animationDelay = `${revealDelay}ms`;
      animation = css`
        animation: ${createInvalidReveal(
            theme.colors.text,
            theme.colors.tileSecondary,
            theme.colors.primary,
          )}
          500ms ease-in;
      `;
      break;
  }

  const cursorColor = theme.colors.app;
  const cursorColorBgTemp = theme.colors.appAlt;

  const backgroundColor = hasCursor
    ? `${cursorColorBgTemp}`
    : hasLetter && hasCursorHighlight
    ? `${theme.colors.highlight}88`
    : hasCursorHighlight
    ? theme.colors.highlight
    : theme.colors.primary;
  const borderColor = hasCursor
    ? cursorColor
    : state === GridTileState.RevealIncorrect
    ? "#f03e3e"
    : hasLetter
    ? theme.colors.highlightBorder
    : theme.colors.tileSecondary;

  // @NOTE
  // We center the contents of this div using line-height instead of flexbox
  // because when we generate png images in the share modal, the image doesn't
  // respect flexbox for some reason.
  return css`
    z-index: 2;
    background: ${backgroundColor};
    border: 2px solid ${borderColor};
    transition: border 50ms ease-in, background 50ms ease-in;
    color: ${theme.colors.text};
    min-height: 53px;
    min-width: 53px;
    max-height: 53px;
    max-width: 53px;
    height: calc(100% - 10px);
    width: calc(100% - 10px);
    opacity: 1;
    font-weight: 700;
    font-size: 24px;

    text-align: center;
    line-height: 48px;

    user-select: none;
    ${animation}
    animation-delay: ${animationDelay};
    animation-fill-mode: forwards;
    text-transform: uppercase;

    @media (max-height: 620px), (max-width: 370px) {
      min-height: 48px;
      min-width: 48px;
      max-height: 48px;
      max-width: 48px;

      line-height: 43px;
    }

    @media (max-height: 600px) {
      min-height: 43px;
      min-width: 43px;
      max-height: 43px;
      max-width: 43px;

      line-height: 38px;
    }
  `;
});
