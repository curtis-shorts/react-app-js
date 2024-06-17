import React, { useCallback, useEffect, useReducer, createContext, useContext } from "react";
import {
  Box, Center, Container, Flex,
  IconButton, Input, InputGroup, InputLeftAddon,
  Text, Icon, InputRightElement, Button,
  SimpleGrid, useDisclosure, Drawer, DrawerBody,
  DrawerContent, DrawerHeader, DrawerOverlay, Card,
  CardBody, Spacer, Link, useToast
} from "@chakra-ui/react";
import {
  PlayCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { transfer, webapp } from "@globus/sdk/cjs";

import FileBrowser from "../file-browser/FileBrowser";
import { useOAuthContext } from "../globus-api/GlobusOAuthProvider";
import { CollectionSearch } from "./CollectionSearch";

import { submitGlobusTransfer } from "../globus-api/submitGlobusTransfer";

/*
 * Displays both endpoints and the current directory contents
 */

////////////////////////////////////////////// CONTEXTS //////////////////////////////////////////////
// Create the TransferContext
const TransferContext = createContext(undefined);

// Call this function if you need to use variables from the context
export function useTransferContext(){
  return useContext(TransferContext);
}

// Create the TransferDispatchContext
const TransferDispatchContext = createContext(undefined);

// Call this function if you need to use variables from the context
export function useTransferDispatchContext(){
  return useContext(TransferDispatchContext);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////

// Bidirectional transfer naming convention
export const initialState = {
  endpoint_one: null,
  file_path_one: null,
  endpoint_two: null,
  file_path_two: null,
  items: [],
};

// Action reducer to set endpoints
export const transferSettingsReducer = (state, action) => {
  switch (action.type) {
    case "SET_ENDPOINT_ONE": {
      return { ...state, endpoint_one: action.payload };
    }
    case "SET_FILE_PATH_ONE": {
      return { ...state, file_path_one: action.payload };
    }
    case "SET_ENDPOINT_TWO": {
      return { ...state, endpoint_two: action.payload };
    }
    case "SET_FILE_PATH_TWO": {
      return { ...state, file_path_two: action.payload };
    }
    case "RESET_ITEMS": {
      return { ...state, items: [] };
    }
    case "ADD_ITEM": {
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item !== action.payload),
      };
    }
    default: {
      throw new Error("Unknown action: " + action.type);
    }
  }
};

export default function Home({transferCollection, transferPath}) {
  const auth = useOAuthContext();
  const [transferSettings, dispatch] = useReducer(
    transferSettingsReducer,
    initialState
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Current WIP to seperate the transfer call to another file
  async function submitGlobusTransferWrapper(){
    const response = await submitGlobusTransfer(transferSettings, auth);

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
  }


  const getTransferHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${auth.authorization?.tokens.transfer?.access_token}`,
    };
  }, [auth.authorization?.tokens.transfer?.access_token]);


  useEffect(() => {
    async function fetchCollection() {
      if (!auth.isAuthenticated) {
        return;
      }
      const response = await transfer.endpoint.get(transferCollection, {
        headers: {
          ...getTransferHeaders(),
        },
      });
      const data = await response.json();
      dispatch({ type: "SET_ENDPOINT_ONE", payload: data });
      dispatch({ type: "SET_FILE_PATH_ONE", payload: data.default_directory });
    }
    fetchCollection();
  }, [auth.isAuthenticated, getTransferHeaders]);

  if (!auth.isAuthenticated) {
    return (
      <Center h="100%">
        <Text color="gray.400" as="em" fontSize="2xl" fontWeight="extrabold">
          Not Authenticated
        </Text>
      </Center>
    );
  }

  const { endpoint_one, endpoint_two } = transferSettings;

  return (
    <TransferContext.Provider value={transferSettings}>
      <TransferDispatchContext.Provider value={dispatch}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={1}>
          <Box p={2}>
            <Box p={2}>
              <InputGroup>
                <InputLeftAddon>endpoint_one</InputLeftAddon>
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
                  <InputLeftAddon>endpoint_two</InputLeftAddon>
                  <Input
                    value={endpoint_two.display_name || endpoint_two.name}
                  />
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
                        dispatch({
                          type: "SET_FILE_PATH_TWO",
                          payload: null,
                        });
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
                      You are viewing data made available by{" "}
                      {endpoint_one?.display_name}.
                      <br /> To transfer data to another location,{" "}
                      <Button onClick={onOpen} variant="link">
                        search for a endpoint_two
                      </Button>
                      .
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
                <DrawerContent bg="white">
                  <DrawerHeader borderBottomWidth="1px">
                    Search for a endpoint_two
                  </DrawerHeader>
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
                <Text as="strong">{transferSettings.items.length}</Text> items
                selected
              </Text>
              <Spacer />
              <Button
                onClick={() => submitGlobusTransferWrapper()}
                isDisabled={!endpoint_one || !endpoint_two}
                leftIcon={<Icon as={PlayCircleIcon} boxSize={6} />}
              >
                Start Transfer
              </Button>
            </Flex>
          </Box>
        )}
      </TransferDispatchContext.Provider>
    </TransferContext.Provider>
  );
}

