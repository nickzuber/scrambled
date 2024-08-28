import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useContext, useMemo, useState } from "react";
import { FadeIn, Shine, createSuccessReveal } from "../../constants/animations";
import { AppTheme } from "../../constants/themes";
import { GameContext } from "../../contexts/game";
import { GlobalStatesContext } from "../../contexts/global";
import { TimerStateContext } from "../../contexts/timer";
import { ToastContext } from "../../contexts/toast";
import {
  createScoredBoard,
  createScoredSolutionBoard,
  createUnscoredBoard,
} from "../../utils/board-validator";
import { formatAsTimer, isBoardScored } from "../../utils/game";
import { getTextShareMessage } from "../../utils/words-helper";
import { Modal } from "./Modal";

function zeroPad(num: number, places: number) {
  return String(num).padStart(places, "0");
}

function getTimeLeftInDay() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const ms = tomorrow.getTime() - today.getTime();
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;

  return `${zeroPad(Math.floor(hours), 2)}:${zeroPad(Math.floor(minutes % 60), 2)}:${zeroPad(
    Math.floor(seconds % 60),
    2,
  )}`;
}

export const StatsModal: FC = () => {
  return (
    <Modal>
      <StatsModalImpl />
    </Modal>
  );
};

export const StatsModalImpl: FC = () => {
  const theme = useTheme() as AppTheme;
  const {
    board,
    solutionBoard,
    getShareClipboardItem,
    getScoredShareClipboardItem,
    isGameOver,
  } = useContext(GameContext);
  const { sendToast } = useContext(ToastContext);
  const [showPreview, setShowPreview] = useState(true);
  const {
    scoreMode,
    showTimer,
    streakCount,
    totalCompletionCount,
    totalWordCount,
    mostWordsInAPuzzle,
    fastedCompletion,
  } = useContext(GlobalStatesContext);

  const getShareClipboardItemForBoard = scoreMode
    ? getScoredShareClipboardItem
    : getShareClipboardItem;

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

  // const [timeLeft, setTimeLeft] = useState(getTimeLeftInDay());
  // useEffect(() => {
  //   const ts = setInterval(() => setTimeLeft(getTimeLeftInDay()), 1000);
  //   return () => clearInterval(ts);
  // }, []);

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
          text: "https://play-scrambled.com/",
          files: [imageFile],
        })
        .catch(() => {
          if (clipboardItem) {
            navigator.clipboard
              .write([clipboardItem])
              .then(() => sendToast("Copied to clipboard!"))
              .catch((e) => {
                console.error(e);
                sendToast("Unable to share\nTry taking a screenshot instead");
              });
          }
        });
    } else if (navigator.clipboard && clipboardItem) {
      navigator.clipboard
        .write([clipboardItem])
        .then(() => sendToast("Copied to clipboard!"))
        .catch((e) => {
          console.error(e);
          sendToast("Unable to copy\nTry taking a screenshot instead");
        });
    } else if (navigator.clipboard && !clipboardItem) {
      // Likely FF web or other platform that doesn't yet support `ClipboardItem`
      onShareTextResults();
    } else {
      console.error("[Image] Failed to access meaningful navigator properties.");
      onShareTextResults();
    }
  }

  async function onShareTextResults() {
    const shareText = getTextShareMessage(board);

    if (navigator.share) {
      navigator
        .share({
          url: shareText[0],
          title: shareText[1],
          text: shareText[2],
        })
        .catch(() => {
          navigator.clipboard
            .writeText(shareText.join("\n"))
            .then(() => sendToast("Copied to clipboard!"))
            .catch((e) => {
              console.error(e);
              sendToast("Unable to share\nTry taking a screenshot instead");
            });
        });
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareText.join("\n"))
        .then(() => sendToast("Copied to clipboard!"))
        .catch((e) => {
          console.error(e);
          sendToast("Unable to share\nTry taking a screenshot instead");
        });
    } else {
      console.error("[Text] Failed to access meaningful navigator properties.");
      sendToast("Unable to share\nTry taking a screenshot instead");
    }
  }

  return (
    <>
      <Divider theme={theme} />
      <FlexContainer>
        <StatItem title={totalCompletionCount.toLocaleString()} byline={"Puzzles"} />
        <StatItem title={totalWordCount.toLocaleString()} byline={"Words"} />
        <StatItem
          title={streakCount.toLocaleString()}
          byline={"Streak"}
          bylineIcon={streakCount >= 2 ? <FireSvg /> : undefined}
        />
      </FlexContainer>
      <Divider theme={theme} />
      <FlexContainer>
        <StatItem
          title={mostWordsInAPuzzle.toLocaleString()}
          byline={"Most words"}
          bylineIcon={<QuoteSvg />}
        />
        {showTimer ? <RunningTimerStatItem /> : null}
        <StatItem
          title={fastedCompletion ? formatAsTimer(fastedCompletion) : "—"}
          byline={"Quickest finish"}
          bylineIcon={<LightningSvg />}
        />
      </FlexContainer>
      <Divider theme={theme} />
      {!isGameOver ? (
        <Paragraph>
          Submit your puzzle to see
          <br />
          the author's solution for today
        </Paragraph>
      ) : (
        <>
          <Paragraph>The author's solution for today's puzzle</Paragraph>
          <MiniBoard
            theme={theme}
            hidePreview={!showPreview}
            message="Tap to see today's original solution"
            isGameOver={isGameOver}
            onClick={() => setShowPreview(true)}
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
                                <Score revealDelay={r * 100 + c * 100}>{tile.score}</Score>
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
        </>
      )}

      <Button presentAsDisabled={!isGameOver} theme={theme} onClick={onShareResults}>
        Share your solution
      </Button>

      {/* <Button presentAsDisabled={!isGameOver} theme={theme} onClick={onShareTextResults}>
        Share your puzzle (no spoilers)
      </Button> */}
    </>
  );
};

