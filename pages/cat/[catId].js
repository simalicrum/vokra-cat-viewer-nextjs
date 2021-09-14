import { useRouter } from "next/router";
import { returnCats } from "../../lib/api";
import CatDetails from "../../components/CatDetails";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export async function getStaticPaths() {
  const cats = await returnCats();
  return {
    paths: cats.map((i) => ({ params: { catId: i.ID } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const cats = await returnCats();
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
