export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  preferredCategory?: string;
  preferredSubTeam?: string;
}

export interface LoginRequest {
  email: string;
}
