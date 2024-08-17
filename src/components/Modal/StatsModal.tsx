import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { FadeIn, Shine, createSuccessReveal } from "../../constants/animations";
import { AppTheme } from "../../constants/themes";
import { GameContext } from "../../contexts/game";
import { GlobalStatesContext } from "../../contexts/global";
import { ToastContext } from "../../contexts/toast";
import {
  createScoredBoard,
  createScoredSolutionBoard,
  createUnscoredBoard,
} from "../../utils/board-validator";
import { isBoardScored } from "../../utils/game";
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

function letterCountToCompliment(score: number) {
  if (score < 10) {
    return "Better luck next time!";
  }
  if (score < 14) {
    return "Not too shabby!";
  }
  if (score < 16) {
    return "Nice.";
  }
  if (score < 20) {
    return "Awesome!";
  }
  if (score >= 20) {
    return "Perfect — you're amazing!";
  }
  return "";
}

function scoreToCompliment(score: number, target: number) {
  if (score < target) {
    return "Better luck next time!";
  }
  if (score === target) {
    return "Right on point!";
  }
  if (score > 30) {
    return "Wow, great score!";
  }
  if (score > 40) {
    return "You are a legend — this score is insanely rare!";
  }
  if (score > target) {
    return "Great job!";
  }
  return "";
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
  const [timeLeft, setTimeLeft] = useState(getTimeLeftInDay());
  const [showPreview, setShowPreview] = useState(true);
  const { scoreMode, streakCount, totalCompletionCount, totalWordCount, mostWordsInAPuzzle } =
    useContext(GlobalStatesContext);

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

  useEffect(() => {
    const ts = setInterval(() => setTimeLeft(getTimeLeftInDay()), 1000);
    return () => clearInterval(ts);
  }, []);

  async function onShareResults() {
    if (!isGameOver) {
      sendToast("Submit your puzzle before sharing");
      return;
    }

    const results = await getShareClipboardItemForBoard();
    if (!results) {
      sendToast("Something went wrong.");
      return;
    }

    const [clipboardItem, imageFile] = results;
    if (navigator.share) {
      navigator
        .share({
          files: [imageFile],
        })
        .catch(() =>
          navigator.clipboard
            .write([clipboardItem])
            .then(() => sendToast("Copied to clipboard!"))
            .catch(() => sendToast("Unable to share\nTry taking a screenshot instead")),
        );
    } else if (navigator.clipboard) {
      navigator.clipboard
        .write([clipboardItem])
        .then(() => sendToast("Copied to clipboard!"))
        .catch(() => sendToast("Unable to copy\nTry taking a screenshot instead"));
    } else {
      sendToast("Something went wrong.");
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
          titleIcon={streakCount > 7 ? <FireSvg /> : undefined}
        />
      </FlexContainer>
      <Divider theme={theme} />
      <FlexContainer>
        <StatItem
          title={mostWordsInAPuzzle.toLocaleString()}
          byline={"Most words"}
          bylineIcon={<QuoteSvg />}
        />
        <StatItem title={"3:22"} byline={"Quickest finish"} bylineIcon={<LightningSvg />} />
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
        Share your puzzle
      </Button>
    </>
  );
};

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
  padding-block: 10px;

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

const MiniBoardEmptyRows = () => {
  const theme = useTheme() as AppTheme;
  return (
    <>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
      </MiniRow>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
      </MiniRow>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
      </MiniRow>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
      </MiniRow>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
      </MiniRow>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
      </MiniRow>
    </>
  );
};

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
        stroke={theme.colors.text}
        strokeWidth="1.25"
        strokeLinejoin="round"
      ></path>
      <path
        d="M2 6.5C5.13376 6.5 6.5 5.18153 6.5 2C6.5 5.18153 7.85669 6.5 11 6.5C7.85669 6.5 6.5 7.85669 6.5 11C6.5 7.85669 5.13376 6.5 2 6.5Z"
        fill={"#be4bdb"}
        stroke={theme.colors.text}
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
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#000000"
      strokeWidth="1.5"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.25C7.16751 5.25 3.25 9.16751 3.25 14C3.25 18.8325 7.16751 22.75 12 22.75C16.8325 22.75 20.75 18.8325 20.75 14C20.75 9.16751 16.8325 5.25 12 5.25ZM12.75 10C12.75 9.58579 12.4142 9.25 12 9.25C11.5858 9.25 11.25 9.58579 11.25 10L11.25 14C11.25 14.4142 11.5858 14.75 12 14.75C12.4142 14.75 12.75 14.4142 12.75 14L12.75 10Z"
        fill={theme.colors.app}
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.25 2C8.25 1.58579 8.58579 1.25 9 1.25L15 1.25C15.4142 1.25 15.75 1.58579 15.75 2C15.75 2.41421 15.4142 2.75 15 2.75L9 2.75C8.58579 2.75 8.25 2.41421 8.25 2Z"
        fill={theme.colors.app}
      ></path>
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
        stroke={theme.colors.text}
      ></path>
    </svg>
  );
};

const FireSvg = () => {
  const theme = useTheme() as AppTheme;
  return (
    <svg width="20" height="24" viewBox="0 0 24 24">
      <path
        fill="#ee3044"
        stroke="#000000"
        strokeWidth={1.5}
        d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"
      />
      <path d="M0 0h24v24H0z" fill="none" />
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
      width="18px"
      height="18px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#000000"
      stroke-width="1.5"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9.21255 12.75C9.12943 13.5242 8.9054 14.1421 8.5147 14.6891C7.99181 15.4211 7.11571 16.1036 5.66459 16.8292C5.29411 17.0144 5.14394 17.4649 5.32918 17.8354C5.51442 18.2059 5.96493 18.3561 6.33541 18.1708C7.88429 17.3964 9.00819 16.5789 9.7353 15.5609C10.4761 14.5238 10.75 13.3571 10.75 12V7.5C10.75 6.53351 9.96649 5.75 9 5.75H5C4.03351 5.75 3.25 6.53351 3.25 7.5V11C3.25 11.9665 4.03352 12.75 5 12.75H9.21255Z"
        fill="#ff922b"
        stroke="#000000"
      ></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M19.2125 12.75C19.1294 13.5242 18.9054 14.1421 18.5147 14.6891C17.9918 15.4211 17.1157 16.1036 15.6646 16.8292C15.2941 17.0144 15.1439 17.4649 15.3292 17.8354C15.5144 18.2059 15.9649 18.3561 16.3354 18.1708C17.8843 17.3964 19.0082 16.5789 19.7353 15.5609C20.4761 14.5238 20.75 13.3571 20.75 12V7.5C20.75 6.53352 19.9665 5.75 19 5.75H15C14.0335 5.75 13.25 6.53352 13.25 7.5V11C13.25 11.9665 14.0335 12.75 15 12.75H19.2125Z"
        fill="#ff922b"
        stroke="#000000"
      ></path>
    </svg>
  );
};
