import { GraphQLClient, gql } from "graphql-request";

const CLIENT_SECRET =
  process.env.FAUNA_ADMIN_KEY || process.env.FAUNA_CLIENT_SECRET;
const FAUNA_GRAPHQL_BASE_URL = "https://graphql.fauna.com/graphql";

const graphQLClient = new GraphQLClient(FAUNA_GRAPHQL_BASE_URL, {
  headers: {
    authorization: `Bearer ${CLIENT_SECRET}`,
  },
});

export const listCats = () => {
  const query = gql`
    query AllCatsQuery {
      allCats {
        data {
          Name
          ID
          InternalID
          LitterGroupId
          Type
          CurrentLocation {
            Tier1
            Tier2
            Tier3
          }
          Sex
          Status
          InFoster
          AssociatedPerson {
            FirstName
            LastName
            OutDateUnixTime
            RelationshipType
          }
          CurrentWeightPounds
          Size
          Altered
          DOBUnixTime
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
          AdoptionFeeGroup {
            Id
            Name
            Price
            Discount
            Tax
          }
          Description
          PreviousIds {
            IdValue
            IssuingShelter
            Type
          }
          Microchips {
            Id
            Issuer
            ImplantUnixTime
          }
          LastIntakeUnixTime
          LastUpdatedUnixTime
          Attributes {
            AttributeName
            Publish
            InternalID
          }
        }
      }
    }
  `;

  return graphQLClient.request(query);
};

export const createCat = (newEntry) => {
  const mutation = gql`
    mutation CreateCat($input: CatInput!) {
      createCat(data: $input) {
        Name
        ID
        InternalID
        LitterGroupId
        Type
        CurrentLocation {
          Tier1
          Tier2
          Tier3
        }
        Sex
        Status
        InFoster
        AssociatedPerson {
          FirstName
          LastName
          OutDateUnixTime
          RelationshipType
        }
        CurrentWeightPounds
        Size
        Altered
        DOBUnixTime
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
        AdoptionFeeGroup {
          Id
          Name
          Price
          Discount
          Tax
        }
        Description
        PreviousIds {
          IdValue
          IssuingShelter
          Type
        }
        Microchips {
          Id
          Issuer
          ImplantUnixTime
        }
        LastIntakeUnixTime
        LastUpdatedUnixTime
        Attributes {
          data {
            AttributeName
            Publish
            InternalID
          }
        }
      }
    }
  `;
  return graphQLClient.request(mutation, { input: newEntry });
};

export const findCat = (InternalID) => {
  const query = gql`
    query FindCat($InternalID: String) {
      findCatByInternalId(InternalID: $InternalID) {
        InternalID
      }
    }
  `;
  return graphQLClient.request(query, { InternalID });
};

export const getInternalIds = (internalIDs) => {
  const query = gql`
    query FindCats($InternalIDs: [String]) {
      findCatsByInternalIds(InternalIDs: $InternalIDs) {
        _id
        InternalID
      }
    }
  `;
  return graphQLClient.request(query, { InternalIDs: internalIDs });
};

export const updateCat = (id, newEntry) => {
  const mutation = gql`
    mutation UpdateCat($id: ID!, $input: CatInput!) {
      updateCat(id: $id, data: $input) {
        Name
        ID
        InternalID
        LitterGroupId
        Type
        CurrentLocation {
          Tier1
          Tier2
          Tier3
        }
        Sex
        Status
        InFoster
        AssociatedPerson {
          FirstName
          LastName
          OutDateUnixTime
          RelationshipType
        }
        CurrentWeightPounds
        Size
        Altered
        DOBUnixTime
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
        AdoptionFeeGroup {
          Id
          Name
          Price
          Discount
          Tax
        }
        Description
        PreviousIds {
          IdValue
          IssuingShelter
          Type
        }
        Microchips {
          Id
          Issuer
          ImplantUnixTime
        }
        LastIntakeUnixTime
        LastUpdatedUnixTime
        Attributes {
          data {
            AttributeName
            Publish
            InternalID
          }
        }
      }
    }
  `;
  return graphQLClient.request(mutation, { id: id, input: newEntry });
};

export const createEvent = (newEntry) => {
  const query = gql`
    mutation CreateEvent($input: EventInput!) {
      createEvent(data: $input) {
        since
        startTime
        endTime
        tries
        successes
        errors {
          type
          cat
          content
        }
      }
    }
  `;
  return graphQLClient.request(query, { input: newEntry });
};

export const getLatestEventTimestamp = () => {
  const query = gql`
    query {
      getLatestEventTimestamp
    }
  `;
  return graphQLClient.request(query);
};

export const getPublishableCats = () => {
  const query = gql`
    query FindCatsByStatuses {
      findCatsByStatuses(
        Statuses: [
          "Adoptions: Available (On Website)"
          "Adoptions: Viewing (On Website)"
        ]
      ) {
        Name
        ID
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
  return graphQLClient.request(query);
};

export const getPublishableAndAdoptedCatsIds = () => {
  const query = gql`
    query FindCatsByStatuses {
      findCatsByStatuses(
        Statuses: [
          "Adoptions: Available (On Website)"
          "Healthy In Home"
          "Adoptions: Contract and Payment (Not on Website)"
          "Adoptions: Viewing (Not on Website)"
          "Adoptions: Available (Not on Website)"
        ]
      ) {
        InternalID
      }
    }
  `;
  return graphQLClient.request(query);
};

export const getPublishableAndAdoptedCats = () => {
  const query = gql`
    query FindCatsByStatuses {
      findCatsByStatuses(
        Statuses: [
          "Adoptions: Available (On Website)"
          "Healthy In Home"
          "Adoptions: Contract and Payment (Not on Website)"
          "Adoptions: Viewing (Not on Website)"
          "Adoptions: Available (Not on Website)"
        ]
      ) {
        Name
        ID
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
  return graphQLClient.request(query);
};

export const getCatByInternalId = (InternalID) => {
  const query = gql`
    query FindCatByInternalId($InternalID: String) {
      findCatByInternalId(InternalID: $InternalID) {
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

export const deleteAttributesByCat = (ID) => {
  const query = gql`
    mutation DeleteAttributesByCat($ID: String) {
      deleteAttributesByCat(ID: $ID) {
        AttributeName
        Publish
        InternalID
      }
    }
  `;
  return graphQLClient.request(query, { ID });
};
