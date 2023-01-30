import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";

import { IUser } from "./interfaces/IUser";
import { initialState, userReducer } from "./user.reducer";

const UserContext = createContext<IUser>(initialState);

export const UserProvider = (props: PropsWithChildren): JSX.Element => {
  const [state] = useReducer(userReducer, useContext(UserContext));

  return (
    <UserContext.Provider value={state}>{props.children}</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
