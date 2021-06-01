import CatCarousel from './CatCarousel';
import CatInfo from './CatInfo';

export default function CatDetails({ cats, cat, returnHref, position, url }) {
  return (
    <div
      className={`${position} inset-0 bg-white grid lg:grid-cols-2 z-20 overflow-y-auto`}
      style={{ backgroundColor: 'rgb(245, 245, 245)' }}
    >
      <CatCarousel cat={cat} />
      <CatInfo cats={cats} cat={cat} returnHref={returnHref} url={url} />
    </div>
  );
}
