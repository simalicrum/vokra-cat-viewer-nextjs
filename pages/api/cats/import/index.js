import { fetchCats } from "../../../../lib/api";
import {
  createCat,
  updateCat,
  deleteAttributesByCat,
  getInternalIds,
  createEvent,
  getLatestEventTimestamp,
} from "../../../../lib/fauna";
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

        var attributesAdded = 0;

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
            attributesAdded += fixedAttributes.length;
            cat.Attributes = { create: fixedAttributes };
          }
          if (cat.CurrentLocation === null) {
            delete cat.CurrentLocation;
          }
        }
        console.log("attributesAdded: ", attributesAdded);
        const foundResp = await getInternalIds(internalIds).catch((error) =>
          console.error(error)
        );
        const found = new Map();

        foundResp.findCatsByInternalIds.forEach((element) =>
          found.set(element.InternalID, element._id)
        );

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
        let deletePromises = [];
        for (let i = 0; i < deletes.length; i++) {
          deletePromises.push(deleteAttributesByCat(deletes[i]));
        }
        let promises = [];
        for (let i = 0; i < creates.length; i++) {
          promises.push(createCat(creates[i]));
        }
        for (let i = 0; i < updates.length; i++) {
          promises.push(updateCat(updates[i].id, updates[i].input));
        }

        let errors = [];
        let successes = 0;
        let attributesDeleted = 0;

        for (let i = 0; i < deletePromises.length; i += 100) {
          const batch = deletePromises.slice(i, i + 100);
          const resp = await Promise.allSettled(batch).catch((error) => {
            errors.push({
              type: "promise",
              content: JSON.stringify(error),
            });
            console.error(error);
          });
          if (resp) {
            for (let element of resp) {
              if (element.status === "fulfilled") {
                attributesDeleted += element.value.deleteAttributesByCat.length;
              } else {
                errors.push({
                  type: "gql",
                  content: JSON.stringify(element.reason),
                });
              }
            }
          }
        }

        for (let i = 0; i < promises.length; i += 100) {
          const batch = promises.slice(i, i + 100);
          const resp = await Promise.allSettled(batch).catch((error) => {
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
    res.status(500).json({ error: error });
  }
}
