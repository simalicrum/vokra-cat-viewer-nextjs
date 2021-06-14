import Title from './Title';
import Subtitle from './Subtitle';
import CoverPhoto from './CoverPhoto';
import CoverDesc from './CoverDesc';
import CatHeader from './CatHeader';

export default function CatCard({ cat }) {
  return (
    <div className="grid gap-4">
      <CatHeader>
        <Title>{cat.Name}</Title>
        <Subtitle>
          {cat.Breed} {cat.Color} {cat.Pattern === 'None' ? '' : cat.Pattern}
        </Subtitle>
      </CatHeader>
      <CoverPhoto src={cat.CoverPhoto} cat={cat} />
      <CoverDesc>{cat.Description}</CoverDesc>
    </div>
  );
}
