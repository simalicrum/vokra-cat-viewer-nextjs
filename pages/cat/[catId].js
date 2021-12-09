import { useRouter } from "next/router";
import { returnCats, returnAdoptedCats } from "../../lib/api";
import CatDetails from "../../components/CatDetails";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export async function getStaticPaths() {
  let cats = [];
  const promises = await Promise.all([returnCats(), returnAdoptedCats()]).then(
    (res) => {
      cats = res[0].concat(res[1]);
    }
  );

  return {
    paths: cats.map((cat) => ({
      params: {
        catId: cat["Internal-ID"],
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  let cats = [];
  const promises = await Promise.all([returnCats(), returnAdoptedCats()]).then(
    (res) => {
      cats = res[0].concat(res[1]);
    }
  );
  const cat = cats.find((c) => params.catId === c["Internal-ID"]);
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
      <Header />
      <div className="w-full flex justify-center bg-vokra-gray">
        <div className="" style={{ width: "1200px" }}>
          <CatDetails cat={cat} cats={cats} position="static" url />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CatPage;
