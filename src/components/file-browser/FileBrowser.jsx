import React, { useCallback, useEffect, useReducer, useState, createContext } from "react";
import {
  Table, TableContainer, Tr, Th, Td, Thead, Code, Icon, Button,
  Box, Spinner, Center, Tbody, ButtonGroup, Flex, Spacer, useToast
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { ArrowPathIcon, ArrowUturnUpIcon, FolderPlusIcon } from "@heroicons/react/24/outline";

import { useOAuthContext } from "../globus-api/GlobusOAuthProvider";
import { useTransferDispatchContext } from "../globus-api/GlobusTransferProvider";
import { getGlobusEndpointMetadata } from "../globus-api/getGlobusEndpointMetadata";
import { globusLs } from "../globus-api/globusLs";
import { globusRename } from "../globus-api/globusRename";
import { globusMkdir } from "../globus-api/globusMkdir";
import { globusRm } from "../globus-api/globusRm";

import FileBrowserViewMenu from "./FileBrowserViewMenu";
import FileBrowserError from "./FileBrowserError";
import FileNameForm from "./FileNameForm";
import FileEntry from "./FileEntry";


/*
 * Handles the viewing of files in an endpoint/collection
*/

const initialState = {
  view: {
    show_hidden: false,
    columns: ["name", "last_modified", "size"],
  },
};

function fileBrowserReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_VIEW_COLUMNS": {
      return {
        ...state,
        view: {
          ...state.view,
          columns: action.payload,
        },
      };
    }
    case "SET_VIEW_SHOW_HIDDEN": {
      return {
        ...state,
        view: {
          ...state.view,
          show_hidden: action.payload,
        },
      };
    }
    default: {
      throw new Error("Unknown action: " + action.type);
    }
  }
}


export const FileBrowserContext = createContext(initialState);

// this context is simply created for handling what is/isn't displayed in the FileBrowser (dictated by FileBrowserViewMenu)
export const FileBrowserDispatchContext = createContext(() => {});



