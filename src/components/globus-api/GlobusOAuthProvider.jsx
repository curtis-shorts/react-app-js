import React, { useState, useReducer, useEffect, useContext } from "react";
import { createContext } from "react";
import { authorization } from "@globus/sdk/cjs";

class DefaultAuthState {
  constructor() {
    this.isAuthenticated = false;
    this.isLoading = false;
    this.error = undefined;
    this.authorization = undefined;
    this.events = undefined;
  }
}

const OAuthReducer = (state, action) => {
  // state: Globus authentication class
  // action = { type: "AUTHENTICATED"; payload: boolean } | { type: "REVOKE" }
  const AUTHENTICATED = "AUTHENTICATED";
  const REVOKE = "REVOKE";
  switch (action.type) {
    case AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case REVOKE:
      return {
        ...state,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

// Create the OAuthContext
const OAuthContext = createContext(undefined);

// Call this function if you need to use variables from the context
export function useOAuthContext(){
  return useContext(OAuthContext);
}

// Provide the calling scope with an authorization manager
// Children is what is run inside of the authorization manager context
const GlobusOAuthProvider = ({
  redirect,
  scopes,
  client,
  children,
}) => {
  const initialState = DefaultAuthState;

  const [state, dispatch] = useReducer(OAuthReducer, initialState);
  const [instance, setInstance] = useState(undefined);

  useEffect(() => {
    const manager = authorization.create({
      redirect,
      scopes,
      client,
      useRefreshTokens: true,
    });
    setInstance(manager);
  }, [redirect, scopes, client]);

  useEffect(() => {
    if (!instance) return;

    const handleRevoke = () => {
      dispatch({ type: "REVOKE" });
    };

    instance.events.revoke.addListener(handleRevoke);

    const handleAuthenticated = ({ isAuthenticated }) => {
      dispatch({ type: "AUTHENTICATED", payload: isAuthenticated });
    };
    instance.events.authenticated.addListener(handleAuthenticated);

    return () => {
      instance.events.revoke.removeListener(handleRevoke);
      instance.events.authenticated.removeListener(handleAuthenticated);
    };
  }, [instance]);

  // Make the context a provider of the authorization manager and run the children inside of it
  return (
    <OAuthContext.Provider
      value={{
        ...state,
        authorization: instance,
        events: instance?.events,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};

export default GlobusOAuthProvider;
