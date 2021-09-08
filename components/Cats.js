import { useState, useEffect } from "react";

import { useRouter } from "next/router";
import { useContextualRouting } from "next-use-contextual-routing";
import Link from "next/link";
import CatDetails from "./CatDetails";
import CatCard from "./CatCard";

export default function Cats({
  cats,
  breeds,
  colors,
  ages,
  sexes,
  attributes,
  name,
}) {
  const router = useRouter();
  const { makeContextualHref, returnHref } = useContextualRouting();
  const [catsDisplay, setCatsDisplay] = useState("relative");
  const convertAge = (age) => {
    if (age < 12) {
      return "Kitten (< 1 year)";
    }
    if (age < 96) {
      return "Adult (1-8 years)";
    }
    return "Senior (8+ years)";
  };
  const compareAttributes = (attributesParam) =>
    attributes.every((attribute) =>
      attributesParam
        .filter((i) => i.Publish === "Yes")
        .map((i) => i.AttributeName)
        .includes(attribute.value)
    );
  useEffect(() => {
    if (router.query.catId) {
      setCatsDisplay("hidden");
    } else {
      setCatsDisplay("fixed");
    }
  }, [router.query.catId]);
  return (
    <>
      {router.query.catId ? (
        <CatDetails
          cats={cats}
          cat={cats.find((cat) => cat.ID === router.query.catId)}
          returnHref={returnHref}
          position="fixed"
        />
      ) : (
        ""
      )}
      <div
        className={`grid md:grid-cols-2 md:top-24 top-48 md:p-4 gap-6 overflow-y-scroll h-main ${catsDisplay} bg-vokra-gray`}
      >
        {cats
          .filter(
            (cat) =>
              breeds === null ||
              cat.Breed === (`Domestic ${breeds.value}` || "")
          )
          .filter((cat) => colors === null || cat.Color.includes(colors.value))
          .filter(
            (cat) => ages === null || convertAge(cat.Age) === (ages.value || "")
          )
          .filter((cat) => sexes === null || cat.Sex === (sexes.value || ""))
          .filter(
            (cat) =>
              attributes.length === 0 ||
              (attributes !== null ? compareAttributes(cat.Attributes) : [])
          )
          .filter((cat) =>
            cat.Name.toLowerCase().includes(name.target.value.toLowerCase())
          )
          .map((cat) => (
            <Link
              key={cat.ID}
              href={makeContextualHref({ catId: cat.ID })}
              as={`/cat/${cat.ID}`}
            >
              <a>
                <CatCard cat={cat} key={cat.ID} />
              </a>
            </Link>
          ))}
      </div>
    </>
  );
}
