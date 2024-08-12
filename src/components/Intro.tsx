import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useContext, useMemo, useState } from "react";
import { AppTheme } from "../constants/themes";
import { GameContext } from "../contexts/game";
import { PageContext } from "../contexts/page";
import { Page } from "../hooks/usePage";

const FADE_OUT_TIMING_MS = 150;

export interface IntroProps {
  loading: boolean;
}

export function Intro({ loading }: IntroProps) {
  const theme = useTheme() as AppTheme;
  const [startTransitionOut, setStartTransitionOut] = useState(false);
  const { hasStartedGame } = useContext(GameContext);
  const { setPage } = useContext(PageContext);

  const dateMessage = useMemo(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return today.toLocaleDateString(undefined, options);
  }, []);

  function handlePlayClick() {
    setStartTransitionOut(true);
    setTimeout(() => setPage(Page.Game), FADE_OUT_TIMING_MS);
  }

  if (loading) {
    return <Container theme={theme} fadeOut={startTransitionOut}></Container>;
  }

  return (
    <Container theme={theme} fadeOut={startTransitionOut}>
      <div>
        <Logo className="slideUp">
          <span>{"🍳"}</span>
        </Logo>
        {/* <Logo className="slideUp">
          <svg
            width="112"
            height="100"
            viewBox="0 0 100 112"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: "scale(0.8)",
              marginBottom: -12,
              marginTop: -12,
            }}
          >
            <circle cx="39.5" cy="62.5" r="35.5" fill="#100F0D" />
            <path
              d="M43.3416 48.127C43.3416 48.127 46.3788 46.3779 50.8781 46.3779C55.3773 46.3779 58.5699 52.3249 58.5699 52.3249C58.5699 52.3249 60.3003 58.6217 59.9542 62.4698C59.6081 66.3178 56.4933 72.2648 56.4933 72.2648C56.4933 72.2648 54.7628 77.1623 53.7245 78.5616C52.6863 79.9609 47.8409 82.4097 47.8409 82.4097C47.8409 82.4097 44.38 83.4591 40.2269 82.7595C36.0737 82.0599 32.2667 79.9609 32.2667 79.9609C32.2667 79.9609 28.1136 76.4627 24.9987 75.0634C21.8839 73.6641 18.769 62.8196 18.769 62.8196C18.769 62.8196 17.0386 57.9221 18.7691 53.7242C20.4996 49.5263 23.2681 47.4281 23.2681 47.4281C23.2681 47.4281 30.3426 42.2398 33.651 44.6288C36.0736 46.3783 35.0353 47.4274 38.1502 48.4769C41.265 49.5263 43.3416 48.127 43.3416 48.127Z"
              fill="white"
            />
            <circle cx="43.5" cy="62.5" r="7.5" fill="#FCC419" />
            <rect
              x="106.295"
              y="18.7246"
              width="10.6632"
              height="41.91"
              rx="4"
              transform="rotate(60 106.295 18.7246)"
              fill="#100F0D"
            />
            <rect
              x="84.1299"
              y="34.0283"
              width="5.85847"
              height="21.6246"
              rx="2.92924"
              transform="rotate(60 84.1299 34.0283)"
              fill="#100F0D"
            />
          </svg>
        </Logo> */}
        <Title className="slideUp">Scrambled</Title>
        {hasStartedGame ? (
          <Byline className="slideUp">Continue playing?</Byline>
        ) : (
          <Byline className="slideUp">
            How many words can you
            <br /> cook up on our grid–dle?
          </Byline>
        )}
        <Button className="slideUp" theme={theme} onClick={handlePlayClick}>
          Play
        </Button>
        <DateMessage className="slideUp">{dateMessage}</DateMessage>
        <AuthorMessage className="slideUp">Created by Nick Zuber</AuthorMessage>
      </div>
    </Container>
  );
}

const Container = styled.div<{ theme: AppTheme; fadeOut: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  transition: background ${FADE_OUT_TIMING_MS}ms linear;
  background: ${(p) => (p.fadeOut ? p.theme.colors.primary : p.theme.colors.app)};

  padding-top: 20vh;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    transition: opacity ${FADE_OUT_TIMING_MS}ms linear;
    opacity: ${(p) => (p.fadeOut ? 0 : 1)};
  }
`;

const Logo = styled.div`
  animation-delay: 0ms;

  & > span {
    display: block;

    margin-top: -12px;
    margin-bottom: 4px;

    font-size: 64px;
    transform: rotate(275deg);
  }
`;

const Title = styled.h1`
  font-family: karnak-condensed;
  font-weight: 700;
  font-size: min(2.25em, 110px);
  line-height: 1.056;
  margin: 0;
  margin-bottom: 12px;

  text-align: center;
  padding-inline: 12px;

  animation-delay: 50ms;
`;

const Byline = styled.p`
  font-family: karnak;
  font-weight: 500;
  font-size: min(1.55em, 60px);
  line-height: 1.167;
  margin: 0;
  margin-bottom: 24px;

  text-align: center;
  padding-inline: 24px;

  animation-delay: 100ms;
`;

const DateMessage = styled.span`
  display: block;

  font-size: 1em;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: 0.005em;

  text-align: center;
  padding-inline: 24px;

  animation-delay: 200ms;
`;

const AuthorMessage = styled.span`
  display: block;

  font-size: 0.875em;
  line-height: 1.286;
  font-weight: 500;
  letter-spacing: 0.01em;

  text-align: center;
  padding-inline: 24px;

  animation-delay: 250ms;
`;

const Button = styled.button<{ theme: AppTheme }>`
  animation-delay: 150ms;
  user-select: none;

  margin: 0 0 28px;
  width: 160px;
  padding: 14px 12px;
  text-transform: none;
  white-space: nowrap;

  font-size: 16px;
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

  @media (max-width: 320px) {
    width: 75%;
  }
`;
