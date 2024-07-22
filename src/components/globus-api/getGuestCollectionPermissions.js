import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    getGuestCollectionPermissions
 * Description:
 *    Globus client-stub to get all the permissions set for a guest collection
 * Inputs:
 *    authManager - Globus OAuth manager
 *    guestCollectionId - the ID of the guest collection to get a list of permissions for
 * Outputs:
 *    response - the https response from Globus for the get request
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.access.getAll.html
 */
export async function getGuestCollectionPermissions(authManager, guestCollectionId){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.access.getAll(guestCollectionId, {
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
    }
  });

  const data = await response.json();
  return [response, data];
}
