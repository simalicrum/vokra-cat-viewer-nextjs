import Title from "./Title";
import Subtitle from "./Subtitle";
import Details from "./Details";
import CatDesc from "./CatDesc";
import Attributes from "./Attributes";
import CatHeader from "./CatHeader";
import CatCarousel from "./CatCarousel";
import Button from "./Button";
import Link from "next/link";

export default function CatDetails({ cats, cat, returnHref }) {
  return (
    <div
      className="fixed inset-0 bg-white grid gap-2 lg:grid-cols-2 lg:py-4 z-20 overflow-y-scroll"
      style={{ backgroundColor: "rgb(245, 245, 245" }}
    >
      <CatCarousel cat={cat} />
      <div>
        <CatHeader>
          <Title>{cat.Name}</Title>
          <Subtitle>
            {cat.Sex}
            {", "}
            {cat.Age < 12
              ? cat.Age + " months old"
              : Math.floor(cat.Age / 12) + " years old"}
          </Subtitle>
          <Details>
            {cat.Breed} {cat.Color} {cat.Pattern === "None" ? "" : cat.Pattern}
          </Details>
        </CatHeader>
        <Attributes cats={cats} cat={cat} returnHref={returnHref} />
        <CatDesc>{cat.Description}</CatDesc>
        <div className="flex justify-center">
          <Link href={returnHref === undefined ? "/" : returnHref}>
            <Button>Go Back</Button>
          </Link>
          <a href={`https://www.shelterluv.com/matchme/adopt/VOKR-A-${cat.ID}`}>
            <Button primary>Adopt {cat.Name}!</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
