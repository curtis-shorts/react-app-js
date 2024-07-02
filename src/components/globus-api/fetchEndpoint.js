import { transfer } from "@globus/sdk/cjs";

/*
 * Takes in the OAuth manager and the collection ID of the target endpoint
 * Returns a json of the endpoint's metadata
*/

export async function fetchEndpoint(authManager, collection) {
    // Verify the OAuth manager is valid
    if (!authManager.isAuthenticated) {
        return;
    }

    // Request the endpoint's metadata
    const response = await transfer.endpoint.get(collection, {
        headers: {
            Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
        },
    });

    // json-ify and return the endpoint's metadata
    const data = await response.json();
    if (!response.ok) {
        setError("code" in data ? data : null);
        return;
    }
    return data;
}
