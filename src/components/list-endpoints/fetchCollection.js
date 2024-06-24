import { transfer } from "@globus/sdk/cjs";

// Not sure how this is different from file-browser/fetchEndpoint.js

export async function fetchCollection(auth, transferCollection, dispatch) {
    if (!auth.isAuthenticated) {
      return;
    }
    const response = await transfer.endpoint.get(transferCollection, {
      headers: {
        Authorization: `Bearer ${auth.authorization?.tokens.transfer?.access_token}`,
      },
    });
    const data = await response.json();
    dispatch({ type: "SET_ENDPOINT_ONE", payload: data });
    dispatch({ type: "SET_FILE_PATH_ONE", payload: data.default_directory });
}
