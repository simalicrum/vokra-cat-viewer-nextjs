import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

export default function CatCarousel({ cat }) {
  return (
    <Carousel showThumbs={false} showIndicators={false}>
      {cat.Photos.map((photo, index) => (
        <div key={index}>
          <img src={photo}></img>
        </div>
      ))}
      {cat.Videos.map((video) => (
        <iframe
          className="h-full"
          src={video.EmbedUrl}
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      ))}
    </Carousel>
  );
}
