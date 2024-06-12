/*import React, { useCallback, useEffect, useReducer } from "react";
import {
  Box,
  Center,
  Container,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Icon,
  InputRightElement,
  Button,
  useToast,
  SimpleGrid,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Card,
  CardBody,
  Spacer,
  Link,
} from "@chakra-ui/react";
import {
  PlayCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

import FileBrowser from "@/components/file-browser/FileBrowser";
import { useGlobusAuth } from "@/components/globus-auth-context/useGlobusAuth";

import { CollectionSearch } from "@/components/CollectionSearch";

import {
  TransferSettingsContext,
  TransferSettingsDispatchContext,
} from "@/components/transfer-settings-context/Context";

import transferSettingsReducer, {
  initialState,
} from "@/components/transfer-settings-context/reducer";

import { isDirectory } from "@/utils/globus";

// Import the getTransferHeaders function and handleStartTransfer
import { getTransferHeaders } from "@/utils/transferUtils";
import { handleStartTransfer } from "@/utils/transferHandlers";

export default function Home() {
  const auth = useGlobusAuth();
  const [transferSettings, dispatch] = useReducer(
    transferSettingsReducer,
    initialState,
  );
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getHeaders = useCallback(() => getTransferHeaders(auth), [auth]);

  useEffect(() => {
    async function fetchCollection() {
      if (!auth.isAuthenticated) {
        return;
      }
      const response = await transfer.endpoint.get(
        'e1362c76-1715-11ef-834d-57b5c7e2fa2b',
        {
          headers: {
            ...getHeaders(),
          },
        },
      );
      const data = await response.json();
      dispatch({ type: "SET_SOURCE", payload: data });
      dispatch({ type: "SET_SOURCE_PATH", payload: data.default_directory });
    }
    fetchCollection();
  }, [auth.isAuthenticated, getHeaders]);

  if (!auth.isAuthenticated) {
    return (
      <Center h="100%">
        <Text color="gray.400" as="em" fontSize="2xl" fontWeight="extrabold">
          Example Tagline
        </Text>
      </Center>
    );
  }

  const { source, destination } = transferSettings;

  return (
    <TransferSettingsContext.Provider value={transferSettings}>
      <TransferSettingsDispatchContext.Provider value={dispatch}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={1}>
          {source ? (
            <Box p={2}>
              <Box p={2}>
                <InputGroup>
                  <InputLeftAddon>Pull it up!</InputLeftAddon>
                  <Input value={source.display_name || source.name} />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      isRound
                      aria-label="Clear"
                      colorScheme="gray"
                      icon={<Icon as={XCircleIcon} boxSize={6} />}
                      onClick={() => {
                        dispatch({ type: "SET_SOURCE", payload: null });
                        dispatch({ type: "SET_SOURCE_PATH", payload: null });
                      }}
                    />
                  </InputRightElement>
                </InputGroup>
              </Box>
              <FileBrowser variant="source" collection={source.id} />
            </Box>
          ) : (
            <Box p={4}>
              <Container>
                <Card variant="filled" size="sm">
                  <CardBody>
                    <Text pb={2}>
                      You are viewing data made available by{" "}
                      {source?.display_name}.
                      <br /> To transfer data to another location,{" "}
                      <Button onClick={onOpen} variant="link">
                        search for a destination
                      </Button>
                      .
                    </Text>
                  </CardBody>
                </Card>
              </Container>

              <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="lg">
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerHeader borderBottomWidth="1px">
                    Search for a source
                  </DrawerHeader>
                  <DrawerBody>
                    <CollectionSearch
                      onSelect={(endpoint) => {
                        dispatch({ type: "SET_SOURCE", payload: endpoint });
                        dispatch({
                          type: "SET_SOURCE_PATH",
                          payload: endpoint.default_directory,
                        });
                      }}
                    />
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Box>
          )}

          {destination ? (
            <Box p={2}>
              <Box p={2}>
                <InputGroup>
                  <InputLeftAddon>Destination</InputLeftAddon>
                  <Input value={destination.display_name || destination.name} />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      isRound
                      aria-label="Clear"
                      colorScheme="gray"
                      icon={<Icon as={XCircleIcon} boxSize={6} />}
                      onClick={() => {
                        dispatch({ type: "SET_DESTINATION", payload: null });
                        dispatch({ type: "SET_DESTINATION_PATH", payload: null });
                      }}
                    />
                  </InputRightElement>
                </InputGroup>
              </Box>
              <FileBrowser variant="destination" collection={destination.id} />
            </Box>
          ) : (
            <Box p={4}>
              <Container>
                <Card variant="filled" size="sm">
                  <CardBody>
                    <Text pb={2}>
                      Check this out!
                      <br /> To transfer data to another location,{" "}
                      <Button onClick={onOpen} variant="link">
                        search for a destination
                      </Button>
                      .
                    </Text>
                  </CardBody>
                </Card>
              </Container>

              <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="lg">
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerHeader borderBottomWidth="1px">
                    Search for a destination
                  </DrawerHeader>
                  <DrawerBody>
                    <CollectionSearch
                      onSelect={(endpoint) => {
                        dispatch({ type: "SET_DESTINATION", payload: endpoint });
                        dispatch({
                          type: "SET_DESTINATION_PATH",
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

        {source && destination && (
          <Box position="sticky" bottom={0} bgColor="gray.100">
            <Flex py={2} px={20} align="center">
              <Text fontSize="sm">
                <Text as="strong">{transferSettings.items.length}</Text> items selected
              </Text>
              <Spacer />
              <Button
                onClick={() => handleStartTransfer(auth, transferSettings, dispatch, toast)}
                isDisabled={!source || !destination}
                leftIcon={<Icon as={PlayCircleIcon} boxSize={6} />}
              >
                Start Transfer
              </Button>
            </Flex>
          </Box>
        )}
      </TransferSettingsDispatchContext.Provider>
    </TransferSettingsContext.Provider>
  );
}
*/
