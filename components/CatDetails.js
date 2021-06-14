import CatCarousel from './CatCarousel';
import CatInfo from './CatInfo';

export default function CatDetails({ cats, cat, returnHref, position, url }) {
  return (
    <div
      className={`${position} inset-0 grid lg:grid-cols-2 z-20 overflow-y-auto bg-vokra-gray`}
    >
      <CatCarousel cat={cat} />
      <CatInfo cats={cats} cat={cat} returnHref={returnHref} url={url} />
    </div>
  );
}
