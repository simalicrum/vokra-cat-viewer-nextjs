// import { GraphQLClient, gql } from "graphql-request";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";

// const CLIENT_SECRET = process.env.DGRAPH_PROD_CLIENT;
// const FAUNA_GRAPHQL_BASE_URL =
//   "https://throbbing-field-210043.us-west-2.aws.cloud.dgraph.io/graphql";

// const graphQLClient = new GraphQLClient(FAUNA_GRAPHQL_BASE_URL, {
//   headers: {
//     authorization: `Bearer ${CLIENT_SECRET}`,
//   },
// });

const client = new ApolloClient({
  uri: "https://throbbing-field-210043.us-west-2.aws.cloud.dgraph.io/graphql",
  cache: new InMemoryCache(),
});

export const batchedQueries = async (data, fn, batchSize, connections) => {
  const errors = [];
  const responses = [];
  let successes = 0;
  for (let i = 0; i < data.length; i += batchSize * connections) {
    const promises = [];
    for (
      let j = i;
      j < i + batchSize * connections && j < data.length;
      j += batchSize
    ) {
      console.time(`req-batch-${j}`);
      promises.push(fn(data.slice(j, j + batchSize)));
      console.timeEnd(`req-batch-${j}`);
    }
    console.time("settle-promises");
    const resp = await Promise.allSettled(promises).catch((error) => {
      errors.push({
        type: "promise",
        content: JSON.stringify(error),
      });
      console.error(error);
    });
    console.timeEnd("settle-promises");
    if (resp) {
      for (let element of resp) {
        if (element.status === "fulfilled") {
          successes++;
        } else {
          errors.push({
            type: `gql ${fn.name}`,
            content: JSON.stringify(element.reason),
          });
        }
      }
      responses.push(resp);
    }
  }
  return { successes: successes, responses: responses, errors: errors };
};

export const createCats = (cats) => {
  let mutation = gql`
    mutation CreateCats($cats: [AddCatInput!]!) {
      addCat(input: $cats, upsert: true) {
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { cats } });
};

export const updateCats = (cats) => {
  let mutation = gql`
    mutation UpdateCats($cats: UpdateCatInput!) {
      updateCat(input: $cats) {
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { cats } });
};

export const deleteCats = (cats) => {
  let mutation = gql`
    mutation DeleteCats($ids: [ID!]) {
      deleteCat(filter: { InternalID: $ids }) {
        msg
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { cats } });
};

export const getArrayCatIds = (InternalIDs) => {
  let query = gql`
    query GetArrayCatIds($InternalIDs: [String]) {
      queryCat(filter: { InternalID: { in: $InternalIDs } }) {
        Microchips {
          id
        }
        PreviousIds {
          id
        }
        Videos {
          id
        }
      }
    }
  `;
  return client.query({ query: query, variables: { InternalIDs } });
};

export const getInternalCatIds = (InternalIDs) => {
  const query = gql`
    query GetInternalCatIds($InternalIDs: [String]) {
      queryCat(filter: { InternalID: { in: $InternalIDs } }) {
        id
        InternalID
      }
    }
  `;
  return client.query({ query: query, variables: { InternalIDs } });
};

export const getCatByInternalId = (InternalID) => {
  const query = gql`
    query GetCatByInternalId($InternalID: String) {
      getCat(InternalID: $InternalID) {
        Name
        Sex
        Status
        Age
        CoverPhoto
        Photos
        Videos {
          VideoId
          EmbedUrl
          YoutubeUrl
          ThumbUrl
        }
        Breed
        Color
        Pattern
        Description
        Attributes {
          AttributeName
          Publish
          InternalID
        }
        LitterGroupId
        PreviousIds {
          IdValue
          IssuingShelter
          Type
        }
        InternalID
      }
    }
  `;
  return client.query({ query: query, variables: { InternalID } });
};

export const deleteMicrochips = (ids) => {
  let mutation = gql`
    mutation DeleteMicroChips($ids: [ID!]) {
      deleteMicrochip(filter: { id: $ids }) {
        msg
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { ids } });
};

export const deletePreviousIds = (ids) => {
  let mutation = gql`
    mutation DeletePreviousIds($ids: [ID!]) {
      deletePreviousId(filter: { id: $ids }) {
        msg
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { ids } });
};

export const deletePersons = (ids) => {
  let mutation = gql`
    mutation DeletePersons($ids: [ID!]) {
      deletePerson(filter: { id: $ids }) {
        msg
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { ids } });
};

