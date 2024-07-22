import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    addUserToGuestCollection
 * Description:
 *    Globus client-stub to add a user to a guest collection by their Globus email address
 * Inputs:
 *    authManager - Globus OAuth manager
 *    guestCollectionId - the ID of the guest collection
 *    userId - the email address of the user to add
 *    filePathInCollection - 
 * Outputs:
 *    response - the https response from Globus for the permission request
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.access.create.html
 */
export async function addUserToGuestCollection(authManager, guestCollectionId, userId, filePathInCollection){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.access.create(guestCollectionId, {
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
    },
    payload: {
      path: filePathInCollection,
      permissions: "rw",
      principal: userId,
      principal_type: "identity"
    }
  });

  const data = await response.json();
  return [response, data];
}
