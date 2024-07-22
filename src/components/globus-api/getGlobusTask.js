import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    getGlobusTask
 * Description:
 *    Globus client-stub to get the data for a task/event of the user or one done in a collection they own
 * Inputs:
 *    authManager - Globus OAuth manager
 *    taskId - the task to get the data for
 * Outputs:
 *    response - the https response from Globus for the post request
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.endpointManager.task.get.html
 */
export async function getGlobusTask(authManager, taskId){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.endpointManager.task.get(taskId, { 
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
    }
  });

  const data = await response.json();
  return [response, data];
}
