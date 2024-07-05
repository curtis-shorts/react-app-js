import React from "react";
import { Icon } from "@chakra-ui/react";
import { FolderIcon, DocumentIcon } from "@heroicons/react/24/outline";

/* ALL UI, NO GLOBUS INTERACTIONS */

export function isDirectory(entry) {
  return entry.type === "dir";
}

/*
 * Show an icon for file or directory
*/

export default function FileEntryIcon({ entry }) {
  if (isDirectory(entry)) {
    return <Icon as={FolderIcon} />;
  }
  return <Icon as={DocumentIcon} />;
}

