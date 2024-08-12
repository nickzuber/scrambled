import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, useContext } from "react";
import { AppTheme } from "../constants/themes";
import { ModalsContext } from "../contexts/modals";
import { PageContext } from "../contexts/page";
import { Page } from "../hooks/usePage";
import { BottomDrawer } from "./BottomDrawer";
import { InstructionsModalImpl } from "./Modal/InstructionsModal";

export const Header: FC = () => {
  const theme = useTheme() as AppTheme;
  const { setPage } = useContext(PageContext);
  const { openInstructions, openStats, openSettings } = useContext(ModalsContext);

  return (
    <Container theme={theme}>
      <ButtonContainer style={{ marginLeft: 8 }}>
        {/* Back */}
        <BackButton theme={theme} onClick={() => setPage(Page.Intro)}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: "scale(2.25)" }}
          >
            <path
              d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </BackButton>
      </ButtonContainer>

      <ButtonContainer>
        {/* Help */}
        <BottomDrawer renderContents={() => <InstructionsModalImpl />}>
          <Button theme={theme}>Help</Button>
        </BottomDrawer>
        {/* Stats */}
        <Button theme={theme} onClick={openStats}>
          Stats
        </Button>
        {/* Settings */}
        <Button theme={theme} onClick={openSettings}>
          Settings
        </Button>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div<{ theme: AppTheme }>`
  position: relative;
  border-bottom: 1px solid ${(p) => p.theme.colors.tileSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 50px;
  z-index: 2;
  padding-inline: 12px;
`;

const ButtonContainer = styled.div`
  height: 100%;
  width: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button<{ theme: AppTheme }>`
  border: 0;
  background: none;
  width: fit-content;
  padding: 6px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme.colors.text};
  cursor: pointer;
  transition: all 50ms ease-in;

  font-size: 1.125em;
  line-height: 45px;
  display: inline-block;
  padding: 6px 13px 4px;

  &:active {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const BackButton = styled(Button)`
  transform: scale(0.95);

  &:active {
    cursor: pointer;
    opacity: 0.5;
    background-color: transparent;
  }
`;

const Title = styled.h1<{ theme: AppTheme }>`
  margin: 0;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  text-align: center;
  color: ${(p) => p.theme.colors.text} @media (max-width: 430px) {
    font-size: 24px;
  }

  @media (max-width: 380px) {
    font-size: 20px;
  }
`;
