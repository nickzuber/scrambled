import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Description } from "@radix-ui/react-dialog";
import { FC, useContext, useMemo, useState } from "react";
import { createSuccessReveal, FadeIn, Shine } from "../../constants/animations";
import { AppTheme } from "../../constants/themes";
import { GameContext } from "../../contexts/game";
import { GlobalStatesContext } from "../../contexts/global";
import { TimerStateContext } from "../../contexts/timer";
import { ToastContext } from "../../contexts/toast";
import {
  countBoardScore,
  countValidWordsOnBoard,
  createScoredBoard,
  createScoredSolutionBoard,
  createUnscoredBoard,
} from "../../utils/board-validator";
import { formatAsTimer, isBoardScored } from "../../utils/game";
import {
  getTextShareMessage,
  getTextShareMessagePuzzleOfTheDay,
  printBoard,
  ScoredSolutionBoard,
  SolutionBoard,
} from "../../utils/words-helper";
import { Toggle } from "../core/Toggle";
import { Modal } from "./Modal";
import { Label, Name, Setting } from "./SettingsModal";

// Make this `true` to a a valid solution for today's board.
const DEBUGGING = false;

export const StatsModal: FC = () => {
  return (
    <Modal>
      <StatsModalImpl />
    </Modal>
  );
};

