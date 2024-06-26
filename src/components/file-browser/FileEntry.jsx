import React, { useContext, useState } from "react";
import {
  Button, Checkbox, HStack, Icon, IconButton, Menu,
  MenuItem, MenuList, Spinner, Td, Text, Tooltip, Tr,
} from "@chakra-ui/react";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";

import FileNameForm from "./FileNameForm";
//import { isDirectory, readable } from "../list-endpoints/globus";

const KB = 1000;
const MB = KB * 1000;
const GB = MB * 1000;
const TB = GB * 1000;
const PB = TB * 1000;

export function readable(bytes, truncate = 2) {
  let unit = "B";
  let bytesInUnit = 1;
  if (bytes < KB) {
    return `${bytes} ${unit}`;
  } else if (bytes < MB) {
    unit = "KB";
    bytesInUnit = KB;
  } else if (bytes < GB) {
    unit = "MB";
    bytesInUnit = MB;
  } else if (bytes < TB) {
    unit = "GB";
    bytesInUnit = GB;
  } else if (bytes < PB) {
    unit = "TB";
    bytesInUnit = TB;
  } else {
    unit = "PB";
    bytesInUnit = PB;
  }
  const value = bytes / bytesInUnit;
  return `${value.toFixed(truncate)} ${unit}`;
}

export function isDirectory(entry) {
  return entry.type === "dir";
}

import FileEntryIcon from "./FileEntryIcon";
//import { TransferSettingsDispatchContext } from "../list-endpoints/Context";
import { useTransferDispatchContext } from "../globus-api/GlobusTransferProvider";

import { FileBrowserContext } from "./Context";

export default function FileEntry({
  item,
  isSource,
  endpoint,
  absolutePath,
  openDirectory,
  handleRename,
}) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditView, setShowEditView] = useState(false);
  const menuRef = React.useRef(null);

  //const transferSettingsDispatch = useContext(TransferSettingsDispatchContext);
  const transferSettingsDispatch = useTransferDispatchContext();

  const fileBrowser = useContext(FileBrowserContext);
  const displayContextMenu = (event) => {
    if (!isSource && !showEditView) {
      event.preventDefault();
      setContextMenuOpen(true);
      if (menuRef.current?.parentElement) {
        const { parentElement } = menuRef.current;
        parentElement.style.top = `${event.pageY}px`;
        parentElement.style.left = `${event.pageX}px`;
      }
    }
  };
  const includeLastModified =
    fileBrowser.view.columns.includes("last_modified");
  const includeSize = fileBrowser.view.columns.includes("size");

  return (
    <Tr onContextMenu={displayContextMenu}>
      {/*transfer checkbox for source*/ isSource && (
        <Td>
          <Checkbox
            size="lg"
            onChange={(e) => {
              if (e.target.checked) {
                transferSettingsDispatch({ type: "ADD_ITEM", payload: item });
              } else {
                transferSettingsDispatch({ type: "REMOVE_ITEM", payload: item });
              }
            }}
          />
        </Td>
      )}
      <Td>
        <HStack>
          {/*Show a file or folder icon*/ !showEditView && <FileEntryIcon entry={item} />}
          {isLoading ? /*Loading spinner*/(
              <Spinner ml={2} /> 
            ) : /*edit view*/ showEditView ? (
              <FileNameForm
                onSubmit={async (name) => {
                  setIsLoading(true);
                  await handleRename(name);
                  setIsLoading(false);
                }}
                label={isDirectory(item) ? "Folder Name" : "File Name"}
                icon={<FileEntryIcon entry={item} />}
                toggleShowForm={setShowEditView}
                initialValue={item.name}
              />
            ) : /*directory*/ isDirectory(item) ? (
              <Button textColor="black" variant="link" onClick={openDirectory}>
                {item.name}
              </Button>
            ) : /*file*/ (
              <Text textColor="black">{item.name}</Text>
            )
          }
        </HStack>
      </Td>
      {includeLastModified && (
        <Td>
          {item.last_modified ? (
            <Tooltip label={item.last_modified} variant="outline" hasArrow>
              <Text _hover={{ cursor: "help" }}>
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(item.last_modified))}
              </Text>
            </Tooltip>
          ) : (
            <Text>&mdash;</Text>
          )}
        </Td>
      )}
      {includeSize && (
        <Td>
          {item.size ? (
            <Tooltip label={`${item.size} B`} variant="outline" hasArrow>
              <Text _hover={{ cursor: "help" }}>
                {item.size && readable(item.size)}
              </Text>
            </Tooltip>
          ) : (
            <Text>&mdash;</Text>
          )}
        </Td>
      )}
      {isSource && (
        <Td>
          {endpoint?.httpsServer && item.type === "file" && (
            <IconButton
              as="a"
              aria-label="Open"
              href={`${endpoint?.httpsServer}${absolutePath}${item.name}`}
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              icon={<Icon as={ArrowUpOnSquareIcon} />}
            />
          )}
        </Td>
      )}
      <Menu
        isOpen={contextMenuOpen}
        onClose={() => {
          setContextMenuOpen(false);
        }}
      >
        <MenuList ref={menuRef}>
          <MenuItem onClick={() => setShowEditView(true)}>Rename</MenuItem>
        </MenuList>
      </Menu>
    </Tr>
  );
}
