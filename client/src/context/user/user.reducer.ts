import type { IAction } from "./interfaces/IAction";
import type { IUser } from "./interfaces/IUser";

export const initialState = {
  username: "",
};

export const userReducer = (state: IUser, action: IAction) => {
  switch (action.type) {
    default:
      return state;
  }
};
