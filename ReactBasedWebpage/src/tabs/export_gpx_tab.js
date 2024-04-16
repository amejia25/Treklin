import React, { useState } from 'react';

const ExportGPXTab = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    const port = 4000; // Port to connect to Nodejs
    const serverURL = `http://${window.location.hostname}:${port}`;

    const handleExportClick = async () => {
        try {
            const response = await fetch(`${serverURL}/files`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const fetchedFiles = await response.json();
            setFiles(fetchedFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
            setError('Error loading files. Please try again later.');
        }
    };

    return (
        <div id="background">
            <button onClick={handleExportClick}>Export GPX File</button>
            {error && <p>{error}</p>}
            <div style={{ overflowY: 'scroll', height: '200px' }}>
                {files.map((file, index) => (
                    <div key={index}>
                        <a href={`${serverURL}/download/${file}`} download>
                            {file}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExportGPXTab;
