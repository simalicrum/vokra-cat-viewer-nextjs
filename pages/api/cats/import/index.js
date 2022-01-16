import { fetchCats } from "../../../../lib/api";
import { createEvent, getLatestEventTimestamp } from "../../../../lib/fauna";
import {
  createCats,
  getInternalIds,
  getArrayIds,
  deleteMicrochips,
  deletePreviousIds,
  deleteVideos,
  deleteCatLocation,
  deleteCatAdoptionFeeGroup,
  deleteCatAttributes,
  batchedQueries,
  addImportEvent,
} from "../../../../lib/dgraph";

import FETCH_URL from "../../../../config/api";

export default async function handler(req, res) {
  try {
    if (!req.headers.action_key) {
      res.status(401).json("Access key required");
    } else {
      if (req.headers.action_key === process.env.APP_KEY) {
        const startTime = Math.floor(Date.now() / 1000);
        console.time("Shelterluv fetch");
        let since;
        if (req.body.since) {
          since = req.body.since;
        } else {
          const resp = await getLatestEventTimestamp();
          since = resp.getLatestEventTimestamp;
        }

        const cats = await fetchCats(FETCH_URL, "", since);
        const internalIds = cats.map((element) => element["Internal-ID"]);

        for (let cat of cats) {
          delete Object.assign(cat, { ["InternalID"]: cat["Internal-ID"] })[
            "Internal-ID"
          ];
          delete Object.assign(cat, { ["Id"]: cat["ID"] })["ID"];
          if (cat.Attributes) {
            const fixedAttributes = cat.Attributes.map((element) => {
              return {
                InternalID: element["Internal-ID"],
                AttributeName: element.AttributeName,
                Publish: element.Publish,
              };
            });
            cat.Attributes = fixedAttributes;
          }
          if (cat.CurrentLocation === null) {
            delete cat.CurrentLocation;
          } else {
            if (cat.CurrentLocation) {
              cat.CurrentLocation.id = cat.CurrentLocation.Tier1;
              if (cat.CurrentLocation.Tier2) {
                cat.CurrentLocation.id += cat.CurrentLocation.Tier2;
              }
            }
          }
          delete cat.AssociatedPerson;
        }
        console.timeEnd("Shelterluv fetch");
        console.time("getInternalIds");
        const foundResp = await getInternalIds(internalIds).catch((error) =>
          console.error(error)
        );
        console.timeEnd("getInternalIds");
        console.time("foundResp.queryCat");
        const found = foundResp.queryCat.map((element) => element.InternalID);
        console.timeEnd("foundResp.queryCat");
        console.time("getArrayIds");
        const arrayIds = await getArrayIds([""].concat(found)).catch((error) =>
          console.error(error)
        );
        console.timeEnd("getArrayIds");
        // Find and remove one-to-one nodes from [Cat]

        const previousIds = [];
        const microchips = [];
        const videos = [];

        for (let i = 0; i < arrayIds.queryCat.length; i++) {
          const previousIdsIds = arrayIds.queryCat[i].PreviousIds.map(
            (element) => element.id
          );
          const microchipIds = arrayIds.queryCat[i].Microchips.map(
            (element) => element.id
          );
          const videosIds = arrayIds.queryCat[i].Videos.map(
            (element) => element.id
          );
          previousIds.push(...previousIdsIds);
          microchips.push(...microchipIds);
          videos.push(...videosIds);
        }

        // Remove one-to-one nodes from [Cat]
        console.time("one-to-one");

        const deletePreviousIdsResp = await batchedQueries(
          previousIds,
          deletePreviousIds,
          100,
          1
        );

        const deleteMicrochipsResp = await batchedQueries(
          microchips,
          deleteMicrochips,
          100,
          1
        );

        const videosResp = await batchedQueries(videos, deleteVideos, 100, 1);
        console.timeEnd("one-to-one");

        // Remove one-to-many Cat nodes from Location and AdoptionFeeGroup
        console.time("one-to-many");
        const deleteCatLocationResp = await batchedQueries(
          foundResp,
          deleteCatLocation,
          100,
          1
        );

        const deleteCatAdoptionFeeGroupResp = await batchedQueries(
          foundResp,
          deleteCatAdoptionFeeGroup,
          100,
          1
        );
        console.timeEnd("one-to-many");
        // Remove many-to-many Cat nodes from Attributes
        console.time("many-to-many");
        const deleteCatAttributesResp = await batchedQueries(
          foundResp,
          deleteCatAttributes,
          100,
          1
        );
        console.timeEnd("many-to-many");
        // createCat mutation re-creates relationships from nested objects
        console.time("createCats");
        const createCatsResp = await batchedQueries(cats, createCats, 100, 1);
        console.timeEnd("createCats");

        const errors = [].concat(
          ...deletePreviousIdsResp.errors,
          ...deleteMicrochipsResp.errors,
          ...videosResp.errors,
          ...deleteCatLocationResp.errors,
          ...deleteCatAdoptionFeeGroupResp.errors,
          ...deleteCatAttributesResp.errors,
          ...createCatsResp.errors
        );

        const successes =
          deletePreviousIdsResp.successes +
          deleteMicrochipsResp.successes +
          videosResp.successes +
          deleteCatLocationResp.successes +
          deleteCatAdoptionFeeGroupResp.successes +
          deleteCatAttributesResp.successes +
          createCatsResp.successes;

        const respEvent = await addImportEvent({
          endTime: Math.floor(Date.now() / 1000),
          endpoint: "api/cats/import",
          errors,
          imports: cats.length,
          since,
          startTime,
          successes,
        });
        res.status(200).json(respEvent.addImportEvent);
      } else {
        res.status(401);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
