import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useMemo } from "react";
import {
  createAnimatedCursorTile,
  createAnimatedTile,
  createSuccessReveal,
} from "../../constants/animations";
import { AppTheme } from "../../constants/themes";
import { Modal } from "./Modal";

const BaseDelay = 500;
const TypingDelay = 250;

export const InstructionsModal: FC = () => {
  return (
    <Modal>
      <InstructionsModalImpl />
    </Modal>
  );
};

export function InstructionsModalImpl() {
  const theme = useTheme() as AppTheme;

  const timezoneAbrev = useMemo(() => {
    const tz = new Date().toLocaleTimeString("en-us", { timeZoneName: "short" }).split(" ");
    if (tz[2]) {
      return `${tz[2]}.`;
    }

    return "";
  }, []);

  return (
    <>
      <Paragraph>
        Create words on the board by connecting all of the letters provided.
      </Paragraph>
      <Paragraph>
        Each word must be a real English word. Words must be connected to each other, like a
        crossword.
      </Paragraph>

      <MiniBoardDemo />

      <MiniTitle>Submitting your solution</MiniTitle>

      <List>
        <ListItem>When you've placed all of today's letters, submit your puzzle!</ListItem>
        <ListItem>
          If all of your words are connected and valid, you win! Otherwise, we'll let you know
          which words need to be fixed.
        </ListItem>
        <ListItem>You can attempt to submit as many times as you'd like.</ListItem>
      </List>

      <MiniTitle>Tips and tricks</MiniTitle>

      <List>
        <ListItem>
          You can place letters anywhere on the entire board by tapping any tile you'd like.
        </ListItem>

        <ListItem>
          You can control if your next letter will appear left-to-right or top-to-bottom by
          pressing the <DemoActionButton theme={theme}>Pivot cursor</DemoActionButton> button
          or by pressing the highlighted yellow square.
        </ListItem>

        <ListItem>
          Move all the letters around the board to make space for new words by pressing the{" "}
          <DemoActionButton theme={theme}>Move letters</DemoActionButton> button or using your
          finger to drag the board around.
        </ListItem>
      </List>

      <Paragraph>New puzzles are released daily at 12 a.m. {timezoneAbrev}</Paragraph>
      <Paragraph>
        Think a word is wrong or missing? Email me at{" "}
        <EmailLink theme={theme} href="mailto:zuber.nicholas@gmail.com">
          zuber.nicholas@gmail.com
        </EmailLink>
        .
      </Paragraph>
      <Paragraph>
        Have feedback? Email me at{" "}
        <EmailLink theme={theme} href="mailto:zuber.nicholas@gmail.com">
          zuber.nicholas@gmail.com
        </EmailLink>
        .
      </Paragraph>
      <Paragraph>
        It will <b>always</b> be possible to use all 20 letters.
      </Paragraph>
      <Paragraph>Have fun!</Paragraph>
      <br />
    </>
  );
}

const EmailLink = styled.a<{ theme: AppTheme }>`
  color: ${(p) => p.theme.colors.linkText};
  text-decoration: none;
`;

const MiniTitle = styled.h2`
  font-family: franklin;

  font-size: 1.125em;
  font-weight: 700;
  line-height: 1em;
  margin: 24px 0 12px;
  max-width: 100%;
`;

const DemoActionButton = styled.span<{ theme: AppTheme }>`
  margin: 0;

  font-size: 12px;
  line-height: 18px;

  width: fit-content;
  padding: 0 8px;
  text-transform: none;
  white-space: nowrap;

  font-weight: 600;
  display: inline-flex;
  width: fit-content;
  text-align: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  cursor: pointer;
  border: 1px solid ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.primary};
`;

