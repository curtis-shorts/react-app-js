import React, { useEffect } from 'react';
import { authorization, transfer, errors } from "@globus/sdk";

import { useOAuthContext } from './components/globus-api/GlobusOAuthProvider';

const GlobusApp = ({ collection }) => {
  const context = useOAuthContext()
  const manager = context.authorization;
  
  useEffect(() => {
    if (!manager) {
        // If manager is not yet available, do nothing
        return;
    }
    
    const COLLECTION = collection;
    // Create a manager
    /*const manager = authorization.create({
      client: client,
      redirect: redirect,
      scopes: scopes,
      useRefreshTokens: true,
    });*/

    manager.handleCodeRedirect()

    const UI = {
      SIGN_IN: document.getElementById('sign-in'),
      SIGN_OUT: document.getElementById('sign-out'),
      USER_INFO: document.getElementById('user-information'),
      LS_RESPONSE: document.getElementById('ls-response'),
      TRANSFER_TASK: document.getElementById('transfer-task'),
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
      UI.TRANSFER_TASK.innerText = '';
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
      transfer.task
        .getAll(/*"1fd409a4-28e5-11ef-87cc-f5d0174cd943",*/ {
          headers: {
            Authorization: `Bearer ${manager.tokens.transfer.access_token}`,
          },
        })
        .then((response) => response.json())
        .then((json) => {
          UI.TRANSFER_TASK.innerText = JSON.stringify(json, null, 2);
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
  }, [manager]);

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

//<pre id="transfer-task"></pre>

export default GlobusApp;