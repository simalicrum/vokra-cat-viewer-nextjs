import { fetchPeople } from "../../../../lib/api";
import {
  createPeople,
  getInternalPersonIds,
  getArrayPersonIds,
  deletePreviousIds,
  batchedQueries,
  addImportEvent,
} from "../../../../lib/dgraph";

import { PEOPLE_FETCH_URL } from "../../../../config/api";

export default async function handler(req, res) {
  try {
    if (!req.headers.action_key) {
      res.status(401).json("Access key required");
    } else {
      if (req.headers.action_key === process.env.APP_KEY) {
        const startTime = Math.floor(Date.now() / 1000);
        console.time("Shelterluv fetch");

        const peopleRaw = await fetchPeople(PEOPLE_FETCH_URL);

        // Person object refactored to conform to graph schema

        var previousPerson;

        var people = [];

        for (let person of peopleRaw) {
          delete Object.assign(person, {
            ["InternalID"]: person["Internal-ID"],
          })["Internal-ID"];
          delete Object.assign(person, { ["OrgId"]: person["ID"] })["ID"];
          delete person.Animal_ids;
          if (previousPerson) {
            if (previousPerson.InternalID !== person.InternalID) {
              people.push(person);
            }
          }
          previousPerson = person;
        }
        const internalIds = people.map((element) => element.InternalID);

        console.timeEnd("Shelterluv fetch");
        console.time("getInternalPersonIds");
        const foundResp = await getInternalPersonIds(
          [""].concat(internalIds)
        ).catch((error) => console.error(error));
        console.timeEnd("getInternalPersonIds");
        console.time("foundResp.queryPerson");

        let found = [];

        if (foundResp.queryPerson) {
          found = foundResp.queryPerson.map((element) => element.InternalID);
        }
        console.timeEnd("foundResp.queryPerson");
        console.time("getArrayPersonIds");
        const arrayIds = await getArrayPersonIds([""].concat(found)).catch(
          (error) => console.error(error)
        );
        console.timeEnd("getArrayPersonIds");
        // Find and remove one-to-one nodes from [Person]

        const previousIds = [];

        for (let i = 0; i < arrayIds.queryPerson.length; i++) {
          const previousIdsIds = arrayIds.queryPerson[i].PreviousIds.map(
            (element) => element.id
          );
          previousIds.push(...previousIdsIds);
        }

        // Remove one-to-one nodes from [Person]
        console.time("one-to-one");
        const deletePreviousIdsResp = await batchedQueries(
          previousIds,
          deletePreviousIds,
          200,
          1
        );
        console.timeEnd("one-to-one");

        // createPeople mutation re-creates relationships from nested objects
        console.time("createPeople");
        const createPeopleResp = await batchedQueries(
          people,
          createPeople,
          200,
          1
        );
        console.timeEnd("createPeople");

        const errors = [].concat(
          ...deletePreviousIdsResp.errors,
          ...createPeopleResp.errors
        );

        const successes =
          deletePreviousIdsResp.successes + createPeopleResp.successes;

        const respEvent = await addImportEvent({
          endTime: Math.floor(Date.now() / 1000),
          endpoint: "api/people/import",
          errors,
          imports: people.length,
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
