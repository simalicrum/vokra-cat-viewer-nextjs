import Link from "next/link";
import { useContextualRouting } from "next-use-contextual-routing";

export default function Attributes({ cats, cat }) {
  const { makeContextualHref } = useContextualRouting();
  const catBondedID = (thing) => {
    return thing.PreviousIds.filter((i) => i.Type === "Visibility").map(
      (i) => i.IdValue
    );
  };
  return (
    <ul className="m-4 flex">
      {cat.Attributes.filter((attribute) => attribute.Publish === "Yes").map(
        (attribute) => (
          <li key={attribute["Internal-ID"]} className="bg-gray-200 text-gray-600 text-sm rounded-sm m-0.5 px-2 py-1 mt-2">
            {attribute.AttributeName === "Bonded"
              ? "Bonded to "
              : attribute.AttributeName}
            <span className="space-x-1">
              {cats
                .filter(
                  (i) =>
                    catBondedID(i).some((j) => j === cat["Internal-ID"]) &&
                    attribute.AttributeName === "Bonded"
                )
                .map((i) => (
                  <Link
                    href={makeContextualHref({ catId: i.ID })}
                    as={`/cat/${i.ID}`}
                  >
                    <a>
                      {" "}
                      <span className="underline">{i.Name}</span>
                    </a>
                  </Link>
                ))}
            </span>
          </li>
        )
      )}
    </ul>
  );
}
