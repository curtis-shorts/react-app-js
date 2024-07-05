import React, { useReducer, createContext, useContext } from "react";

/* Component:
 *    GlobusTransferProvider
 * Description:
 *    Provides a context to manage the Globus transfer settings
 * Usage:
 *    <GlobusTransferProvider>
 *      const transferSettings = useTransferContext()
 *      const transferDispatch = useTransferDispatchContext()
 *      * Set up transfer, example:
 *          transferDispatch({ type: "SET_ENDPOINT_ONE", payload: endpointUuidOne });
 *          transferDispatch({ type: "SET_FILE_PATH_ONE", payload: directoryOne });
 *          transferDispatch({ type: "SET_ENDPOINT_TWO", payload: endpointUuidTwo });
 *          transferDispatch({ type: "SET_FILE_PATH_TWO", payload: directoryTwo });
 *          transferDispatch({ type: "ADD_ITEM", payload: item });
 *          transferDispatch({ type: "REMOVE_ITEM", payload: item });
 *          transferDispatch({ type: "RESET_ITEMS" });
 *      submitGlobusTransfer(..., transferSettings, ...);
 *    </GlobusTransferProvider>
*/

const TransferContext = createContext(undefined);

export function useTransferContext(){
  return useContext(TransferContext);
}

const TransferDispatchContext = createContext(undefined);

export function useTransferDispatchContext(){
  return useContext(TransferDispatchContext);
}

class DefaultTransferState {
    constructor() {
        this.endpoint_one = null;
        this.file_path_one = null;
        this.endpoint_two = null;
        this.file_path_two = null;
        this.items = [];
    }
}

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

const GlobusTransferProvider = ({children}) => {
    const initialState = DefaultTransferState;

    const [transferSettings, transferDispatch] = useReducer(transferSettingsReducer, initialState);

    // Make the context a provider of the authorization manager and run the children inside of it
    return (
      <TransferContext.Provider value={transferSettings}>
        <TransferDispatchContext.Provider value={transferDispatch}>
            {children}
        </TransferDispatchContext.Provider>
      </TransferContext.Provider>
    );
};

export default GlobusTransferProvider;
