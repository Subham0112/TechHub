export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  profilePic: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
