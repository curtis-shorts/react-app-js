import React, { useState } from "react";
import { Box, Input, InputGroup, Stack, Card, CardHeader, CardBody, Text, List, ListItem } from "@chakra-ui/react";
import { useOAuthContext } from "../globus-api/GlobusOAuthProvider";
import { searchGlobusEndpoints } from "../globus-api/searchGlobusEndpoints";

/*
 * Displays an endpoint/collection search menu in a popup on the right side of the screen
 * User inputs a string which all matching endpoints of are called
 * Returns the metadata for the endpoint that the user selects
*/

export const CollectionSearch = ({ onSelect = () => {} }) => {
  const manager = useOAuthContext();
  const [results, setResults] = useState([]);

  // Wrapper to call the Globus API for endpoint searches
  async function handleSearchWrapper(endpointString) {
    // Call the endpoint search API
    const [response, data] = await searchGlobusEndpoints(manager, endpointString, 20)
    
    // Handle empty return case
    if (data !== null){
      setResults(data.DATA)
    } else {
      setResults([])
    }
  }

  // Searches for endpoints that match the string given and displays their metadata in cards
  // Returns the metadata for the endpoint to the calling function when the endpoint's card is selected
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
