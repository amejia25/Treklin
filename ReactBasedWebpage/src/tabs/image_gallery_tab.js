//imagesTab.js
//This file contains code for the tab area that manages images.
//It also cotains the code to import an jpeg file.
//Coder: Jan Baraniecki
import React, { useState } from 'react';
import CarouselGallery from '../gui_components/carousel_gallery.js';


const ImageGalleryTab = () => {
    const [uploadImageStatus, setUploadImageStatus] = useState('Upload an Image to your Gallery');
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [refreshGallery, setRefreshGallery] = useState(0);
     
    const port = 4000;
    const serverURL = `http://${window.location.hostname}:${port}/images`;


    const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('jpegFile', file);

        fetch(serverURL, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            // First, get the response as text to check what was received
            return response.text();
        })
        .then(text => {
            console.log(text);  // Log the text to see what you received
            // Now try to parse it as JSON
            try {
                const data = JSON.parse(text);
                setUploadImageStatus('Success: File uploaded successfully.');
                if (data.imageUrl) {
                    //setUploadedImageUrl(data.imageUrl);
                    setRefreshGallery(old => old + 1);
                }
                else {
                    throw new Error('No image URL returned from server');
                }
            } catch (error) {
                throw new Error('Upload failed or returned non-JSON data');
            }
        })
        .catch(error => {
            setUploadImageStatus(`Error: ${error.message}`);
        });
    }
};

    const handleProcessImageClick = () => {
        document.getElementById('fileImageInput').click();
    };

    return (
        <div id="background">
             <h2>Your Image Gallery</h2>
             <CarouselGallery refreshTrigger={refreshGallery}/> {/* Pass the trigger */}
             
             <input type="file" id="fileImageInput" accept="image/jpeg" style={{ display: 'none' }} onChange={handleImageUpload} />
            <h1>Import Image File</h1>
            <button onClick={handleProcessImageClick} className="button">Upload Image</button>
            <div id="uploadImageStatus">
                {uploadImageStatus && <p style={{ color: uploadImageStatus.startsWith('Error') ? 'red' : 'green' }}>{uploadImageStatus}</p>}
                {uploadedImageUrl && <img src={uploadedImageUrl} alt="Uploaded" />}
            </div>
        </div>
    );
};

export default ImageGalleryTab;
