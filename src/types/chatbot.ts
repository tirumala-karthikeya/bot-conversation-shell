
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
  chatLogoImage?: string;
  iconAvatarImage?: string;
  staticImage?: string;
  bodyBackgroundImage?: string;
  chatHeaderColor?: string;
  welcomeText?: string;
  apiKey?: string;
  analyticsUrl?: string;
}
