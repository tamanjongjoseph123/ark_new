export interface ApiDevotion {
  id: number;
  title: string;
  content_type: 'text' | 'video';
  description: string;
  text_content: string | null;
  youtube_url: string | null;
  devotion_date: string;
  created_at: string;
  thumbnail_url: string | null;
  }

export function listDevotions(params?: any): Promise<ApiDevotion[]>;
export function getTodayDevotion(): Promise<ApiDevotion | null>;
export function getDevotion(id: number): Promise<ApiDevotion>;

declare const _default: {
  listDevotions: typeof listDevotions;
  getTodayDevotion: typeof getTodayDevotion;
  getDevotion: typeof getDevotion;
};

export default _default;
