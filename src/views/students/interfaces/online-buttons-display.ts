export interface OnlineButtonsDisplayData {
  backgroundOffline: () => void;
  backgroundOnline: () => void;
  extraOffline: () => void;
  extraOnline: () => void;
  studentOffline: () => void;
  studentOnline: (index: number) => void;
}
