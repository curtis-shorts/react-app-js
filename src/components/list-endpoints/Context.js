import { createContext } from "react";
import { initialState } from "./reducer";

export const TransferSettingsContext = createContext(initialState);
export const TransferSettingsDispatchContext = createContext(
  () => {},
);
