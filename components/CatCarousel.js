import Image from 'next/image';

import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';

export default function CatCarousel({ cat }) {
  return (
    <Carousel showThumbs={false} showIndicators={false} className="lg:p-4">
      {cat.Photos.map((photo, index) => (
        <div key={index}>
          <Image layout="responsive" width={1000} height={1000} src={photo} />
        </div>
      ))}
      {cat.Videos.map(video => (
        <iframe
          key={video.EmbedUrl}
          className="h-full"
          src={video.EmbedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ))}
    </Carousel>
  );
}
