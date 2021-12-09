import FETCH_URL from "../config/api";
import queryFetch from "./query-fetch";

export async function fetcher(url) {
  const res = await queryFetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": process.env.API_KEY,
    },
  });
  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return json;
}

export async function fetchCats(url, status = "", since = "") {
  let offset = 100,
    cats = [],
    totalCount,
    promises = [];
  let res = await fetcher(
    `${url}?limit=100&status_type=${status}&since=${since}`
  );
  totalCount = res.total_count;
  cats.push(...res.animals);
  while (offset < totalCount) {
    promises.push(
      fetcher(
        `${url}?limit=100&offset=${offset}&status_type=${status}&since=${since}`
      )
    );
    offset += 100;
  }
  const moreCats = await Promise.all(promises).then((res) => {
    res.forEach((element) => cats.push(...element.animals));
  });
  return cats;
}

export function sanitizeCat(cat) {
  if (cat.error_message) {
    return cat;
  }
  return {
    Name: cat.Name === undefined ? null : cat.Name,
    ID: cat.ID === undefined ? null : cat.ID,
    Sex: cat.Sex === undefined ? null : cat.Sex,
    Age: cat.Age === undefined ? null : cat.Age,
    CoverPhoto: cat.CoverPhoto === undefined ? null : cat.CoverPhoto,
    Photos: cat.Photos === undefined ? [] : cat.Photos,
    Videos: cat.Videos === undefined ? [] : cat.Videos,
    Breed: cat.Breed === undefined ? null : cat.Breed,
    Color: cat.Color === undefined ? null : cat.Color,
    Pattern: cat.Pattern === undefined ? null : cat.Pattern,
    Description: cat.Description === undefined ? null : cat.Description,
    Attributes: cat.Attributes === undefined ? [] : cat.Attributes,
    LitterGroupId: cat.LitterGroupId === undefined ? null : cat.LitterGroupId,
    PreviousIds: cat.PreviousIds === undefined ? [] : cat.PreviousIds,
    "Internal-ID": cat["Internal-ID"] === undefined ? [] : cat["Internal-ID"],
  };
}

export function sanitizeCats(cats) {
  return cats.map((cat) => sanitizeCat(cat));
}

export async function returnCats() {
  const dirtyCats = await fetchCats(FETCH_URL, "publishable");
  const cats = sanitizeCats(dirtyCats);
  return cats;
}

export async function returnCatsInCustody() {
  const dirtyCats = await fetchCats(FETCH_URL, "in%20custody");
  const cats = await sanitizeCats(dirtyCats);
  return cats;
}

export async function returnCat(catId) {
  let adopted, cat;
  const dirtyCat = await fetcher(`${FETCH_URL}/${catId}`);
  if (
    dirtyCat.Status === "Healthy In Home" ||
    dirtyCat.Status === "Adoptions: Contract and Payment (Not on Website)" ||
    dirtyCat.Status === "Adoptions: Viewing (Not on Website)"
  ) {
    adopted = true;
  }
  const cleanCat = sanitizeCat(dirtyCat);
  if (adopted === true) {
    cat = { ...cleanCat, Adopted: true };
  } else {
    cat = cleanCat;
  }
  return cat;
}

export async function returnAdoptedCats() {
  const sixMonthsAgo = Math.floor(Date.now() / 1000) - 15552000;
  const dirtyCats = await fetchCats(
    FETCH_URL,
    "",
    `${sixMonthsAgo}&sort=updated_at`
  );
  const adoptedDirtyCats = dirtyCats.filter(
    (cat) =>
      cat.Status === "Healthy In Home" ||
      cat.Status === "Adoptions: Contract and Payment (Not on Website)" ||
      cat.Status === "Adoptions: Viewing (Not on Website)"
  );
  const adoptedCats = sanitizeCats(adoptedDirtyCats).map((cat) => {
    return { ...cat, Adopted: true };
  });
  return adoptedCats;
}
