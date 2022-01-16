import { fetchCats } from "../../../../lib/api";
import { createEvent, getLatestEventTimestamp } from "../../../../lib/fauna";
import {
  createCats,
  getInternalIds,
  getArrayIds,
  deleteCatEdges,
  deleteMicrochips,
  deletePreviousIds,
  deletePersons,
  deleteVideos,
  batchedQueries,
} from "../../../../lib/dgraph";

import FETCH_URL from "../../../../config/api";

export default async function handler(req, res) {
  try {
    if (!req.headers.action_key) {
      res.status(401).json("Access key required");
    } else {
      if (req.headers.action_key === process.env.APP_KEY) {
        const startTime = Math.floor(Date.now() / 1000);

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
          }
          delete cat.AssociatedPerson;
        }

        const foundResp = await getInternalIds(internalIds).catch((error) =>
          console.error(error)
        );

        const found = foundResp.queryCat.map((element) => element.InternalID);

        const arrayIds = await getArrayIds([""].concat(found)).catch((error) =>
          console.error(error)
        );

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

        const errors = [];
        let attributesDeleted = 0;

        let successes = 0;

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

        const createCatsResp = await batchedQueries(cats, createCats, 100, 1);

        const respEvent = await createEvent({
          since,
          startTime,
          endTime: Math.floor(Date.now() / 1000),
          tries: cats.length,
          successes,
          attributesDeleted,
          errors,
        });
        res.status(200).json(respEvent.createEvent);
      } else {
        res.status(401);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
