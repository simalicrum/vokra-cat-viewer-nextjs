import { useRouter } from "next/router";
import {
  getPublishableAndAdoptedCatsIds,
  getCatByInternalId,
  batchedQueries,
} from "../../lib/dgraph";
import CatDetails from "../../components/CatDetails";

export async function getStaticPaths() {
  // const cats = await getPublishableAndAdoptedCatsIds();
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  let cats = [];
  const resp = await getCatByInternalId(params.catId);
  let timeout = await new Promise((resolve) => setTimeout(resolve, 20));
  const cat = resp.getCat;
  const bonded = cat.Attributes.some(
    (element) => element.AttributeName === "Bonded"
  );
  if (bonded === true) {
    const bondedID = cat.PreviousIds.filter(
      (element) => element.Type === "Visibility"
    );
    if (bondedID.length > 0) {
      const promises = bondedID.map((cat) => getCatByInternalId(cat.IdValue));
      const catBonded = await Promise.all(promises);
      catBonded.forEach((cat) => {
        if (cat.getCat !== null) {
          cats.push(cat.getCat);
        }
      });
    }
  }
  return {
    props: {
      cats: cats,
      cat: cat,
    },
    revalidate: 1800,
  };
}

const CatPage = ({ cat, cats }) => {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex justify-center bg-vokra-gray">
        <div className="" style={{ width: "1200px" }}>
          <CatDetails cat={cat} cats={cats} position="static" />
        </div>
      </div>
    </div>
  );
};

export default CatPage;