export const StatsModalImpl: FC = () => {
  const theme = useTheme() as AppTheme;
  const { board, solutionBoard, getShareClipboardItem, isGameOver } =
    useContext(GameContext);
  const { sendToast } = useContext(ToastContext);
  const [showPreview] = useState(true);
  const {
    scoreMode,
    showTimer,
    streakCount,
    totalCompletionCount,
    totalWordCount,
    totalPointCount,
    mostWordsInAPuzzle,
    highestScore,
    highestStreak,
    fastedCompletion,
    shareHideSolution,
    setShareHideSolution,
  } = useContext(GlobalStatesContext);

  const { timer } = useContext(TimerStateContext);

  // Used for "today's" stats.
  const currentScore = useMemo(
    () => countBoardScore(createScoredBoard(board)),
    [board],
  );
  const currentWordCount = useMemo(
    () => countValidWordsOnBoard(board),
    [board],
  );

  // const getShareClipboardItemForBoard = scoreMode
  //   ? getScoredShareClipboardItem
  //   : getShareClipboardItem;
  const getShareClipboardItemForBoard = getShareClipboardItem;

  // Solution board but with a score for each tile.
  const scoredSolutionBoard = useMemo(
    () => createScoredSolutionBoard(solutionBoard),
    [solutionBoard],
  );

  const yourBoard = useMemo(
    () => (scoreMode ? createScoredBoard(board) : createUnscoredBoard(board)),
    [board, scoreMode],
  );

  const showScoredBoard = scoreMode && isBoardScored(yourBoard);

  async function onShareResults() {
    if (!isGameOver) {
      sendToast("Submit your puzzle before sharing");
      return;
    }

    const results = await getShareClipboardItemForBoard();
    if (!results) {
      console.error("Failed to generate clipboard items.");
      sendToast("Unable to share\nTry taking a screenshot instead");
      return;
    }

    const [clipboardItem, imageFile] = results;

    if (navigator.share) {
      navigator
        .share({
          text: getTextShareMessagePuzzleOfTheDay({
            finalScore: scoreMode ? currentScore : undefined,
            completedTime: showTimer ? formatAsTimer(timer) : undefined,
          }),
          files: [imageFile],
        })
        .catch(() => {
          if (clipboardItem) {
            navigator.clipboard
              .write([clipboardItem])
              .then(() => sendToast("Copied link & image to clipboard!"))
              .catch((e) => {
                console.error(e);
                sendToast("Unable to share\nTry taking a screenshot instead");
              });
          }
        });
    } else if (navigator.clipboard && clipboardItem) {
      navigator.clipboard
        .write([clipboardItem])
        .then(() => sendToast("Copied image to clipboard!"))
        .catch((e) => {
          console.error(e);
          sendToast("Unable to copy\nTry taking a screenshot instead");
        });
    } else if (navigator.clipboard && !clipboardItem) {
      // Likely FF web or other platform that doesn't yet support `ClipboardItem`
      onShareTextResults();
    } else {
      console.error(
        "[Image] Failed to access meaningful navigator properties.",
      );
      onShareTextResults();
    }
  }

  async function onShareTextResults() {
    if (!isGameOver) {
      sendToast("Submit your puzzle before sharing");
      return;
    }

    const shareText = getTextShareMessage({
      board,
      finalScore: scoreMode ? currentScore : undefined,
      completedTime: showTimer ? formatAsTimer(timer) : undefined,
    });

    if (navigator.share) {
      navigator
        .share({
          text: shareText,
        })
        .catch(() => {
          navigator.clipboard
            .writeText(shareText)
            .then(() => sendToast("Copied link & emojis to clipboard!"))
            .catch((e) => {
              console.error(e);
              sendToast("Unable to share\nTry taking a screenshot instead");
            });
        });
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => sendToast("Copied link & emojis to clipboard!"))
        .catch((e) => {
          console.error(e);
          sendToast("Unable to share\nTry taking a screenshot instead");
        });
    } else {
      console.error("[Text] Failed to access meaningful navigator properties.");
      sendToast("Unable to share\nTry taking a screenshot instead");
    }
  }

  // Makes it easier if I need to solve the puzzle for testing.
  if (DEBUGGING) {
    console.info(printBoard(solutionBoard));
  }

  return (
    <>
      <Divider theme={theme} />
      <FlexContainer>
        <StatItem
          title={totalCompletionCount.toLocaleString()}
          byline={"Total puzzles"}
        />

        <StatItem
          title={totalWordCount.toLocaleString()}
          byline={"Total words"}
        />
        <StatItem
          title={totalPointCount.toLocaleString()}
          byline={"Total points"}
        />
      </FlexContainer>
      <Divider theme={theme} />

      <FlexContainer>
        {scoreMode ? (
          <StatItem
            new={isGameOver ? currentScore >= highestScore : false}
            newOffsetX={-32}
            title={currentScore.toLocaleString()}
            byline={"Today's score"}
          />
        ) : (
          <StatItem
            new={isGameOver ? currentWordCount >= mostWordsInAPuzzle : false}
            newOffsetX={-42}
            title={currentWordCount.toLocaleString()}
            byline={"Words found"}
          />
        )}

        <StatItem
          title={streakCount.toLocaleString()}
          byline={"Current streak"}
          bylineIcon={
            streakCount > 0 && streakCount >= highestStreak ? (
              <FireSvg />
            ) : undefined
          }
        />

        <StatItem
          new={
            isGameOver && fastedCompletion ? timer <= fastedCompletion : false
          }
          title={formatAsTimer(timer)}
          byline={"Today's time"}
        />
      </FlexContainer>
      <Divider theme={theme} />

      <FlexContainer>
        {scoreMode ? (
          <StatItem
            title={highestScore.toLocaleString()}
            byline={"Highest score"}
            bylineIcon={<TrophySvg />}
          />
        ) : (
          <StatItem
            title={mostWordsInAPuzzle.toLocaleString()}
            byline={"Most words"}
            bylineIcon={<QuoteSvg />}
          />
        )}

        <StatItem
          title={Math.max(highestStreak, streakCount).toLocaleString()}
          byline={"Max streak"}
          bylineIcon={<FireSvg />}
        />

        <StatItem
          title={fastedCompletion ? formatAsTimer(fastedCompletion) : "—"}
          byline={"Fastest finish"}
          bylineIcon={<LightningSvg />}
        />
      </FlexContainer>
      <Divider theme={theme} />

      {!isGameOver ? (
        <>
          <Paragraph italic>
            Submit your puzzle to see the author's
            <br />
            solution for today
          </Paragraph>
        </>
      ) : (
        <>
          <Paragraph italic>The author's solution for today's puzzle</Paragraph>
          <AuthorSolution
            theme={theme}
            showPreview={showPreview}
            isGameOver={isGameOver}
            showScoredBoard={showScoredBoard}
            scoredSolutionBoard={scoredSolutionBoard}
            solutionBoard={solutionBoard}
          />
        </>
      )}

      <Paragraph left style={{ width: "90%" }}>
        Think a word is wrong or missing? Email me at{" "}
        <EmailLink theme={theme} href="mailto:zuber.nicholas@gmail.com">
          zuber.nicholas@gmail.com
        </EmailLink>
        .
      </Paragraph>

      <ShareContainer>
        <Button
          presentAsDisabled={!isGameOver}
          theme={theme}
          onClick={shareHideSolution ? onShareTextResults : onShareResults}
        >
          {/* <ShareAltSvg /> */}
          <ShareSvg />
          Share your puzzle
        </Button>
        <Setting
          style={{ width: "calc(100% - 44px)", marginBottom: 4, marginTop: 12 }}
        >
          <Label>
            <Name>Hide your letters</Name>
            <Description>Use emojis when sharing puzzle</Description>
          </Label>
          <ToggleContainer>
            <Toggle
              onClick={() => setShareHideSolution((s) => !s)}
              enabled={shareHideSolution}
            />
          </ToggleContainer>
        </Setting>
      </ShareContainer>
    </>
  );
};

