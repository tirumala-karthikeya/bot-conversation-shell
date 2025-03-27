
export interface Chatbot {
  id: string;
  name: string;
  avatarColor: string;
  avatarInitial?: string;
  description?: string;
  uniqueUrl: string;
  gradient?: {
    from: string;
    to: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
