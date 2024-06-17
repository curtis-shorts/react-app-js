import { transfer } from "@globus/sdk/cjs";

/* 
 *  Usage:
 *  Input values should be provided in a similar manner to:
 *   -> endpointString is user-input from a search box
 *   -> manager is an OAuth2 Globus manager generated in the calling hook as:
 *          import { useOAuthContext } from "../globus-auth-context/GlobusOAuthProvider";
 *          const manager = useOAuthContext();
 *  Returns a json file that is that holds the data for a list of Globus endpoints matching
 *      the 'endpointString' input.
 *  Note: the limit variable in the query dictates the max number of items returned
*/
export async function searchGlobusEndpoints(endpointString, manager) {
    const query = endpointString.currentTarget.value;
    if (!query) {
        return null;
    }

    const response = await transfer.endpointSearch({
        query: {
            filter_fulltext: query,
            limit: 20,
        },
        headers: {
            Authorization: `Bearer ${manager.authorization?.tokens.transfer?.access_token}`,
        },
    });

    return await response.json();
}