function AuthorSolution(props: {
  theme: AppTheme;
  showPreview: boolean;
  isGameOver: boolean;
  showScoredBoard: boolean;
  scoredSolutionBoard: ScoredSolutionBoard;
  solutionBoard: SolutionBoard;
}) {
  const {
    theme,
    showPreview,
    isGameOver,
    showScoredBoard,
    scoredSolutionBoard,
    solutionBoard,
  } = props;

  return (
    <MiniBoard
      theme={theme}
      hidePreview={!showPreview}
      message="Tap to see today's original solution"
      isGameOver={isGameOver}
    >
      {showScoredBoard
        ? scoredSolutionBoard.map((row, r) => {
            return (
              <MiniRow key={r}>
                {row.map((tile, c) => (
                  <MiniTileWrapper key={`${r}${c}`}>
                    {tile.letter && showPreview ? (
                      <MiniTileContentsSuccess
                        theme={theme}
                        animationDelay={r * 100 + c * 100}
                        score={tile.score}
                      >
                        {tile.letter}
                        <>
                          <ShineContainer>
                            <ShineWrapper score={tile.score} />
                          </ShineContainer>
                          <Score revealDelay={r * 100 + c * 100}>
                            {tile.score}
                          </Score>
                        </>
                      </MiniTileContentsSuccess>
                    ) : (
                      <MiniTileContents theme={theme} />
                    )}
                  </MiniTileWrapper>
                ))}
              </MiniRow>
            );
          })
        : solutionBoard.map((row, r) => {
            return (
              <MiniRow key={r}>
                {row.map((letter, c) => (
                  <MiniTileWrapper key={`${r}${c}`}>
                    {letter && showPreview ? (
                      <MiniTileContentsSuccess
                        theme={theme}
                        animationDelay={r * 100 + c * 100}
                      >
                        {letter}
                      </MiniTileContentsSuccess>
                    ) : (
                      <MiniTileContents theme={theme} />
                    )}
                  </MiniTileWrapper>
                ))}
              </MiniRow>
            );
          })}
    </MiniBoard>
  );
}

const EmailLink = styled.a<{ theme: AppTheme }>`
  color: ${(p) => p.theme.colors.linkText};
  text-decoration: none;
`;

const ToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 18px;
`;

const ShareContainer = styled.div`
  width: 100%;
  gap: 12px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  margin: 18px auto 24px;
`;

const Button = styled.button<{ theme: AppTheme; presentAsDisabled?: boolean }>`
  animation-delay: 150ms;
  user-select: none;

  padding: 14px 32px;
  text-transform: none;
  white-space: nowrap;

  width: 90%;
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