function RunningTimerStatItem() {
  const { timer } = useContext(TimerStateContext);

  return (
    <StatItem title={formatAsTimer(timer)} byline={"Today's time"} bylineIcon={<PauseSvg />} />
  );
}

const Button = styled.button<{ theme: AppTheme; presentAsDisabled?: boolean }>`
  animation-delay: 150ms;
  user-select: none;

  margin: 28px auto 24px;
  padding: 14px 32px;
  text-transform: none;
  white-space: nowrap;

  font-size: 1em;
  font-weight: 600;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
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
}) {
  return (
    <StatItemContainer>
      <StatItemTitle>
        {props.titleIcon}
        {props.title}
      </StatItemTitle>
      <StatItemByline>
        {props.bylineIcon}
        {props.byline}
      </StatItemByline>
    </StatItemContainer>
  );
}

const StatItemContainer = styled.div`
  flex: 1;
  padding-block: 14px 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatItemTitle = styled.div`
  font-size: 1.75em;
  line-height: 1.25em;
  font-family: franklin;
  font-weight: 300;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const StatItemByline = styled.div`
  font-size: 0.9em;
  line-height: 1.5em;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  @media (max-width: 380px) {
    font-size: 0.8em;
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
  transition: border 50ms ease-in, background 50ms ease-in;
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

const Title = styled.h1`
  margin: 0 0 24px;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  text-align: center;
`;

const Paragraph = styled.p`
  font-weight: 500;
  font-size: 1em;
  text-align: center;
  width: 100%;
  margin: 18px auto 8px;
`;

const Result = styled.span`
  font-weight: 700;
  text-align: center;
  font-size: 1.5rem;
  text-shadow: 0px 1px 2px #5d5d5d4f;
  margin: 8px auto;
  display: block;
`;

const SpacingContainer = styled.div`
  width: 100%;
  min-height: 50px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 12px auto 0;
`;

const ShareContainer = styled.div`
  width: 100%;
  min-height: 50px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 36px auto 24px;
`;

const Clock = styled.div`
  display: block;

  font-size: 1.25em;
  line-height: 1.286;
  font-weight: 500;
  letter-spacing: 0.01em;

  text-align: center;
  padding-inline: 24px;
`;

const ShareSection = styled.div`
  width: 50%;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ShareButton = styled.button`
  height: 40px;
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.25px;
  border: none;
  background: #6aaa64;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  transition: background 100ms ease-in;

  &:hover {
    background: #649d5e;
  }

  &:active {
    background: #5e9153;
  }

  svg {
    transform: scale(1);
  }

  &:before {
    font-size: 16px;
    content: "Share";
    margin-right: 8px;
  }
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

const SmallSpan = styled.span`
  display: inline-block;
  font-size: 14px;
  line-height: 14px;
  margin-left: 4px;
`;

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

const SparkleSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#000000"
      strokeWidth="1"
    >
      <path
        d="M8 15C12.8747 15 15 12.949 15 8C15 12.949 17.1104 15 22 15C17.1104 15 15 17.1104 15 22C15 17.1104 12.8747 15 8 15Z"
        fill={"#be4bdb"}
        stroke={theme.colors.iconBorder}
        strokeWidth="1.25"
        strokeLinejoin="round"
      ></path>
      <path
        d="M2 6.5C5.13376 6.5 6.5 5.18153 6.5 2C6.5 5.18153 7.85669 6.5 11 6.5C7.85669 6.5 6.5 7.85669 6.5 11C6.5 7.85669 5.13376 6.5 2 6.5Z"
        fill={"#be4bdb"}
        stroke={theme.colors.iconBorder}
        strokeWidth="1.25"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

const TimerSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 22 25"
      fill={"#51cf66"}
      stroke={theme.colors.iconBorder}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="6" />
      <polyline points="12 10 12 12 13 13" />
      <path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05" />
      <path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05" />
    </svg>
  );
};

const PauseSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 22 25"
      fill={"#51cf66"}
      stroke={theme.colors.iconBorder}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </svg>
  );
};

const LightningSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
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

const FireSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18px"
      height="18px"
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

const PaperSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#37b24d"
      strokeWidth="1.5"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.78415 1.35644C6.28844 1.0927 4.86213 2.09142 4.5984 3.58713L2.16732 17.3744C1.90359 18.8701 2.9023 20.2965 4.39801 20.5602L16.2157 22.644C17.7114 22.9077 19.1377 21.909 19.4015 20.4133L21.8325 6.62597C22.0963 5.13026 21.0976 3.70395 19.6018 3.44022L7.78415 1.35644ZM9.05919 5.64323C8.65127 5.5713 8.26228 5.84368 8.19035 6.2516C8.11842 6.65952 8.3908 7.04851 8.79872 7.12044L16.6772 8.50963C17.0851 8.58155 17.4741 8.30918 17.546 7.90126C17.618 7.49334 17.3456 7.10434 16.9377 7.03242L9.05919 5.64323ZM7.49577 10.1911C7.5677 9.78313 7.95669 9.51076 8.36461 9.58268L16.2431 10.9719C16.651 11.0438 16.9234 11.4328 16.8514 11.8407C16.7795 12.2486 16.3905 12.521 15.9826 12.4491L8.10414 11.0599C7.69622 10.988 7.42384 10.599 7.49577 10.1911ZM7.67003 13.5212C7.26211 13.4492 6.87312 13.7216 6.80119 14.1295C6.72926 14.5374 7.00164 14.9264 7.40956 14.9984L12.3336 15.8666C12.7415 15.9385 13.1305 15.6662 13.2024 15.2582C13.2744 14.8503 13.002 14.4613 12.5941 14.3894L7.67003 13.5212Z"
        fill="#37b24d"
        stroke="#000000"
        strokeWidth={1.5}
      ></path>
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
