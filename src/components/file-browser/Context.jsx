/*import { createContext } from "react";
import { Dispatcher, initialState } from "./reducer";

export const FileBrowserContext = createContext(initialState);
export const FileBrowserDispatchContext = createContext<Dispatcher>(() => {});*/

import { createContext } from "react";
import { initialState } from "./reducer";

export const FileBrowserContext = createContext(initialState);
export const FileBrowserDispatchContext = createContext(() => {});
