import { fetchCats } from "../../../../lib/api";
import { createEvent, getLatestEventTimestamp } from "../../../../lib/fauna";
import {
  createCats,
  getInternalIds,
  getArrayIds,
  deleteMicrochips,
} from "../../../../lib/dgraph";

import FETCH_URL from "../../../../config/api";

export default async function handler(req, res) {
  try {
    console.time("fetch");
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
        console.timeEnd("fetch");
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
          foundResp.queryCat.map((element) => element.InternalID)
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

        const creates = [];

        for (let i = 0; i < cats.length; i++) {
          creates.push(cats[i]);
        }

        const errors = [];
        let attributesDeleted = 0;

        let successes = 0;

        console.time("deleteMicrochips");
        for (let i = 0; i < microchips.length; i += 800) {
          const promises = [];

          for (let j = i; j < i + 800 && j < microchips.length; j += 200) {
            promises.push(deleteMicrochips(microchips.slice(j, j + 200)));
          }
          const resp = await Promise.allSettled(promises).catch((error) => {
            errors.push({
              type: "promise",
              content: JSON.stringify(error),
            });
            console.error(error);
          });
          if (resp) {
            for (let element of resp) {
              if (element.status === "fulfilled") {
                successes++;
              } else {
                errors.push({
                  type: "gql deleteMicrochips",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }
        console.timeEnd("deleteMicrochips");

        console.time("deletePreviousIds");
        for (let i = 0; i < previousIds.length; i += 800) {
          const promises = [];

          for (let j = i; j < i + 800 && j < previousIds.length; j += 200) {
            promises.push(deleteMicrochips(previousIds.slice(j, j + 200)));
          }
          const resp = await Promise.allSettled(promises).catch((error) => {
            errors.push({
              type: "promise",
              content: JSON.stringify(error),
            });
            console.error(error);
          });
          if (resp) {
            for (let element of resp) {
              if (element.status === "fulfilled") {
                successes++;
              } else {
                errors.push({
                  type: "gql deletePreviousIds",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }
        console.timeEnd("deletePreviousIds");

        const catIds = console.time("deleteCats");
        for (let i = 0; i < arrayIds.length; i += 800) {
          const promises = [];

          for (let j = i; j < i + 800 && j < arrayIds.length; j += 200) {
            promises.push(deleteCats(arrayIds.slice(j, j + 200)));
          }
          const resp = await Promise.allSettled(promises).catch((error) => {
            errors.push({
              type: "promise",
              content: JSON.stringify(error),
            });
            console.error(error);
          });
          if (resp) {
            for (let element of resp) {
              if (element.status === "fulfilled") {
                successes++;
              } else {
                errors.push({
                  type: "gql deleteCats",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }
        console.timeEnd("deleteCats");

        console.time("createCat");
        for (let i = 0; i < creates.length; i += 400) {
          const promises = [];

          for (let j = i; j < i + 400 && j < creates.length; j += 200) {
            promises.push(createCats(creates.slice(j, j + 200)));
          }

          const resp = await Promise.allSettled(promises).catch((error) => {
            errors.push({
              type: "promise",
              content: JSON.stringify(error),
            });
            console.error(error);
          });
          if (resp) {
            for (let element of resp) {
              if (element.status === "fulfilled") {
                successes++;
              } else {
                errors.push({
                  type: "gql createCats",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }
        console.timeEnd("createCat");
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
