import { fetchCats } from "../../../../lib/api";
import {
  createCat,
  updateCat,
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
        const foundResp = await getInternalIds(internalIds).catch((error) =>
          console.error(error)
        );
        const found = new Map();

        foundResp.findCatsByInternalIds.forEach((element) =>
          found.set(element.InternalID, element._id)
        );

        const creates = [];
        const updates = [];

        for (let i = 0; i < cats.length; i++) {
          if (found.has(cats[i].InternalID)) {
            updates.push({
              id: found.get(cats[i].InternalID),
              input: cats[i],
            });
          } else {
            creates.push(cats[i]);
          }
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
