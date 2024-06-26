/*import React from "react";
import { Icon } from "@chakra-ui/react";
import { FolderIcon, DocumentIcon } from "@heroicons/react/24/outline";
//import { isDirectory } from "../list-endpoints/globus";

import type { FileDocument } from "@globus/sdk/cjs/lib/services/transfer/service/file-operations";

export function isDirectory(entry) {
  return entry.type === "dir";
}

export default function FileEntryIcon({ entry }: { entry: FileDocument }) {
  if (isDirectory(entry)) {
    return <Icon as={FolderIcon} />;
  }
  return <Icon as={DocumentIcon} />;
}*/

import React from "react";
import { Icon } from "@chakra-ui/react";
import { FolderIcon, DocumentIcon } from "@heroicons/react/24/outline";

export function isDirectory(entry) {
  return entry.type === "dir";
}

export default function FileEntryIcon({ entry }) {
  if (isDirectory(entry)) {
    return <Icon as={FolderIcon} />;
  }
  return <Icon as={DocumentIcon} />;
}

