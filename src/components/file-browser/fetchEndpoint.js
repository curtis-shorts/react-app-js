import { transfer } from "@globus/sdk/cjs";

export async function fetchEndpoint(auth, collection, setEndpoint) {
    if (!auth.isAuthenticated) {
        return;
    }

    const response = await transfer.endpoint.get(collection, {
        headers: {
            Authorization: `Bearer ${auth.authorization?.tokens.transfer?.access_token}`,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        setError("code" in data ? data : null);
        return;
    }
    //setEndpoint(data);
}