function StatItem(props: {
  title: React.ReactNode;
  byline: React.ReactNode;
  titleIcon?: React.ReactNode;
  bylineIcon?: React.ReactNode;
  new?: boolean;
  newOffsetX?: number;
}) {
  return (
    <StatItemContainer>
      <StatItemTitle>
        {props.titleIcon}
        {props.title}
        {props.new ? (
          <Tag
            className="popInSmall"
            style={
              props.newOffsetX
                ? {
                    left: `${props.newOffsetX}px`,
                  }
                : undefined
            }
          >
            new Record
          </Tag>
        ) : null}
      </StatItemTitle>
      <StatItemByline>
        {props.bylineIcon}
        {props.byline}
      </StatItemByline>
    </StatItemContainer>
  );
}

const Tag = styled.span`
  display: block;
  position: absolute;
  // background: #fe0606;
  background: #e41e1d;

  top: -16px;
  left: -24px;

  width: fit-content;
  white-space: nowrap;

  font-size: 0.5em;
  line-height: 1em;
  color: #ffffff;
  font-family: franklin, Inter, sans-serif;
  letter-spacing: 0.85px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 18px;
  text-transform: uppercase;
  box-shadow:
    rgba(50, 50, 93, 0.15) 0px 6px 12px -2px,
    rgba(0, 0, 0, 0.2) 0px 3px 7px -3px;
`;

const StatItemContainer = styled.div`
  position: relative;
  flex: 1;
  padding-block: 10px 8px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatItemTitle = styled.div`
  position: relative;

  font-size: 1.75em;
  line-height: 1.25em;
  font-family: franklin;
  font-weight: 400;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const StatItemByline = styled.div`
  font-size: 0.9em;
  line-height: 1.5em;
  // text-align: center;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  @media (max-width: 380px) {
    font-size: 0.8em;

    svg {
      height: 14px;
      width: 14px;
    }
  }

  @media (max-width: 350px) {
    font-size: 0.7em;

    svg {
      height: 12px;
      width: 12px;
    }
  }
`;

const Divider = styled.div<{ theme: AppTheme }>`
  background: ${(p) => p.theme.colors.text};
  width: 100%;
  height: 1px;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const MiniBoard = styled.div<{
  isGameOver: boolean;
  hidePreview?: boolean;
  message?: string;
  theme: AppTheme;
}>`
  position: relative;
  background: ${(p) => p.theme.colors.primary};
  width: 240px; // 6 tiles * tile size
  height: 240px;
  margin: 0 auto;

  ${(p) =>
    p.hidePreview
      ? `
          &:after {
            content: "${p.message || ""}";
            background: ${p.theme.colors.primary}14;
            position: absolute;
            top: -10px;
            bottom: -10px;
            right: -10px;
            left: -10px;
            backdrop-filter: blur(3px);
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-size: 1.25rem;
            font-weight: 600;
            padding: 12px 24px;
            text-shadow: 0px 0px 2px #5b5b5b2b;
            cursor: ${p.isGameOver ? "pointer" : "default"};
        }
          }
        `
      : null}
`;

const MiniRow = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MiniTileWrapper = styled.div`
  position: relative;
  min-height: 40px;
  min-width: 40px;
  max-height: 40px;
  max-width: 40px;
  height: 100%;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: default;
`;

const MiniTileContents = styled.div<{ theme: AppTheme }>`
  background: ${(p) => p.theme.colors.primary};
  border: 2px solid ${(p) => p.theme.colors.tileSecondary};
  transition:
    border 50ms ease-in,
    background 50ms ease-in;
  color: ${(p) => p.theme.colors.text};
  min-height: 36px;
  min-width: 36px;
  max-height: 36px;
  max-width: 36px;
  height: calc(100% - 10px);
  width: calc(100% - 10px);
  opacity: 1;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-transform: uppercase;
`;

const MiniTileContentsSuccess = styled(MiniTileContents)<{
  animationDelay: number;
  theme: AppTheme;
  score?: number;
}>`
  animation: ${(p) =>
      createSuccessReveal(
        p.theme.colors.text,
        p.theme.colors.tileSecondary,
        p.theme.colors.primary,
        p.score,
      )}
    500ms ease-in;
  animation-delay: ${(p) => p.animationDelay}ms;
  animation-fill-mode: forwards;
