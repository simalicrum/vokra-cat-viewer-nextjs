import { fetchCats, sanitizeCats } from "../../lib/api";
import { useRouter } from "next/router";
import CatDetails from "../../components/CatDetails";

export async function getStaticPaths() {
  const dirtyCats = await fetchCats();
  const cats = await sanitizeCats(dirtyCats.animals);
  return {
    paths: cats.map((i) => {
      return { params: { catId: i.ID } };
    }),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const dirtyCats = await fetchCats();
  const cats = await sanitizeCats(dirtyCats.animals);
  return {
    props: {
      cats,
      catId: params.catId,
    },
    revalidate: 1,
  };
}

const CatPage = ({ cats }) => {
  const router = useRouter();
  const { catId } = router.query;
  return <CatDetails cat={cats.find((i) => i.ID === catId)} cats={cats} />;
};

export default CatPage;