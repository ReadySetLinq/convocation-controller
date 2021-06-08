export interface OnlineButtonsDisplayData {
	extraOffline: () => void;
	extraOnline: () => void;
	studentOffline: () => void;
	studentOnline: (index: number) => void;
}
