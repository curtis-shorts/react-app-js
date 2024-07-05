import React from 'react'
import ReactDOM from 'react-dom/client'

// Provides the OAuth context
import GlobusOAuthProvider from './components/globus-api/GlobusOAuthProvider.jsx';
import GlobusSessionManager from './components/list-endpoints/GlobusSessionManager.jsx';
// Runs an example from Globus (converted to JS) retrieved from:
//    https://github.com/globus/globus-sdk-javascript/blob/main/examples/basic/index.html
import GlobusApp from './MyGlobusApp.jsx';
// Runs the static data portal transfer UI example retrieved from:
//    https://github.com/globus/static-data-portal
import ListEndpoints from './components/list-endpoints/ListEndpoints.jsx';
import GlobusTransferProvider from './components/globus-api/GlobusTransferProvider.jsx';

// Set the default values
const redirect = window.location.origin + window.location.pathname
//console.log("Redirect path:",redirect)
// Client is the UUID of the Thick Client the app is registered to with Globus
const client = 'be49bc0c-8a25-412b-9ceb-f550beab6137'
// Scope of the Globus API that the client is requesting to access
const scopes = 'urn:globus:auth:scope:transfer.api.globus.org:all'
// The collection that'll get ls'd in the demo
const collection = '278b9bfe-24da-11e9-9fa2-0a06afd4a22e'
/*
Local: 'e1362c76-1715-11ef-834d-57b5c7e2fa2b'
Beluga: '278b9bfe-24da-11e9-9fa2-0a06afd4a22e'
Narval: 'a1713da6-098f-40e6-b3aa-034efe8b6e5b'
Graham: '07baf15f-d7fd-4b6a-bf8a-5b5ef2e229d3'
*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <GlobusOAuthProvider
    redirect={redirect}
    client={client}
    scopes={scopes}
  >
    <React.StrictMode>
      <h1>Globus Example 1:</h1>
      <GlobusSessionManager />
      <GlobusTransferProvider>
        <ListEndpoints
          transferCollection={collection}
          transferPath='/home/cushorts/scratch/globus_transfer_test_data'
        />
      </GlobusTransferProvider>
    </React.StrictMode>
  </GlobusOAuthProvider>
)

//<GlobusApp collection={collection}//