export default function FileBrowser({ variant, collection, path }) {
  const auth = useOAuthContext();

  const [fileBrowser, fileBrowserDispatch] = useReducer(fileBrowserReducer, initialState);
  
  const transferSettingsDispatch = useTransferDispatchContext();

  const isSource = variant === "endpoint_one";

  const [browserPath, setBrowserPath] = useState(path);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDirectory, setShowAddDirectory] = useState(false);
  const [endpoint, setEndpoint] = useState(null);
  const [lsResponse, setLsResponse] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Collection state metadata
  useEffect(() => {
    setEndpoint(getGlobusEndpointMetadata(auth, collection));
  }, [auth, collection]);

  // ls a new endpoint
  const fetchItems = useCallback(async () => {
    // Set the loader to spin and clear the items selected for transfer
    setIsLoading(true);
    const isSource = variant === "endpoint_one";
    if (isSource) {
      transferSettingsDispatch({
        type: "RESET_ITEMS",
      });
    }

    // Call the Globus API to ls the directory
    const [response, data] = await globusLs(auth, collection, browserPath, fileBrowser.view.show_hidden);

    //
    setIsLoading(false);
    setLsResponse(data);

    // Handle errors
    if (!response.ok) {
      setError("code" in data ? data : null);
      return;
    }
    setItems("DATA" in data ? data.DATA : []);
    const transferPath = "absolute_path" in data ? data.absolute_path : null;
    if (!browserPath && transferPath) {
      setBrowserPath(transferPath);
    }
    transferSettingsDispatch({
      type: isSource ? "SET_FILE_PATH_ONE" : "SET_FILE_PATH_TWO",
      payload: transferPath,
    });
  }, [
    auth,
    browserPath,
    collection,
    transferSettingsDispatch,
    variant,
    fileBrowser.view.show_hidden,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addDirectory = async (name) => {
    async function handleMkdir(auth, collection, browserPath, name){
      setIsLoading(true);
      const [response, data] = await globusMkdir(auth, collection, browserPath, name);
      if (!response.ok) {
        showErrorToast(data);
      } else {
        fetchItems();
      }
      fetchItems();
      //setIsLoading(false);
    }
    handleMkdir(auth, collection, browserPath, name);
  };

  const rename = async (file, absolutePath, updatedName) => {
    async function handleRename(auth, file, collection, absolutePath, updatedName){
      const [response, data] = await globusRename(auth, collection, absolutePath, file.name, updatedName);
      if (response === null){
        return;
      }
      if (!response.ok) {
        showErrorToast(data);
      } else {
        setItems(
          items.map((item) =>
            item.name === file.name ? { ...item, name: updatedName } : item
          )
        );
      }
    }
    handleRename(auth, file, collection, absolutePath, updatedName);
  };

  const remove = async (file, absolutePath) => {
    async function handleRemove(auth, file, collection, absolutePath){
      const [response, data] = await globusRm(auth, collection, absolutePath, file, false, null);
      if (response === null){
        return;
      }
      if (!response.ok) {
        showErrorToast(data);
      } else {
        setItems(
          items.map((item) =>
            item.name === file.name ? { ...item } : item
          )
        );
      }
    }
    handleRemove(auth, file, collection, absolutePath);
  };

  const showErrorToast = (data) => {
    toast({
      title: `Error (${data.code})`,
      description: data.message,
      status: "error",
      isClosable: true,
    });
  };

  /*
   * Displays:
   *    Spinner if anything in the browser is loading
   *    FileBrowserError if there's an error
   *    If working right:
   *      Current ls path
   *      ButtonGroup for: FileBrowserViewMenu, add new folder, up one folder, refresh
   *      Table with Thead (name, modiffied, size) and Tbody (add directory if source, each ls item mapped to a FileEntry)
  */
  return (
    <>
      <FileBrowserContext.Provider value={fileBrowser}>
        <FileBrowserDispatchContext.Provider value={fileBrowserDispatch}>
          {isLoading && (
            <Box mt={4}>
              <Center>
                <Spinner />
              </Center>
            </Box>
          )}

          {error ? <FileBrowserError error={error} /> : null}

          {!isLoading && !error && lsResponse && (
            <>
              <Box p={2}>
                <ChevronRightIcon />
                <Code>{lsResponse.absolute_path}</Code>
              </Box>
              <Flex justify="end">
                <FileBrowserViewMenu />
                <Spacer />
                <ButtonGroup>
                  {!isSource && (
                    <Button
                      size="xs"
                      leftIcon={<Icon as={FolderPlusIcon} />}
                      onClick={() => {
                        setShowAddDirectory(true);
                      }}
                    >
                      New Folder
                    </Button>
                  )}
                  <Button
                    colorScheme="gray"
                    size="xs"
                    leftIcon={<Icon as={ArrowUturnUpIcon} />}
                    onClick={() => {
                      if (!browserPath) return;
                      const pathParts = browserPath.split("/");
                      pathParts.pop();
                      pathParts.pop();
                      setBrowserPath(pathParts.join("/") + "/");
                    }}
                  >
                    Up One Folder
                  </Button>
                  <Button
                    colorScheme="gray"
                    size="xs"
                    leftIcon={<Icon as={ArrowPathIcon} />}
                    onClick={() => fetchItems()}
                  >
                    Refresh
                  </Button>
                </ButtonGroup>
              </Flex>
              <Box h="60vh" overflowY="auto" p={2}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        {isSource && <Td />}
                        <Th>Name</Th>
                        {fileBrowser.view.columns.includes("last_modified") && (
                          <Th>Last Modified</Th>
                        )}
                        {fileBrowser.view.columns.includes("size") && <Th>Size</Th>}
                        {isSource && <Td />}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {showAddDirectory && (
                        <Tr>
                          <Td colSpan={3}>
                            <FileNameForm
                              onSubmit={addDirectory}
                              toggleShowForm={setShowAddDirectory}
                              icon={<Icon as={FolderPlusIcon} />}
                              label="Folder Name"
                            />
                          </Td>
                        </Tr>
                      )}
                      {items.map((item, i) => (
                        <FileEntry
                          key={i}
                          item={item}
                          isSource={isSource}
                          endpoint={endpoint}
                          absolutePath={lsResponse.absolute_path}
                          openDirectory={() => {
                            setBrowserPath(`${lsResponse.absolute_path}${item.name}/`);
                            setShowAddDirectory(false);
                          }}
                          handleRename={async (updatedName) => {
                            await rename(item, lsResponse.absolute_path, updatedName);
                          }}
                          handleRemove={async () => {
                            await remove(item, lsResponse.absolute_path);
                          }}
                        />
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </FileBrowserDispatchContext.Provider>
      </FileBrowserContext.Provider>
    </>
  );
}
