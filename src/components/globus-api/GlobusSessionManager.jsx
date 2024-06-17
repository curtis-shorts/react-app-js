import React, { useEffect } from 'react';
import { authorization, transfer, errors } from "@globus/sdk";

import { useOAuthContext } from './GlobusOAuthProvider';

const GlobusSessionManager = () => {
  const context = useOAuthContext()
  const manager = context.authorization;
  
  useEffect(() => {
    if (!manager) {
        // If manager is not yet available, do nothing
        return;
    }

    manager.handleCodeRedirect()

    const UI = {
      SIGN_IN: document.getElementById('sign-in'),
      SIGN_OUT: document.getElementById('sign-out'),
      USER_INFO: document.getElementById('user-information'),
    };

    UI.SIGN_IN.addEventListener('click', () => {
      manager.login();
    });

    UI.SIGN_OUT.addEventListener('click', () => {
      manager.revoke();
      UI.USER_INFO.innerText = '';
      UI.SIGN_IN.style.display = 'block';
      UI.SIGN_OUT.style.display = 'none';
    });

    if (manager.authenticated) {
      UI.USER_INFO.innerText = JSON.stringify(manager.user, null, 2);
      UI.SIGN_OUT.style.display = 'block';
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
      </code>
    </div>
  );
};

export default GlobusSessionManager;