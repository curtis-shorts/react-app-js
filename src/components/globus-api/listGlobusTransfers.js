import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    listGlobusTransfers
 * Description:
 *    Globus client-stub to get a list of all transfers
 * Inputs:
 *    authManager - Globus OAuth manager
 *    numberOfEvents - the number of transfers to return
 *    eventsOffset - the number of transfers to skip before returning numberOfEvents
 * Outputs:
 *    response - the https response from globus for the get request
 *    data - a json containing the metadata for each of the transfers
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.task.getAll.html
*/
export async function listGlobusTransfers(authManager, numberOfTransfers, transfersOffset){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.task.getAll({
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
    },
    query: {
      limit: numberOfTransfers,
      offset: transfersOffset
    },
  });

  const data = await response.json();
  return [response, data];
}
