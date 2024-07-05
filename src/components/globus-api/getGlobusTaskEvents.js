import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    getGlobusTaskEvents
 * Description:
 *    Globus client-stub to get a list of the events that have occured for a given task (transfer/deletion)
 * Inputs:
 *    authManager - Globus OAuth manager
 *    taskId - the ID of the transfer/deletion task to get the events for
 *    numberOfEvents - the number of events to return
 *    eventsOffset - the number of events to skip before returning numberOfEvents
 * Outputs:
 *    response - the https response from globus for the get request
 *    data - a json containing the metadata for each of the events belonging to the task
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.task.getEventList.html
*/
export async function getGlobusTaskEvents(authManager, taskId, numberOfEvents, eventsOffset){
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  const response = await transfer.task.getEventList({
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
    },
    query: {
      task_id: taskId,
      limit: numberOfEvents,
      offset: eventsOffset
    }
  });

  const data = await response.json();
  return [response, data];
}
