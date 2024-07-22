import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    getAllGlobusTasks
 * Description:
 *    Globus client-stub to get all tasks/events of the user and those done in collections they own
 * Inputs:
 *    authManager - Globus OAuth manager
 *    numberOfTasks - the number of tasks to return
 *    tasksOffset - the number of tasks to skip before returning numberOfTasks
 * Outputs:
 *    response - the https response from Globus for the post request
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.endpointManager.task.getAll.html
 */
export async function getAllGlobusTasks(authManager, numberOfTasks, tasksOffset){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.endpointManager.task.getAll({
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
    },
    query: {
      limit: numberOfTasks,
      offset: tasksOffset
    }
  });

  const data = await response.json();
  return [response, data];
}
