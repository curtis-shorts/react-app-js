import { transfer } from "@globus/sdk/cjs";

function isDirectory(entry) {
    return entry.type === "dir";
}

export async function submitGlobusTransfer(transferSettings, getTransferHeaders) {
    // Make sure the transfer settings are well defined
    if (
        !transferSettings.endpoint_one ||
        !transferSettings.file_path_one ||
        !transferSettings.file_path_two ||
        !transferSettings.endpoint_two
    ) {
        return null;
    }

    // Get the submission ID from the transfer header
    const id = await (
        await transfer.taskSubmission.submissionId({
          headers: {
            ...getTransferHeaders(),
          },
        })
    ).json();

    // Submit the transfer request
    const response = await (
        await transfer.taskSubmission.submitTransfer({
            payload: {
                submission_id: id.value,
                label: `Transfer from ${transferSettings.endpoint_one.id}`,
                source_endpoint: transferSettings.endpoint_one.id,
                destination_endpoint: transferSettings.endpoint_two.id,
                DATA: transferSettings.items.map((item) => {
                    return {
                        DATA_TYPE: "transfer_item",
                        source_path: `${transferSettings.file_path_one}${item.name}`,
                        destination_path: `${transferSettings.file_path_two}${item.name}`,
                        recursive: isDirectory(item),
                    };
                }),
            },
            headers: {
                ...getTransferHeaders(),
            },
        })
    ).json();

    // Return the json of the transfer response (holds metadata)
    return response;
}
