import { transfer } from "@globus/sdk/cjs";

function isDirectory(entry) {
    return entry.type === "dir";
}

/* Function:
 *    submitGlobusTransfer
 * Description:
 *    Globus client-stub to rename an existing object (file/directory)
 * Inputs:
 *    authManager - Globus OAuth manager
 *    transferSettings - object containing the endpoints and transfer paths
 *    notifyWhenDone - Boolean of whether to have Globus email the user when the task succeeds/fails
 *    customTaskLabel - Give the deletion task a custom name rather than the default
 * Outputs:
 *    response - the https response from globus for the search request
 *    data - a json of the responses content
 * Errors to handle/expect:
 *    None
 * Globus SDK documentation:
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.taskSubmission.submissionId.html
 *    https://globus.github.io/globus-sdk-javascript/functions/_globus_sdk.transfer.taskSubmission.submitTransfer.html
*/
export async function submitGlobusTransfer(authManager, transferSettings, notifyWhenDone, customTaskLabel) {
  if (!authManager.isAuthenticated) {
    return [null, null];
  }

  // Make sure the transfer settings are well defined
  if (
    !transferSettings.endpoint_one ||
    !transferSettings.file_path_one ||
    !transferSettings.file_path_two ||
    !transferSettings.endpoint_two
  ) {
    return null;
  }

  // Need to get a submission ID to submit tasks (Note: this is not the task ID)
  const submissionId = await (
    await transfer.taskSubmission.submissionId({
      headers: {
        Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`,
      },
    })
  ).json();

  var taskLabel;
  if (taskLabel === null){
    taskLabel = `Transfer from ${collectionId}`
  }else{
    taskLabel = customTaskLabel;
  }

  const response = await transfer.taskSubmission.submitTransfer({
    headers: {
      Authorization: `Bearer ${authManager.authorization?.tokens.transfer?.access_token}`
    },
    payload: {
      submission_id: submissionId.value,
      label: taskLabel,
      source_endpoint: transferSettings.endpoint_one.id,
      destination_endpoint: transferSettings.endpoint_two.id,
      notify_on_failed: notifyWhenDone,
      notify_on_succeeded: notifyWhenDone,
      DATA: transferSettings.items.map((item) => {
        return {
          DATA_TYPE: "transfer_item",
          source_path: `${transferSettings.file_path_one}${item.name}`,
          destination_path: `${transferSettings.file_path_two}${item.name}`,
          recursive: isDirectory(item)
        };
      })
    }
  });
  
  const data = await response.json();
  return [response, data];
}
