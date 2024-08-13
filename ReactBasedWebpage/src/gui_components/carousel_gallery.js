//CarouselGallery.js
//This file contains code for the area in index.html when the user hits "Images"
//It also cotains the code to import an jpeg file.
//Coder: Jan Baraniecki
//WEBSITE: https://www.npmjs.com/package/react-image-gallery
import React, { useState, useEffect } from 'react';
import "./styles.css";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const CarouselGallery = ({ refreshTrigger }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const port = 4000;  
    // Correct use of template strings with backticks for URL
    fetch(`http://${window.location.hostname}:${port}/api/images`) // Adjust this URL to where your server is hosted
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        setImages(data.map(img => ({
          original: img.original,
          thumbnail: img.thumbnail ? img.thumbnail : img.original // Use original as thumbnail if thumbnail isn't provided
          ,description: 'yesh'
        })));
      })
      .catch(error => console.error('Error fetching images:', error));
  }, [refreshTrigger]);

  return (
    <div className="Carousel_App">
      <ImageGallery
        items={images}
        showPlayButton={true}
        showFullscreenButton={true}
        slideInterval={3000}
        slideOnThumbnailOver={true}
        showIndex={true}
        autoPlay={true}
      />
    </div>
  );
};

export default CarouselGallery;
