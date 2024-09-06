import { useTheme } from "@emotion/react";

import styled from "@emotion/styled";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppTheme } from "../constants/themes";
import { GameContext } from "../contexts/game";
import { PageContext } from "../contexts/page";
import { Page } from "../hooks/usePage";

const FADE_OUT_TIMING_MS = 150;

export function Intro() {
  const theme = useTheme() as AppTheme;
  const [startLoadingTransitionOut, setStartLoadingTransitionOut] =
    useState(false);
  const [startTransitionOut, setStartTransitionOut] = useState(false);
  const { hasStartedGame, isGameOver } = useContext(GameContext);
  const { setPage } = useContext(PageContext);

  // Loading state that completes when our font assets are ready.
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function check() {
      await Promise.all([
        document.fonts.load("normal 300 16px franklin"),
        document.fonts.load("normal 400 16px franklin"),
        document.fonts.load("normal 500 16px franklin"),
        document.fonts.load("normal 600 16px franklin"),
        document.fonts.load("normal 700 16px franklin"),
        document.fonts.load("normal 500 16px karnak"),
        document.fonts.load("normal 700 16px karnak-condensed"),
      ]);

      setStartLoadingTransitionOut(true);
      setTimeout(() => setLoading(false), FADE_OUT_TIMING_MS);
    }

    void check();
  }, []);

  if (loading) {
    return (
      <Container theme={theme} fadeOutLoading={startLoadingTransitionOut}>
        <div className="fadeIn" style={{ paddingTop: "25vh" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="12"
            viewBox="0 0 44 12"
          >
            <circle className="dot dot-1" cx="6" cy="6" r="6" />
            <circle className="dot dot-2" cx="22" cy="6" r="6" />
            <circle className="dot dot-3" cx="38" cy="6" r="6" />
          </svg>
        </div>
      </Container>
    );
  }

  return (
    <Container theme={theme} fadeOut={startTransitionOut}>
      <div>
        <Logo className="slideUp">
          <span>{"🍳"}</span>
        </Logo>
        <Title id="intro-title" className="slideUp">
          Scrambled<NewTag className="popIn">New</NewTag>
        </Title>
        <Divider className="slideUpAndWidenOut" theme={theme} />
        {isGameOver ? (
          <Byline className="slideUp">
            Miss us already?
            <br />
            There'll be a puzzle tomorrow
          </Byline>
        ) : hasStartedGame ? (
          <Byline className="slideUp">Continue playing?</Byline>
        ) : (
          <Byline className="slideUp">
            Which words can you
            <br /> cook up on our grid–dle?
          </Byline>
        )}
        <Button className="slideUp" theme={theme} onClick={handlePlayClick}>
          {isGameOver ? "View your puzzle" : "Play"}
        </Button>
        <DateMessage className="slideUp">{dateMessage}</DateMessage>
        <AuthorMessage className="slideUp">Created by Nick Zuber</AuthorMessage>
        {/* <DisclaimerMessage className="slideUp">New puzzle every day</DisclaimerMessage> */}
      </div>
    </Container>
  );
}

const Container = styled.div<{
  theme: AppTheme;
  fadeOut?: boolean;
  fadeOutLoading?: boolean;
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  transition: background ${FADE_OUT_TIMING_MS}ms linear;
  background: ${(p) =>
    p.fadeOut
      ? p.theme.colors.primary
      : p.fadeOutLoading
      ? p.theme.colors.app
      : p.theme.colors.app};

  color: ${(p) => p.theme.colors.introText} !important;
  padding-top: 20vh;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    transition: opacity ${FADE_OUT_TIMING_MS}ms linear;
    opacity: ${(p) => (p.fadeOut || p.fadeOutLoading ? 0 : 1)};

    & > svg > circle {
      fill: #353105;
    }
  }
`;

const Logo = styled.div`
  animation-delay: 0ms;
  margin-right: -22px;

  & > span {
    display: block;

    margin-top: -12px;
    margin-bottom: 4px;

    font-size: 64px;
    transform: rotate(275deg);
  }
`;

const Title = styled.h1`
  animation-delay: 50ms;

  font-family: karnak-condensed;
  font-weight: 700;
  font-size: min(2.55em, 130px);
  line-height: 1.056;
  margin: 0;
  margin-bottom: 18px;

  text-align: center;
  padding-inline: 12px;
`;

const Divider = styled.div<{ theme: AppTheme }>`
  animation-delay: 100ms, 100ms;

  position: relative;
  background: ${(p) => p.theme.colors.introText};
  height: 4px;
  margin: -18px auto 24px;
  border-radius: 12px;
`;

const Byline = styled.p`
  animation-delay: 150ms;

  font-family: karnak;
  font-weight: 500;
  font-size: min(1.25em, 50px);
  line-height: 1.167;
  margin: 0;
  margin-bottom: 24px;

  text-align: center;
  padding-inline: 24px;
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

  color: ${(p) => p.theme.colors.introButtonText};
  border: 1px solid ${(p) => p.theme.colors.introButtonBackground};
  background: ${(p) => p.theme.colors.introButtonBackground};

  @media (max-width: 320px) {
    width: 75%;
  }
`;

const DateMessage = styled.span`
  animation-delay: 200ms;

  display: block;
  font-size: 1em;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: 0.005em;

  text-align: center;
  padding-inline: 24px;
`;

const AuthorMessage = styled.span`
  animation-delay: 250ms;

  display: block;

  font-size: 0.875em;
  line-height: 1.286;
  font-weight: 500;
  letter-spacing: 0.01em;

  text-align: center;
  padding-inline: 24px;
`;

const BetaTag = styled.span`
  // animation-delay: 250ms; /* must be done within CSS class */

  display: block;
  position: absolute;
  background: #fe0606;

  top: -24px;
  right: -12px;

  font-size: 0.3em;
  line-height: 1em;
  color: #ffffff;
  font-family: franklin, Inter, sans-serif;
  letter-spacing: 0.85px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 18px;
  text-transform: uppercase;
  box-shadow: rgba(50, 50, 93, 0.15) 0px 6px 12px -2px,
    rgba(0, 0, 0, 0.2) 0px 3px 7px -3px;
`;

const NewTag = styled(BetaTag)`
  background: #4263eb;
`;

const DisclaimerMessage = styled.span`
  animation-delay: 300ms;

  display: block;
  font-size: 1em;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: 0.005em;

  text-align: center;
  padding-inline: 24px;

  margin-top: 24px;
`;
