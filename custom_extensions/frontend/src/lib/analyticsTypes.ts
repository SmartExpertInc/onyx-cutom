export interface SignUpEvent {
  Country: string;
  Device: string;
  Browser: string;
}
  
export interface PageLeftEvent {
  "Time Spent (sec)": number;
}
  
export interface FeatureUsedEvent {
  "Feature Name": string;
  "Feature Category": string;
  Action: string;
}
  