import { fetchCats } from "../../../../lib/api";
import { createEvent, getLatestEventTimestamp } from "../../../../lib/fauna";
import {
  createCats,
  getInternalIds,
  getArrayIds,
  deleteMicrochips,
  deletePreviousIds,
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
        }

        const foundResp = await getInternalIds(internalIds).catch((error) =>
          console.error(error)
        );

        const arrayIds = await getArrayIds(
          [""].concat(foundResp.queryCat.map((element) => element.InternalID))
        ).catch((error) => console.error(error));

        const previousIds = [];
        const microchips = [];

        for (let i = 0; i < arrayIds.queryCat.length; i++) {
          const previousIdsIds = arrayIds.queryCat[i].PreviousIds.map(
            (element) => element.id
          );
          const microchipIds = arrayIds.queryCat[i].Microchips.map(
            (element) => element.id
          );
          previousIds.push(...previousIdsIds);
          microchips.push(...microchipIds);
        }

        const errors = [];
        let attributesDeleted = 0;

        let successes = 0;

        const deletePreviousIdsResp = batchedQueries(
          previousIds,
          deletePreviousIds,
          200,
          4
        );

        const deleteMicrochipsResp = batchedQueries(
          microchips,
          deleteMicrochips,
          200,
          4
        );

        const createCatsResp = batchedQueries(cats, createCats, 200, 4);

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
