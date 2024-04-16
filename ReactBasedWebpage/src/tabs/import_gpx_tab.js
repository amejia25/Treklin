//import_gpxtab.js
//This file contains code for when the user selects "Import GPX"
//Coder: Jan Baraniecki
//SUMMARY- This tab uploads a gpx file and sends it to NODE Server.


import React, { useState } from 'react';
import { parseGPX } from '../react_scripts/gpx_parser.js';

const ImportGPXTab = () => {
    const [uploadStatus, setUploadStatus] = useState('');
    const [labelContent, setLabelContent] = useState('');
    const port = 4000;
    const serverURL = `http://${window.location.hostname}:${port}/gpx`;

    const handleGPXProcessClick = () => {
        // Clear error Screen
        setUploadStatus('');

        // Open file input dialog
        document.getElementById('fileInput').click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
       
        if (file) {
            
            /*DEBUGGING- READ THE CONTENTS OF THE GPX FILE WITHIN THE BROWSER. 
            //Converts File into a String to display later for DEBUGGING
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                // Use the GPX parser to parse the file content
                const parsedData = parseGPX(fileContent);
                //Temp Can Remove Later
                setLabelContent(JSON.stringify(parsedData, null, 2));
                
                //DEBUG
                // Log the parsed data to the console
                //console.log('Parsed GPX Data:', parsedData);
                //setUploadStatus('Succes: ${parsedData}');
                //console.log('Parsed GPX Data:', parsedData);
                
                
            };
            reader.readAsText(file);
            */
            
            //Talk To Node.js
                const formData = new FormData();
                formData.append('gpxFile', file);
                
                fetch(serverURL, {
                    method: 'POST',
                    body: formData,
                })
                .then(response => {
                    if(response.ok) {
                        return response.text();
                    } else {
                        throw new Error('Upload failed');
                    }
                })
                .then(data => {
                    setUploadStatus(`Success: ${data}`);
                })
                .catch(error => {
                    setUploadStatus(`Error: ${error.message}`);
                });
                
        }
    };

    return (
        <div id="background">
            <h1>Import GPX File</h1>
            <p>This is the Import GPX File section content.</p>
            <button onClick={handleGPXProcessClick} className="button">Process GPX</button>
            <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} />
            <div id="uploadStatus">
                {uploadStatus}
            </div>
            {/* Render the label with its content */}
            {/* <label id="fileContentLabel">File Contents:</label>
            <div id="fileContents">
                {labelContent}
            </div>*/}
        </div>
    );
};

export default ImportGPXTab;