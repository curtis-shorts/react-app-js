import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    globusLs
 * Description:
 *    Globus client-stub to ls the contents of a directory
 * Inputs:
 *    authManager - Globus OAuth manager
 *    collectionId - The UUID of the target collection/endpoint
 *    parentDirPath - The path to the directory to ls in
 *    showHiddenFiles - A boolean to show files/directories that names start with a "."
 * Outputs:
 *    response - the https response from globus for the ls request
 *    data - a json containing the list of metadata for each item in the ls directory
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.fileOperations.ls.html
*/
export async function globusLs(authManager, collectionId, parentDirPath, showHiddenFiles){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.fileOperations.ls(collectionId, {
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
    },
    query: {
      path: parentDirPath ?? undefined,
      show_hidden: showHiddenFiles ? "true" : "false"
    }
  });

  const data = await response.json();
  return [response, data];
}
