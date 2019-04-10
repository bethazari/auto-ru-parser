
// react/next imports
import { Carousel } from "react-responsive-carousel";
import React from "react";
import Lightbox from "react-image-lightbox";

// css imports
import "../src/scss/libs/carousel-custom.min.scss";
import "../src/scss/libs/react-image-lightbox.scss";


export default class Slider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      photoIndex: 0,
    };
    this.openSlide = this.openSlide.bind(this);
  }

  openSlide(index) {
    this.setState({
      isOpen: true,
      photoIndex: index,
    });
  }

  render() {
    const { photoIndex, isOpen } = this.state;
    const screenshots = this.props.screenshots.map(entity => `/static/images/${entity.image_name}`);

    return (
      <div>
        <Carousel
          centerMode={screenshots.length > 1}
          centerSlidePercentage={50}
          showArrows={screenshots.length > 2}
          showIndicators={false}
          showThumbs={false}
        >
          {screenshots.map((slide, index) => (
            <div
              className="carousel-slide-item"
              key={index}
              onClick={() => this.openSlide(index)}
            >
              <img
                alt=""
                src={slide} />
            </div>
          ))}
        </Carousel>
        {isOpen && (
          <Lightbox
            mainSrc={screenshots[photoIndex]}
            nextSrc={screenshots.length > 1 ? screenshots[(photoIndex + 1) % screenshots.length] : undefined}
            prevSrc={screenshots.length > 1 ? screenshots[(photoIndex + screenshots.length - 1) % screenshots.length] : undefined}
            onCloseRequest={() => this.setState({ isOpen: false })}
            onMovePrevRequest={() => this.setState({
                photoIndex: (photoIndex + screenshots.length - 1) % screenshots.length,
              })
            }
            onMoveNextRequest={() => this.setState({
                photoIndex: (photoIndex + 1) % screenshots.length,
              })
            } />
        )}
      </div>
    );
  }
}