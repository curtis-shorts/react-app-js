import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    getGlobusEndpointMetadata
 * Description:
 *    Globus client-stub to get the metadata for a collection/endpoint
 * Inputs:
 *    authManager - Globus OAuth manager
 *    collectionId - The UUID of the target collection/endpoint
 * Outputs:
 *    response - the https response from globus for the get request
 *    data - a json containing the metadata for the collection/endpoint
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.endpoint.get.html
*/
export async function getGlobusEndpointMetadata(authManager, collectionId) {
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.endpoint.get(collectionId, {
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
    }
  });

  const data = await response.json();
  return [response, data];
}
