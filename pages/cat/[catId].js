import { useRouter } from "next/router";
import { fetchCats, sanitizeCats } from "../../lib/api";
import FETCH_URL from "../../config/api";
import CatDetails from "../../components/CatDetails";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export async function getStaticPaths() {
  const dirtyCats = await fetchCats(FETCH_URL);
  const cats = await sanitizeCats(dirtyCats);
  return {
    paths: cats.map((i) => ({ params: { catId: i.ID } })),
    fallback: "blocking",
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
  return (
    <div className="w-full flex flex-col items-center">
      <Header />
      <div className="w-full flex justify-center bg-vokra-gray">
        <div className="" style={{ width: "1200px" }}>
          <CatDetails
            cat={cats.find((i) => i.ID === catId)}
            cats={cats}
            position="static"
            url
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CatPage;
