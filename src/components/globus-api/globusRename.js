import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    globusRename
 * Description:
 *    Globus client-stub to rename an existing object (file/directory)
 * Inputs:
 *    authManager - Globus OAuth manager
 *    collectionId - The UUID of the target collection/endpoint
 *    parentDirPath - The path to the parent directory of the object being renamed
 *    oldName - The existing name of the object
 *    newName - What to rename the object as
 * Outputs:
 *    response - the https response from globus for the rename request
 *    data - a json containing the metadata on the rename
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.fileOperations.rename.html
*/
export async function globusRename(authManager, collectionId, parentDirPath, oldName, newName){
  if (!authManager.isAuthenticated) {
      return [null, null];
  }

  const response = await transfer.fileOperations.rename(collectionId, {
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
    },
    payload: {
      old_path: `${parentDirPath}${oldName}/`,
      new_path: `${parentDirPath}${newName}/`
    }
  });

  const data = await response.json();
  return [response, data];
}
