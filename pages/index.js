import { fetchCats, sanitizeCats } from "../lib/api";
import Layout from "../components/Layout";
import FETCH_URL from "../config/api";

export async function getStaticProps() {
  const dirtyCats = await fetchCats(FETCH_URL);
  const cats = await sanitizeCats(dirtyCats);
  return {
    props: {
      cats,
    },
    revalidate: 1,
  };
}

export default function Index({ cats }) {
  return <Layout cats={cats} />;
}
