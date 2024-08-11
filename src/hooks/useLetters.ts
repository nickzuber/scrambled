import React, { useCallback, useEffect, useState } from "react";
import createPersistedState from "use-persisted-state";
import { PersistedStates } from "../constants/state";
import { Letter, shuffle } from "../utils/game";
import { getTodaysLetters } from "../utils/generator";
import { SolutionBoard } from "../utils/words-helper";

const usePersistedLetters = createPersistedState(PersistedStates.Letters);
const [todaysBoard, todaysLetters] = getTodaysLetters();

type LettersOptions = {
  solutionBoard: SolutionBoard;
  letters: Letter[];
  shuffleLetters: () => void;
  positionOfShuffle: number;
};

export const useLetters = (): LettersOptions => {
  const [positionOfShuffle, setPositionOfShuffle] = useState(0);
  const [letters, setLetters] = usePersistedLetters(todaysLetters) as [
    Letter[],
    React.Dispatch<Letter[]>,
  ];

  const shuffleLetters = useCallback(() => {
    setLetters(shuffle(letters));
    setPositionOfShuffle((prevSeed) => prevSeed + 1);
  }, [letters]); // eslint-disable-line react-hooks/exhaustive-deps

  // This shuffles the letters when the page loads which is nice,
  // but more importantly it sets the letters into our persisted state.
  // This makes sure the board is synced up with
  useEffect(() => {
    shuffleLetters();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    solutionBoard: todaysBoard,
    letters,
    shuffleLetters,
    positionOfShuffle,
  };
};
