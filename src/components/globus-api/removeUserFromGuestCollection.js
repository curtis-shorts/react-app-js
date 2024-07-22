import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    removeUserFromGuestCollection
 * Description:
 *    Globus client-stub to remove a permission from a guest collection by the permission's UUID
 * Inputs:
 *    authManager - Globus OAuth manager
 *    guestCollectionId - the ID of the guest collection
 *    guestCollectionPermissionsId - the UUID of the guest collection permission setting (user and path specific)
 * Outputs:
 *    response - the https response from Globus for the permission request
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.access.remove.html
 */
export async function removeUserFromGuestCollection(authManager, guestCollectionId, guestCollectionPermissionsId){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.access.remove({
      endpoint_xid: guestCollectionId,
      id: guestCollectionPermissionsId,
    },{
      headers: {
        Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
      }
  });

  const data = await response.json();
  return [response, data];
}
