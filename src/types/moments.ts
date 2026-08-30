export interface Moment {
  id: string;
  order: number;
  title: string;
  date: string;
  location?: string;
  image?: string;
  shortDescription: string;
  story: string;
  featured?: boolean;
  momentStrength?: string;
}
