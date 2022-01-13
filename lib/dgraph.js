import { GraphQLClient, gql } from "graphql-request";

const CLIENT_SECRET = process.env.DGRAPH_PROD_CLIENT;
const FAUNA_GRAPHQL_BASE_URL =
  "https://throbbing-field-210043.us-west-2.aws.cloud.dgraph.io/graphql";

const graphQLClient = new GraphQLClient(FAUNA_GRAPHQL_BASE_URL, {
  headers: {
    authorization: `Bearer ${CLIENT_SECRET}`,
  },
});

export const createCats = (cats) => {
  let requests = gql`
    mutation AddCats($cats: [AddCatInput!]!) {
      addCat(input: $cats, upsert: true) {
        numUids
      }
    }
  `;
  return graphQLClient.request(requests, { cats });
};

export const updateCats = (cats) => {
  let requests = gql`
    mutation UpdateCats($cats: UpdateCatInput!) {
      updateCat(input: $cats) {
        numUids
      }
    }
  `;
  return graphQLClient.request(requests, { cats });
};

export const deleteCats = (cats) => {
  let query = gql`
    mutation deleteCats($ids: [ID!]) {
      deleteCat(filter: { InternalID: $ids }) {
        msg
        numUids
      }
    }
  `;
  return graphQLClient.request(query, { cats });
};

export const getArrayIds = (InternalIDs) => {
  let query = gql`
    query getArrayIds($InternalIDs: [String]) {
      queryCat(filter: { InternalID: { in: $InternalIDs } }) {
        Microchips {
          id
        }
        PreviousIds {
          id
        }
      }
    }
  `;
  return graphQLClient.request(query, { InternalIDs });
};

export const getInternalIds = (InternalIDs) => {
  const query = gql`
    query getCatByInternalId($InternalIDs: [String]) {
      queryCat(filter: { InternalID: { in: $InternalIDs } }) {
        id
        InternalID
      }
    }
  `;
  return graphQLClient.request(query, { InternalIDs });
};

export const getCatByInternalId = (InternalID) => {
  const query = gql`
    query getCatByInternalId($InternalID: String) {
      getCat(InternalID: $InternalID) {
        Name
        ID
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
  return graphQLClient.request(query, { InternalID });
};

export const deleteMicrochips = (ids) => {
  let query = gql`
    mutation DeleteMicroChips($ids: [ID!]) {
      deleteMicrochip(filter: { id: $ids }) {
        msg
        numUids
      }
    }
  `;
  return graphQLClient.request(query, { ids });
};

export const deletePreviousIds = (ids) => {
  let query = gql`
    mutation DeletePreviousIds($ids: [ID!]) {
      deletePreviousId(filter: { id: $ids }) {
        msg
        numUids
      }
    }
  `;
  return graphQLClient.request(query, { ids });
};