export const deleteVideos = (ids) => {
  let mutation = gql`
    mutation DeleteVideos($ids: [ID!]) {
      deleteVideo(filter: { id: $ids }) {
        msg
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { ids } });
};

export const deleteCatLocation = (InternalIDs) => {
  let mutation = gql`
    mutation DeleteCatLocation($InternalIDs: [Cat]) {
      updateLocation(
        input: { filter: { id: null }, remove: { Cats: $InternalIDs } }
      ) {
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { InternalIDs } });
};

export const deleteCatAdoptionFeeGroup = (InternalIDs) => {
  let mutation = gql`
    mutation DeleteCatAdoptionFeeGroup($InternalIDs: [Cat]) {
      updateAdoptionFeeGroup(
        input: { filter: { Id: null }, remove: { Cats: $InternalIDs } }
      ) {
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { InternalIDs } });
};

export const deleteCatAttributes = (InternalIDs) => {
  let mutation = gql`
    mutation DeleteCatAttributes($InternalIDs: [Cat]) {
      updateAttribute(
        input: { filter: { InternalID: null }, remove: { Cats: $InternalIDs } }
      ) {
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { InternalIDs } });
};

export const addImportEvent = (ImportEvent) => {
  let mutation = gql`
    mutation AddImportEvent($ImportEvent: AddImportEventInput!) {
      addImportEvent(input: [$ImportEvent]) {
        importEvent {
          endTime
          endpoint
          errors {
            content
            type
          }
          imports
          removals
          since
          startTime
          successes
        }
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { ImportEvent } });
};

export const getPublishableAndAdoptedCatsIds = () => {
  const query = gql`
    query GetPublishableAndAdoptedCatsIds {
      queryCat(
        filter: {
          Status: {
            in: [
              "Adoptions: Available (On Website)"
              "Healthy In Home"
              "Adoptions: Contract and Payment (Not on Website)"
              "Adoptions: Viewing (Not on Website)"
              "Adoptions: Available (Not on Website)"
            ]
          }
        }
        order: { desc: LastUpdatedUnixTime }
        first: 1000
      ) {
        InternalID
      }
    }
  `;
  return client.query({ query: query });
};

export const getPublishableCats = () => {
  const query = gql`
    query GetPublishableCats {
      queryCat(
        filter: {
          Status: {
            in: [
              "Adoptions: Available (On Website)"
              "Adoptions: Viewing (On Website)"
            ]
          }
        }
      ) {
        Name
        Sex
        Age
        CoverPhoto
        Photos
        Videos {
          VideoId
          EmbedUrl
          YoutubeUrl
          ThumbUrl
        }
        Breed
        Color
        Pattern
        Description
        Attributes {
          AttributeName
          Publish
          InternalID
        }
        LitterGroupId
        PreviousIds {
          IdValue
          IssuingShelter
          Type
        }
        InternalID
      }
    }
  `;
  return client.query({ query: query });
};

export const getLatestEventTimestamp = () => {
  const query = gql`
    query GetLatestEventTimestamp {
      queryImportEvent(order: { desc: startTime }, first: 1) {
        startTime
      }
    }
  `;
  return client.query({ query: query });
};

export const createPeople = (people) => {
  let mutation = gql`
    mutation CreatePeople($people: [AddPersonInput!]!) {
      addPerson(input: $people, upsert: true) {
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { people } });
};

export const getArrayPersonIds = (InternalIDs) => {
  let query = gql`
    query GetArrayPersonIds($InternalIDs: [String]) {
      queryPerson(filter: { InternalID: { in: $InternalIDs } }) {
        PreviousIds {
          id
        }
      }
    }
  `;
  return client.query({ query: query, variables: { InternalIDs } });
};

export const getInternalPersonIds = (InternalIDs) => {
  const query = gql`
    query GetInternalPersonIds($InternalIDs: [String]) {
      queryPerson(filter: { InternalID: { in: $InternalIDs } }) {
        id
        InternalID
      }
    }
  `;
  return client.query({ query: query, variables: { InternalIDs } });
};

export const createEvents = (events) => {
  let mutation = gql`
    mutation CreateEvents($events: [AddEventInput!]!) {
      addEvent(input: $events, upsert: true) {
        numUids
      }
    }
  `;
  return client.mutate({ mutation: mutation, variables: { events } });
};
