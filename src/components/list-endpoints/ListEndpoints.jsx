import React, { useEffect } from "react";
import {
  Box, Center, Container, Flex, IconButton, Input, InputGroup, InputLeftAddon,
  Text, Icon, InputRightElement, Button, useToast, SimpleGrid, useDisclosure, Drawer, DrawerBody,
  DrawerContent, DrawerHeader, DrawerOverlay, Card, CardBody, Spacer, Link, ChakraProvider,
} from "@chakra-ui/react";
import { PlayCircleIcon, XCircleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { webapp } from "@globus/sdk/cjs"; // See the NOTE on toast for the only instance of this

import { useOAuthContext } from "../globus-api/GlobusOAuthProvider";
import { useTransferContext, useTransferDispatchContext } from "../globus-api/GlobusTransferProvider";
import FileBrowser from "../file-browser/FileBrowser";
import { CollectionSearch } from "./CollectionSearch";
import { submitGlobusTransfer } from "../globus-api/submitGlobusTransfer";
import { fetchEndpoint } from "../globus-api/fetchEndpoint";

/*
 * Displays both endpoints and the current directory contents
*/

export default function Home({transferCollection, transferPath}) {
  const auth = useOAuthContext();
  const transferSettings = useTransferContext()
  const dispatch = useTransferDispatchContext()

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Calls the Globus API to submit the transfer and displays a toast of the response
  async function handleStartTransfer() {
    // Submit the transfer request
    const data = await submitGlobusTransfer(transferSettings, auth)

    // Toast handler for the response
    // NOTE: the toast handler calls the Globus SDK directly to ge the URL to show the task in Globus
    if (data === null) {
      console.log("Response returned NULL");
      return;
    } else if (data.code === "Accepted") {
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
  }

  /*
   * Updates the endpoint/collection's metadata whenever the authentication state changes
   * Endpoint 1 is static in this example which is why this is needed
   *  Endpoint 2 is dynamic so the metadata is collected by searchGlobusEndpoint
  */
  useEffect(() => {
    async function updateDispatch(auth, transferCollection){
      // Submit collection metadata request
      const data = await fetchEndpoint(auth, transferCollection);

      // Update the dispatcher
      if(data){
        dispatch({ type: "SET_ENDPOINT_ONE", payload: data });
        dispatch({ type: "SET_FILE_PATH_ONE", payload: data.default_directory });
      }
    }
    updateDispatch(auth, transferCollection);
  }, [auth.isAuthenticated]);

  // Handle manager not authenticated case
  if (!auth.isAuthenticated) {
    return (
      <Center h="100%">
        <Text color="gray.400" as="em" fontSize="2xl" fontWeight="extrabold">
          Not Authenticated
        </Text>
      </Center>
    );
  }

  // Get data from transfer context
  const { endpoint_one, endpoint_two } = transferSettings;

  /*
   * Displays the endpoints side-by-side with endpoint 1 being static and endpoint 2 being dynamic
   * Endpoint 1 calls the file FileBrowser to display the collection data
   * Endpoint 2 does the same as 1 if it's set, or calls CollectionSearch to get select an endpoint if not set
   * The transfer manager overlays at the bottom of the page if both the endpoints are valid
  */
  return (
    <ChakraProvider toastOptions={{
      defaultOptions: { position: "bottom-right", duration: null }
    }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={1}>
        <Box p={2}>
          <Box p={2}>
            <InputGroup>
              <InputLeftAddon>Endpoint one:</InputLeftAddon>
              <Input
                value={endpoint_one ? endpoint_one.display_name || endpoint_one.name : "..."}
                variant="filled"
                isReadOnly
              />
            </InputGroup>
          </Box>
          <FileBrowser
            variant="endpoint_one"
            collection={transferCollection}
            path={transferPath}
          />
        </Box>
        {endpoint_two ? (
          <Box p={2}>
            <Box p={2}>
              <InputGroup>
                <InputLeftAddon>Endpoint two</InputLeftAddon>
                <Input value={endpoint_two.display_name || endpoint_two.name} />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    isRound
                    aria-label="Clear"
                    colorScheme="gray"
                    icon={<Icon as={XCircleIcon} boxSize={6} />}
                    onClick={() => {
                      dispatch({ type: "SET_ENDPOINT_TWO", payload: null });
                      dispatch({ type: "SET_FILE_PATH_TWO", payload: null });
                    }}
                  />
                </InputRightElement>
              </InputGroup>
            </Box>
            <FileBrowser
              variant="endpoint_two"
              collection={endpoint_two.id}
            />
          </Box>
        ) : (
          <Box p={4}>
            <Container>
              <Card variant="filled" size="sm">
                <CardBody>
                  <Text pb={2}>
                    Currently viewing data available at{" "}
                    {endpoint_one?.display_name}.
                    <br /> To transfer this data to another location,{" "}
                    <Button onClick={onOpen} variant="link">search for endpoint two</Button>.
                  </Text>
                </CardBody>
              </Card>
            </Container>

            <Drawer
              placement="right"
              onClose={onClose}
              isOpen={isOpen}
              size="lg"
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerHeader borderBottomWidth="1px">Search for endpoint two</DrawerHeader>
                <DrawerBody>
                  <CollectionSearch
                    onSelect={(endpoint) => {
                      dispatch({
                        type: "SET_ENDPOINT_TWO",
                        payload: endpoint,
                      });
                      dispatch({
                        type: "SET_FILE_PATH_TWO",
                        payload: endpoint.default_directory,
                      });
                    }}
                  />
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Box>
        )}
      </SimpleGrid>

      {endpoint_one && endpoint_two && (
        <Box position="sticky" bottom={0} bgColor="white">
          <Flex py={2} px={20} align="center">
            <Text fontSize="sm">
              <Text as="strong">{transferSettings.items.length}</Text> items selected
            </Text>
            <Spacer />
            <Button
              onClick={() => handleStartTransfer()}
              isDisabled={!endpoint_one || !endpoint_two}
              leftIcon={<Icon as={PlayCircleIcon} boxSize={6} />}
            >
              Start Transfer
            </Button>
          </Flex>
        </Box>
      )}
    </ChakraProvider>
  );
}
