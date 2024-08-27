export enum ThemeType {
  Light = "light",
  Dark = "dark",
}

export type AppTheme = {
  type: ThemeType;
  colors: {
    app: string;
    appAlt: string;
    primary: string;
    text: string;
    invertedText: string;
    letterBackground: string;
    tileSecondary: string;
    highlight: string;
    buttonActive: string;
    highlightBorder: string;
    introText: string;
    iconBorder: string;

    linkText: string;
    introButtonText: string;
    introButtonBackground: string;
  };
  accents: {
    dropShadow: string;
    transparentBackground: string;
    saturatedTransparentBackground: string;
  };
};

const LightTheme: AppTheme = {
  type: ThemeType.Light,
  colors: {
    app: "#f9c929",
    appAlt: "#fdefc3",
    primary: "#ffffff",
    text: "#1a1a1b",
    invertedText: "#ffffff",
    tileSecondary: "#d3d6da",
    letterBackground: "#e6e6e6",
    highlight: "#f0f0f0",
    highlightBorder: "#2e2f2f",
    buttonActive: "#c0c4ca",
    introText: "#1a1a1b",
    iconBorder: "#1a1a1b",

    linkText: "#228be6",
    introButtonText: "#ffffff",
    introButtonBackground: "#1a1a1b",
  },
  accents: {
    dropShadow: "rgb(99 99 99 / 46%) 0px 2px 8px 2px",
    transparentBackground: "rgba(100, 100, 100, 0.5)",
    saturatedTransparentBackground: "#b1b1b1",
  },
};

const DarkTheme: AppTheme = {
  type: ThemeType.Dark,
  colors: {
    app: "#f9c929",
    appAlt: "#4c4729",
    primary: "#0E1924",
    text: "#ffffff",
    invertedText: "#1a1a1b",
    tileSecondary: "#4d5a62",
    letterBackground: "#4d5a62",
    highlight: "#102439",
    highlightBorder: "#c4c5c5",
    buttonActive: "#656b6e",
    introText: "#1a1a1b",
    iconBorder: "#1a1a1b",

    linkText: "#4dabf7",
    introButtonText: "#ffffff",
    introButtonBackground: "#1a1a1b",
  },
  accents: {
    dropShadow: "rgb(0 0 0 / 50%) 0px 2px 8px 2px",
    transparentBackground: "rgba(14, 25, 36, 0.5)",
    saturatedTransparentBackground: "#0e1924",
  },
};

export const Themes = {
  Light: LightTheme,
  Dark: DarkTheme,
};
