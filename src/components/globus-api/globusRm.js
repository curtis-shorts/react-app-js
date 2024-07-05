import { transfer } from "@globus/sdk/cjs";

/* Function:
 *    globusRm
 * Description:
 *    Globus client-stub to remove an existing file (Globus SDK does not support directory removal)
 * Inputs:
 *    authManager - Globus OAuth manager
 *    collectionId - The UUID of the target collection/endpoint
 *    parentDirPath - The path to the parent directory of the object being renamed
 *    rmItem - The name of the file to delete
 *    notifyWhenDone - Boolean for if the user should be emailed by Globus when it's done
 *    customTaskLabel - Give the deletion task a custom name rather than the default
 * Outputs:
 *    response - the https response from globus for the deletion task submission
 *    data - a json of the metadata for the deletion task
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.taskSubmission.submissionId.html
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.taskSubmission.submitDelete.html
*/
export async function globusRm(authManager, collectionId, parentDirPath, rmItem, notifyWhenDone, customTaskLabel) {
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  // Get the submission ID from the transfer header
  const id = await (
    await transfer.taskSubmission.submissionId({
      headers: {
        Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
      },
    })
  ).json();

  var taskLabel;
  if (taskLabel === null){
    taskLabel = `Delete from ${collectionId}`
  }else{
    taskLabel = customTaskLabel;
  }

  const response = await transfer.taskSubmission.submitDelete({
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
    },
    payload: {
      submission_id: id.value,
      label: taskLabel,
      endpoint: collectionId,
      notify_on_failed: notifyWhenDone,
      notify_on_succeeded: notifyWhenDone,
      DATA: [{
        DATA_TYPE: "delete_item",
        path: `${parentDirPath}${rmItem.name}`
      }]
    }
  });

  const data = await response.json();
  return [response, data];
}
