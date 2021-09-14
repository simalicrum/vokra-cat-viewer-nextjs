import { returnCats } from "../lib/api";
import Layout from "../components/Layout";

export async function getStaticProps() {
  const cats = await returnCats();
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
