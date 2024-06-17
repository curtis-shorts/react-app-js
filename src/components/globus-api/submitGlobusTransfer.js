// handleStartTransfer.js

import { transfer, webapp } from "@globus/sdk/cjs";

function isDirectory(entry) {
    return entry.type === "dir";
}

export async function submitGlobusTransfer(transferSettings, manager) {
  if (
    !transferSettings.endpoint_one ||
    !transferSettings.file_path_one ||
    !transferSettings.file_path_two ||
    !transferSettings.endpoint_two
  ) {
    return;
  }

  const getTransferHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${manager.authorization?.tokens.transfer?.access_token}`,
    };
  }, [manager.authorization?.tokens.transfer?.access_token]);



  const id = await (
    await transfer.taskSubmission.submissionId({
      headers: {
        ...getTransferHeaders(),
      },
    })
  ).json();

  const response = await transfer.taskSubmission.submitTransfer({
    payload: {
      submission_id: id.value,
      label: `Transfer from ${transferSettings.endpoint_one.id}`,
      source_endpoint: transferSettings.endpoint_one.id,
      destination_endpoint: transferSettings.endpoint_two.id,
      DATA: transferSettings.items.map((item) => {
        return {
          DATA_TYPE: "transfer_item",
          file_path_one: `${transferSettings.file_path_one}${item.name}`,
          file_path_two: `${transferSettings.file_path_two}${item.name}`,
          recursive: isDirectory(item),
        };
      }),
    },
    headers: {
      ...getTransferHeaders(),
    },
  });

  return response;
}
