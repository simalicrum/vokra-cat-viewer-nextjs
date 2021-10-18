import { returnCatsInCustody } from '../lib/api';
import CatNames from '../components/CatNames';

export async function getStaticProps() {
  const cats = await returnCatsInCustody();
  return {
    props: {
      cats,
    },
    revalidate: 300,
  };
}

export default function CatNamesPage({ cats }) {
  return <CatNames cats={cats} />;
}
