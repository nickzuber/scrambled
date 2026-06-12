export type ModalsOptions = {
  openInstructions: () => void;
  openStats: () => void;
  openSettings: () => void;
  isInstructionsOpen: boolean;
  isStatsOpen: boolean;
  isSettingsOpen: boolean;
  isAnyModalOpen: boolean;
  closeModal: () => void;
};

/**
 * @deprecated Use the `<BottomDrawer />` pattern instead.
 */
export const useModals = (): ModalsOptions => {
  return {
    openInstructions: () => {},
    openStats: () => {},
    openSettings: () => {},
    isInstructionsOpen: false,
    isStatsOpen: false,
    isSettingsOpen: false,
    isAnyModalOpen: false,
    closeModal: () => {},
  };
};
