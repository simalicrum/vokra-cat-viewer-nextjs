export async function fetcher(url) {
  const res = await fetch(url, {
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

export async function fetchCats(url) {
  let records = 100,
    offset = 0,
    cats = [];
  while (records === 100) {
    let res = await fetcher(`${url}&limit=100&offset=${offset}`);
    cats.push(...res.animals);
    records = res.animals.length;
    offset += 100;
  }
  return cats;
}

export function sanitizeCats(cats) {
  return cats.map((cat) => {
    return {
      Name: cat.Name,
      ID: cat.ID,
      Sex: cat.Sex,
      Age: cat.Age,
      CoverPhoto: cat.CoverPhoto,
      Photos: cat.Photos,
      Videos: cat.Videos,
      Breed: cat.Breed,
      Color: cat.Color,
      Pattern: cat.Pattern === undefined ? null : cat.Pattern,
      Description: cat.Description,
      Attributes: cat.Attributes,
      LitterGroupId: cat.LitterGroupId,
      PreviousIds: cat.PreviousIds,
      "Internal-ID": cat["Internal-ID"],
    };
  });
}
