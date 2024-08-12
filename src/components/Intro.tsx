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
        <Title id="intro-title" className="slideUp">
          Scrambled
        </Title>
        <Divider className="slideUpAndWidenOut" theme={theme} />
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
  background: ${(p) => p.theme.colors.text};
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
