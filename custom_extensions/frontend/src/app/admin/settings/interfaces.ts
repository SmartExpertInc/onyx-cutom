export interface Notification {
  id: number;
  notif_type: string;
  time_created: string;
  dismissed: boolean;
  additional_data?: {
    persona_id?: number;
    [key: string]: any;
  };
}

export interface NavigationItem {
  link: string;
  icon?: string;
  svg_logo?: string;
  title: string;
} 