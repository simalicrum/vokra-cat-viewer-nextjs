import Image from 'next/image';

export default function CoverPhoto({ src, cat }) {
  return (
    <div className="md:m-4 relative">
      {cat.Attributes.map(attribute => attribute.AttributeName).includes(
        'No Kids'
      ) ? (
        <div className="absolute z-10 text-white bg-vokra-light p-1 shadow">
          I'm Extra Special
        </div>
      ) : (
        ''
      )}
      <Image layout="responsive" width={1000} height={1000} src={src} />
    </div>
  );
}
