import { fetchEvents } from "../../../../lib/api";
import {
  createEvents,
  batchedQueries,
  addImportEvent,
} from "../../../../lib/dgraph";

import { EVENTS_FETCH_URL } from "../../../../config/api";

export default async function handler(req, res) {
  try {
    if (!req.headers.action_key) {
      res.status(401).json("Access key required");
    } else {
      if (req.headers.action_key === process.env.APP_KEY) {
        const startTime = Math.floor(Date.now() / 1000);
        console.time("Shelterluv fetch");

        const eventsRaw = await fetchEvents(EVENTS_FETCH_URL);

        var previousEvent;

        var events = [];

        for (let event of eventsRaw) {
          for (let record of event.AssociatedRecords) {
            if (record.Type === "Person") {
              event.Person = { InternalID: record.Id };
            }
            if (record.Type === "Animal") {
              event.Cat = { InternalID: record.Id };
            }
          }
          delete event.AssociatedRecords;
          event.id = JSON.stringify(event);
          if (previousEvent) {
            if (previousEvent.id !== event.id) {
              events.push(event);
            }
          }
          previousEvent = event;
        }
        console.timeEnd("Shelterluv fetch");
        // createEvents mutation re-creates relationships from nested objects
        console.time("createEvent");
        const createEventsResp = await batchedQueries(
          events,
          createEvents,
          2000,
          10
        );
        console.timeEnd("createEvent");

        const errors = [].concat(...createEventsResp.errors);

        const successes = createEventsResp.successes;

        const respEvent = await addImportEvent({
          endTime: Math.floor(Date.now() / 1000),
          endpoint: "api/people/import",
          errors,
          imports: events.length,
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
