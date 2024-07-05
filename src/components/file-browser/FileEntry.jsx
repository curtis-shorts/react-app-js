import React, { useContext, useState } from "react";
import {
  Button, Checkbox, HStack, Icon, IconButton, Menu,
  MenuItem, MenuList, Spinner, Td, Text, Tooltip, Tr,
} from "@chakra-ui/react";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";

import FileNameForm from "./FileNameForm";
import FileEntryIcon from "./FileEntryIcon";
import { useTransferDispatchContext } from "../globus-api/GlobusTransferProvider";
import { FileBrowserContext } from "./FileBrowser";

/* ALL UI, NO GLOBUS INTERACTIONS */
// Exception is that the handleRename function gets passed down into this to get called
// Easier to pass it this way than to pass the whole ls context

/************************ Supporting Declarations *************************/
const KB = 1000;
const MB = KB * 1000;
const GB = MB * 1000;
const TB = GB * 1000;
const PB = TB * 1000;

export function bytesHumanReadable(bytes, truncate = 2) {
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
/**************************************************************************/

/*
  * Display the metadata for a given object (file or directory, sym-links are seen by Globus as the thing they point to)
  * Displays the date last modified and object size if set in the FileBrowserMenu
  * Displays selection for adding/removing items to/from the transfer
  * If you right click on an object in the destination then you get the option to rename it
*/
export default function FileEntry({
  item,
  isSource,
  endpoint,
  absolutePath,
  openDirectory,
  handleRename,
  handleRemove
}) {
  // Setup
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditView, setShowEditView] = useState(false);
  const menuRef = React.useRef(null);

  const transferSettingsDispatch = useTransferDispatchContext();

  const fileBrowser = useContext(FileBrowserContext);

  // Main
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

  // Read in the settings for what to display as set in the FileBrowserMenu
  const includeLastModified = fileBrowser.view.columns.includes("last_modified");
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
          {isLoading ? /*Loading spinner, elif edit file, elif directory, else file*/(
              <Spinner ml={2} /> 
            ) : showEditView ? (
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
            ) : isDirectory(item) ? (
              <Button textColor="black" variant="link" onClick={openDirectory}>
                {item.name}
              </Button>
            ) : (
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
                {item.size && bytesHumanReadable(item.size)}
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
          <MenuItem onClick={() => {
              handleRemove();
            }
            }>Remove</MenuItem>
        </MenuList>
      </Menu>
    </Tr>
  );
}
