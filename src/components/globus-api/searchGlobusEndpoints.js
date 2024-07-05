import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    searchGlobusEndpoints
 * Description:
 *    Globus client-stub to get a list of endpoints matching the input string
 * Inputs:
 *    authManager - Globus OAuth manager
 *    searchString - The string to match against endpoint names
 *    numberOfEndpoints - The number of best matches to return
 * Outputs:
 *    response - the https response from globus for the search request
 *    data - a json containing the metadata for the endpoints that matched
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.endpointSearch.html
*/
export async function searchGlobusEndpoints(authManager, searchString, numberOfEndpoints) {
  if (!authManager.isAuthenticated) {
    return [null, null];
  }
  
  const query = searchString.currentTarget.value;
  if (!query) {
    return null;
  }

  const response = await transfer.endpointSearch({
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
    },
    query: {
      filter_fulltext: query,
      limit: numberOfEndpoints
    }
  });

  const data = await response.json();
  return [response, data];
}
