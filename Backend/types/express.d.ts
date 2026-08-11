import type { IUser } from "../models/users.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
