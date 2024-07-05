import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    globusMkdir
 * Description:
 *    Globus client-stub to submit a mkdir request
 * Inputs:
 *    authManager - Globus OAuth manager
 *    collectionId - The UUID of the target collection/endpoint
 *    parentDirPath - The path to the parent directory to mkdir in
 *    newDirName - The name of the new directory
 * Outputs:
 *    response - the https response from globus for the mkdir request
 *    data - a json of the responses content
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.fileOperations.mkdir.html
*/
export async function globusMkdir(authManager, collectionId, parentDirPath, newDirName){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.fileOperations.mkdir(collectionId, {
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
    },
    payload: {
      path: `${parentDirPath}${newDirName}`
    }
  });

  const data = await response.json();
  return [response, data];
}
