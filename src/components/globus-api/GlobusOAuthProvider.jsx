import React, { useState, useReducer, useEffect, useContext } from "react";
import { createContext } from "react";
import { authorization } from "@globus/sdk/cjs";

/* Component:
 *    GlobusOAuthProvider
 * Description:
 *    Provides a Globus authorization context which can be used for making requests
 * Inputs:
 *    redirect
 *    client
 *    scopes
 * Usage:
 *    <GlobusOAuthProvider
 *      redirect={redirect}
 *      client={client}
 *      scopes={scopes}
 *    >
 *      const authManager = useOAuthContext();
 *      manager.login()
 *      manager.revoke()
 *    </GlobusOAuthProvider>
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.Authorization.create.html
 *    https://globus.github.io/globus-sdk-javascript/classes/lib_core_authorization_AuthorizationManager.AuthorizationManager.html
*/

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

const OAuthContext = createContext(undefined);

export function useOAuthContext(){
  return useContext(OAuthContext);
}

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
