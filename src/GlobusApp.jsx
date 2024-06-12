import React, { useEffect } from 'react';
import { authorization, transfer, errors } from "@globus/sdk";
import { useContext } from 'react';
import OAuthContext from './components/globus-auth-context/GlobusOAuthProvider'

// NOTE: There's an issue where if you try to log back in from the same tab then it reuses the same code_<verifier|challenge>
//    Seems to be resolved by wrapping with the GlobusOAuthProvider, but could come up again so be warry (may be a context thing?)
const GlobusApp = () => {
  useEffect(() => {
    const COLLECTION = 'e1362c76-1715-11ef-834d-57b5c7e2fa2b';

    // Create a manager
    const manager = authorization.create({
      client: 'be49bc0c-8a25-412b-9ceb-f550beab6137',
      redirect: window.location.origin + window.location.pathname,
      scopes: 'urn:globus:auth:scope:transfer.api.globus.org:all',
      useRefreshTokens: true,
    });

    manager.handleCodeRedirect()

    const UI = {
      SIGN_IN: document.getElementById('sign-in'),
      SIGN_OUT: document.getElementById('sign-out'),
      USER_INFO: document.getElementById('user-information'),
      LS_RESPONSE: document.getElementById('ls-response'),
    };

    UI.SIGN_IN.addEventListener('click', () => {
      manager.login();
    });

    UI.SIGN_OUT.addEventListener('click', () => {
      manager.revoke();
      UI.USER_INFO.innerText = '';
      UI.SIGN_IN.style.display = 'block';
      UI.SIGN_OUT.style.display = 'none';
      UI.LS_RESPONSE.innerText = '';
    });

    if (manager.authenticated) {
      UI.USER_INFO.innerText = JSON.stringify(manager.user, null, 2);
      UI.SIGN_OUT.style.display = 'block';
      transfer.fileOperations
        .ls(COLLECTION, {
          headers: {
            Authorization: `Bearer ${manager.tokens.transfer.access_token}`,
          },
        })
        .then((response) => response.json())
        .then((json) => {
          UI.LS_RESPONSE.innerText = JSON.stringify(json, null, 2);
          const isError = errors.isErrorWellFormed(json);
          if (isError) {
            const handler = manager.handleErrorResponse(json, false);
            const btn = document.createElement('button');
            btn.innerText = 'Handle';
            btn.onclick = handler;
            document.body.appendChild(btn);
          }
        });
    } else {
      UI.SIGN_IN.style.display = 'block';
    }
  }, []);

  return (
    <div>
      <button id="sign-in" style={{ display: 'none' }}>Sign In</button>
      <button id="sign-out" style={{ display: 'none' }}>Sign Out</button>
      <code>
        <pre id="user-information"></pre>
        <pre id="ls-response"></pre>
      </code>
    </div>
  );
};

export default GlobusApp;
