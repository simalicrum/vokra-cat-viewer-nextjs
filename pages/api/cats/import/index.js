import { fetchCats } from "../../../../lib/api";
import {
  createCat,
  updateCat,
  deleteAttributesByCat,
  deleteAttributesByCats,
  getInternalIds,
  createEvent,
  getLatestEventTimestamp,
} from "../../../../lib/fauna";
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
          if (cat.Attributes) {
            const fixedAttributes = cat.Attributes.map((element) => {
              return {
                InternalID: element["Internal-ID"],
                AttributeName: element.AttributeName,
                Publish: element.Publish,
              };
            });
            cat.Attributes = { create: fixedAttributes };
          }
          if (cat.CurrentLocation === null) {
            delete cat.CurrentLocation;
          }
        }
        console.time("getInternalIds");
        const foundResp = await getInternalIds(internalIds).catch((error) =>
          console.error(error)
        );
        const found = new Map();

        foundResp.findCatsByInternalIds.forEach((element) =>
          found.set(element.InternalID, element._id)
        );
        console.timeEnd("getInternalIds");
        const deletes = [];
        const creates = [];
        const updates = [];

        for (let i = 0; i < cats.length; i++) {
          if (found.has(cats[i].InternalID)) {
            updates.push({
              id: found.get(cats[i].InternalID),
              input: cats[i],
            });
            deletes.push(found.get(cats[i].InternalID));
          } else {
            creates.push(cats[i]);
          }
        }

        const errors = [];
        let attributesDeleted = 0;
        console.time("deleteAttributesByCat");
        for (let i = 0; i < deletes.length; i += 800) {
          const promises = [];

          for (let j = i; j < i + 800 && j < deletes.length; j++) {
            promises.push(deleteAttributesByCats([deletes[j]]));
          }
          console.time("delete resp" + i);
          const resp = await Promise.allSettled(promises).catch((error) => {
            errors.push({
              type: "promise",
              content: JSON.stringify(error),
            });
            console.error(error);
          });
          console.timeEnd("delete resp" + i);
          if (resp) {
            for (let element of resp) {
              if (element.status === "fulfilled") {
                attributesDeleted++;
              } else {
                errors.push({
                  type: "gql",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }
        console.timeEnd("deleteAttributesByCat");
        let successes = 0;
        console.time("createCat");
        for (let i = 0; i < creates.length; i += 800) {
          const promises = [];

          for (let j = i; j < i + 800 && j < creates.length; j++) {
            promises.push(createCat(creates[j]));
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
                  type: "gql",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }
        console.timeEnd("createCat");
        console.time("updateCat");
        for (let i = 0; i < updates.length; i += 800) {
          const promises = [];

          for (let j = i; j < i + 800 && j < updates.length; j++) {
            promises.push(updateCat(updates[j].id, updates[j].input));
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
                  type: "gql",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }
        console.timeEnd("updateCat");
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
