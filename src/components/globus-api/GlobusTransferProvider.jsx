import React, { useReducer, createContext, useContext, useState } from "react";

/*
 * The reason we're making the dispatcher seperate is because the context re-renders when it's called
 * Can read from the transfer context this way without re-rendering
*/

// Create the TransferContext
const TransferContext = createContext(undefined);

// Call this function if you need to use variables from the context
export function useTransferContext(){
  return useContext(TransferContext);
}

// Create the TransferDispatchContext
const TransferDispatchContext = createContext(undefined);

// Call this function if you need to use variables from the context
export function useTransferDispatchContext(){
  return useContext(TransferDispatchContext);
}

// Bidirectional transfer naming convention
class DefaultTransferState {
    constructor() {
        this.endpoint_one = null;
        this.file_path_one = null;
        this.endpoint_two = null;
        this.file_path_two = null;
        this.items = [];
    }
}

// Action reducer to set endpoints
export const transferSettingsReducer = (state, action) => {
    switch (action.type) {
      case "SET_ENDPOINT_ONE": {
        return { ...state, endpoint_one: action.payload };
      }
      case "SET_FILE_PATH_ONE": {
        return { ...state, file_path_one: action.payload };
      }
      case "SET_ENDPOINT_TWO": {
        return { ...state, endpoint_two: action.payload };
      }
      case "SET_FILE_PATH_TWO": {
        return { ...state, file_path_two: action.payload };
      }
      case "RESET_ITEMS": {
        return { ...state, items: [] };
      }
      case "ADD_ITEM": {
        return { ...state, items: [...state.items, action.payload] };
      }
      case "REMOVE_ITEM": {
        return {
          ...state,
          items: state.items.filter((item) => item !== action.payload),
        };
      }
      default: {
        throw new Error("Unknown action: " + action.type);
      }
    }
};

// Provide the calling scope with a transfer manager
const GlobusTransferProvider = ({children}) => {
    const initialState = DefaultTransferState;

    const [transferSettings, dispatch] = useReducer(transferSettingsReducer, initialState);

    // Make the context a provider of the authorization manager and run the children inside of it
    return (
      <TransferContext.Provider value={transferSettings}>
        <TransferDispatchContext.Provider value={dispatch}>
            {children}
        </TransferDispatchContext.Provider>
      </TransferContext.Provider>
    );
};

export default GlobusTransferProvider;