`;

// ====================================================

const Paragraph = styled.p<{ italic?: boolean; left?: boolean }>`
  font-weight: 500;
  font-size: 1em;
  line-height: 1.4em;
  text-align: ${(p) => (p.left ? "left" : "center")};
  width: 100%;
  margin: 18px auto 8px;

  font-style: ${(p) => (p.italic ? "italic" : "normal")};
`;

const Score = styled.div<{ revealDelay: number }>(({ revealDelay }) => {
  return css`
    position: absolute;
    bottom: 1px;
    right: 1px;
    font-size: 10px;
    line-height: 10px;
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

// Icons

const LightningSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
      style={{ transform: "translate(2px, -1px)" }}
      strokeWidth="2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.2319 2.28681C13.5409 2.38727 13.75 2.6752 13.75 3.00005V9.25005H19C19.2821 9.25005 19.5403 9.40834 19.6683 9.65972C19.7963 9.9111 19.7725 10.213 19.6066 10.4412L11.6066 21.4412C11.4155 21.7039 11.077 21.8137 10.7681 21.7133C10.4591 21.6128 10.25 21.3249 10.25 21.0001V14.7501H5C4.71791 14.7501 4.45967 14.5918 4.33167 14.3404C4.20366 14.089 4.22753 13.7871 4.39345 13.5589L12.3935 2.55892C12.5845 2.2962 12.923 2.18635 13.2319 2.28681Z"
        fill={theme.colors.app}
        stroke={theme.colors.iconBorder}
      ></path>
    </svg>
  );
};

const TrophySvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      width="16px"
      height="16px"
      style={{ transform: "translate(1px, 0px)" }}
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="#fd7e14"
      stroke={theme.colors.iconBorder}
    >
      <path
        d="M6.74534 4H17.3132C17.3132 4 16.4326 17.2571 12.0293 17.2571C9.87826 17.2571 8.56786 14.0935 7.79011 10.8571C6.97574 7.46844 6.74534 4 6.74534 4Z"
        stroke={theme.colors.iconBorder}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M17.3132 4C17.3132 4 18.2344 3.01733 19 2.99999C20.5 2.96603 20.7773 4 20.7773 4C21.0709 4.60953 21.3057 6.19429 19.8967 7.65715C18.4876 9.12 16.9103 10.4 16.2684 10.8571"
        stroke={theme.colors.iconBorder}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M6.74527 4.00001C6.74527 4.00001 5.78547 3.00614 4.99995 3.00001C3.49995 2.9883 3.22264 4.00001 3.22264 4.00001C2.92908 4.60953 2.69424 6.19429 4.1033 7.65715C5.51235 9.12001 7.14823 10.4 7.79004 10.8572"
        stroke={theme.colors.iconBorder}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M8.50662 20C8.50662 18.1714 12.0292 17.2571 12.0292 17.2571C12.0292 17.2571 15.5519 18.1714 15.5519 20H8.50662Z"
        stroke={theme.colors.iconBorder}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

const FireSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16px"
      height="16px"
      viewBox="0 0 16 26"
      fill="#e41d1d"
      stroke={theme.colors.iconBorder}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
};

const QuoteSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="#fd7e14"
      stroke={theme.colors.iconBorder}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
      <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    </svg>
  );
};

const ShareSvg = () => {
  const theme = useTheme() as AppTheme;

  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={theme.colors.invertedText}
      strokeWidth="1.5"
    >
      <path
        d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
        fill={theme.colors.invertedText}
        stroke={theme.colors.invertedText}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
        fill={theme.colors.invertedText}
        stroke={theme.colors.invertedText}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
        fill={theme.colors.invertedText}
        stroke={theme.colors.invertedText}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M15.5 6.5L8.5 10.5"
        stroke={theme.colors.invertedText}
        strokeWidth="1.5"
      ></path>
      <path
        d="M8.5 13.5L15.5 17.5"
        stroke={theme.colors.invertedText}
        strokeWidth="1.5"
      ></path>
    </svg>
  );
};