const MiniBoardDemo = () => {
  const theme = useTheme() as AppTheme;

  return (
    <MiniBoardContainer>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContentsAnimatedEmpty firstTile order={1} theme={theme} />
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
          <MiniTileContentsAnimated position={100 + 200} order={9} theme={theme}>
            D
          </MiniTileContentsAnimated>
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
          <MiniTileContentsAnimated position={200 + 100} order={2} theme={theme}>
            G
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={200 + 200} order={3} theme={theme}>
            R
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={200 + 300} order={4} theme={theme}>
            O
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={200 + 400} order={5} theme={theme}>
            O
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={200 + 500} order={6} theme={theme}>
            V
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={200 + 600} order={7} theme={theme}>
            Y
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
      </MiniRow>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContentsAnimatedEmpty order={8} theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={300 + 100} order={10} theme={theme}>
            I
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={300 + 400} order={13} theme={theme}>
            I
          </MiniTileContentsAnimated>
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
          <MiniTileContentsAnimated position={400 + 200} order={11} theme={theme}>
            P
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={400 + 300} order={16} theme={theme}>
            R
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={400 + 400} order={17} theme={theme}>
            O
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={400 + 500} order={14} theme={theme}>
            B
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={400 + 600} order={18} theme={theme}>
            E
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
      </MiniRow>
      <MiniRow>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimatedEmpty order={12} theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContentsAnimated position={600 + 500} order={15} theme={theme}>
            E
          </MiniTileContentsAnimated>
        </MiniTileWrapper>
        <MiniTileWrapper>
          <MiniTileContents theme={theme} />
        </MiniTileWrapper>
      </MiniRow>
    </MiniBoardContainer>
  );
};

const MiniBoardContainer = styled.div`
  position: relative;
  margin: 24px auto;
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
  min-height: 30px;
  min-width: 30px;
  max-height: 30px;
  max-width: 30px;
  height: 100%;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const MiniTileContents = styled.div<{ theme: AppTheme }>`
  background: ${(p) => p.theme.colors.primary};
  border: 2px solid ${(p) => p.theme.colors.tileSecondary};
  transition: border 50ms ease-in, background 50ms ease-in;
  color: ${(p) => p.theme.colors.text};
  min-height: 26px;
  min-width: 26px;
  max-height: 26px;
  max-width: 26px;
  height: calc(100% - 10px);
  width: calc(100% - 10px);
  opacity: 1;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-transform: uppercase;
`;

const MiniTileContentsAnimated = styled(MiniTileContents)<{
  firstTile?: boolean;
  order: number;
  position: number;
  theme: AppTheme;
}>`
  color: transparent;
  animation: ${(p) =>
        createAnimatedCursorTile(p.theme.colors.primary, p.theme.colors.tileSecondary)}
      ${TypingDelay}ms ease-in
      ${(p) =>
        p.firstTile ? 0 : TypingDelay * p.order ? BaseDelay + TypingDelay * p.order : 0}ms,
    ${(p) =>
        createAnimatedTile(
          p.theme.colors.primary,
          p.theme.colors.primary,
          p.theme.colors.text,
          p.theme.colors.tileSecondary,
        )}
      500ms ease-in
      ${(p) => (TypingDelay * p.order ? TypingDelay + BaseDelay + TypingDelay * p.order : 0)}ms,
    ${(p) =>
        createSuccessReveal(
          p.theme.colors.primary,
          p.theme.colors.tileSecondary,
          p.theme.colors.primary,
        )}
      500ms ease-in ${(p) => 500 + BaseDelay + TypingDelay * 18 + p.position}ms;
  animation-fill-mode: forwards;
`;

const MiniTileContentsAnimatedEmpty = styled(MiniTileContents)<{
  firstTile?: boolean;
  order: number;
  theme: AppTheme;
}>`
  animation: ${(p) =>
      createAnimatedCursorTile(p.theme.colors.primary, p.theme.colors.tileSecondary)}
    ${(p) => (p.firstTile ? TypingDelay + 800 : TypingDelay)}ms ease-in
    ${(p) =>
      p.firstTile ? 0 : TypingDelay * p.order ? BaseDelay + TypingDelay * p.order : 0}ms;
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
  margin: 0;
  margin-bottom: 12px;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  text-align: left;
`;

const List = styled.ul`
  list-style: outside;
  margin-inline: 18px;
  margin-top: 16px;
  margin-bottom: 24px;
  padding: 0px;
`;

const ListItem = styled.li`
  margin: 0;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  text-align: left;
`;

const Divider = styled.div<{ theme: AppTheme }>`
  background: ${(p) => p.theme.colors.text};
  width: 100%;
  height: 1px;
  margin: 14px auto 16px;
`;
