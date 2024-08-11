import { useState } from "react";

export enum Page {
  Intro = "intro",
  Game = "game",
}

export interface PageProps {
  page: Page;
  setPage: (page: Page) => void;
}

export function usePage(): PageProps {
  // Intentionally not storing in browser because refreshes should present the
  // intro screen, just like other games (assertion as of 8/10/24).
  const [page, setPage] = useState(Page.Intro);

  return {
    page,
    setPage,
  };
}
