import styled from "@emotion/styled";
import { FC } from "react";
import { Board } from "./Board";

type CanvasProps = {};

export const Canvas: FC<CanvasProps> = () => {
  return (
    <Container id="canvas">
      <Board />
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  min-height: 360px; // 6 tiles * tile size
  // max-height: ${360 + 20}px; // 6 tiles * tile size
  margin: 1% auto;
  overflow: hidden;
  touch-action: none;

  // transform: scale(0.95);

  @media (max-height: 620px), (max-width: 370px) {
    min-height: 315px; // 6 tiles * tile size
    // max-height: ${315 + 20}px; // 6 tiles * tile size
  }

  @media (max-height: 600px) {
    min-height: 290px; // 6 tiles * tile size
    // max-height: ${290 + 20}px; // 6 tiles * tile size
  }
`;
