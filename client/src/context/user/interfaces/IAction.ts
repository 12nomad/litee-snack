import { UserActionTypes } from "../enums/user.action";

export interface IAction {
  type: `${UserActionTypes}`;
  payload?: object | object[];
}
