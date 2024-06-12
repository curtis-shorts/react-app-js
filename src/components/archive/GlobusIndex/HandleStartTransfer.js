import { transfer, webapp } from "@globus/sdk/cjs";
import { STATIC } from "@/utils/static";
import { isDirectory } from "@/utils/globus";
import { getTransferHeaders } from "@/utils/transferUtils";

export const handleStartTransfer = async (auth, transferSettings, dispatch, toast) => {
  if (
    !transferSettings.source ||
    !transferSettings.source_path ||
    !transferSettings.destination_path ||
    !transferSettings.destination
  ) {
    return;
  }

  const headers = getTransferHeaders(auth);

  const id = await (
    await transfer.taskSubmission.submissionId({
      headers: {
        ...headers,
      },
    })
  ).json();

  const response = await transfer.taskSubmission.submitTransfer({
    payload: {
      submission_id: id.value,
      label: `Transfer from ${STATIC.data.attributes.content.title}`,
      source_endpoint: transferSettings.source.id,
      destination_endpoint: transferSettings.destination.id,
      DATA: transferSettings.items.map((item) => {
        return {
          DATA_TYPE: "transfer_item",
          source_path: `${transferSettings.source_path}${item.name}`,
          destination_path: `${transferSettings.destination_path}${item.name}`,
          recursive: isDirectory(item),
        };
      }),
    },
    headers: {
      ...headers,
    },
  });

  const data = await response.json();

  if (response.ok) {
    toast({
      title: data.code,
      description: (
        <>
          {data.message}
          {"task_id" in data && (
            <Flex>
              <Spacer />
              <Link
                href={webapp.urlFor("TASK", [data.task_id]).toString()}
                isExternal
              >
                View task in Globus Web App{" "}
                <Icon as={ArrowTopRightOnSquareIcon} />
              </Link>
            </Flex>
          )}
        </>
      ),
      status: "success",
      isClosable: true,
    });
  } else {
    toast({
      title: `Error (${data.code})`,
      description: data.message,
      status: "error",
      isClosable: true,
    });
  }
};
