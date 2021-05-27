import Link from "next/link";
import { useContextualRouting } from "next-use-contextual-routing";

export default function Attribute({
  attribute,
  cat,
  cats,
  catBondedID,
  extraClassName,
}) {
  const { makeContextualHref } = useContextualRouting();
  return (
    <li
      key={attribute["Internal-ID"]}
      className={`text-sm rounded-sm m-0.5 px-2 py-1 mt-2 ${extraClassName}`}
    >
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
              key={i.ID}
            >
              <a>
                {" "}
                <span className="underline">{i.Name}</span>
              </a>
            </Link>
          ))}
      </span>
    </li>
  );
}
