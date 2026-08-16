export interface FeelingSubmission {
  id?: string;
  userId: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
  type: 'feeling';
}

export interface LetterSubmission {
  id?: string;
  userId: string;
  title?: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
  type: 'letter';
}
