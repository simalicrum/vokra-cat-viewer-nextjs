import Image from 'next/image';

import Ribbon from './Ribbon';

export default function CoverPhoto({ src, cat }) {
  return (
    <div className="relative">
      {cat.Attributes.map(attribute => attribute.AttributeName).includes(
        'Special Adoption'
      ) ? (
        <Ribbon>I'm Extra Special!</Ribbon>
      ) : (
        ''
      )}
      <Image layout="responsive" width={100} height={100} src={src} />
    </div>
  );
}
