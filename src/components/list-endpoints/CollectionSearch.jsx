import React, { useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  Stack,
  Card,
  CardHeader,
  CardBody,
  Text,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useOAuthContext } from "../globus-api/GlobusOAuthProvider";
import { searchGlobusEndpoints } from "../globus-api/searchGlobusEndpoints";

/*
 * Returns the collection list popup menu which can be used for collection selection
 */

export const CollectionSearch = ({ onSelect = () => {} }) => {
  const manager = useOAuthContext();
  const [results, setResults] = useState([]);

  async function handleSearchWrapper(endpointString) {
    const returnVal = await searchGlobusEndpoints(endpointString, manager)
    console.log(returnVal)
    if (returnVal !== null){
      setResults(returnVal.DATA)
    } else {
      setResults([])
    }
  }

  return (
    <Stack>
      <Box position="sticky" top="0" zIndex={1} bgColor="white">
        <InputGroup>
          <Input
            onInput={(endpointString) => handleSearchWrapper(endpointString)}
            placeholder="e.g. Globus Tutorial Collection"
          />
        </InputGroup>
      </Box>
      {results.map((result) => (
        <Card
          size="sm"
          variant="outline"
          key={result.id}
          onClick={() => onSelect(result)}
          _hover={{ cursor: "pointer", borderColor: "blue.500" }}
        >
          <CardHeader pb={0}>
            <Text>{result.display_name || result.name}</Text>
            <Text fontSize="xs">{result.entity_type}</Text>
          </CardHeader>
          <CardBody>
            <List>
              <Text fontSize="xs">
                <ListItem>ID: {result.id}</ListItem>
                <ListItem>Owner: {result.owner_id}</ListItem>
                <ListItem>Domain: {result.domain || "\u2014"}</ListItem>
                <ListItem>
                  <Text noOfLines={1}>
                    Description: {result.description || "\u2014"}
                  </Text>
                </ListItem>
              </Text>
            </List>
          </CardBody>
        </Card>
      ))}
    </Stack>
  );
};

export default CollectionSearch;
