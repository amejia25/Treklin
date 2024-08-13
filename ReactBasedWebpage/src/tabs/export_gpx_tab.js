//export_gpx_tab.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Button, Typography, CircularProgress } from '@mui/material';

// Function to format the XML for better readability
const formatXml = (xml) => {
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    xml.split('\r\n').forEach((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        let padding = '';
        for (let i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
};

const ExportGPXTab = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContents, setFileContents] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const port = 4000; // Port to connect to Node.js
    const serverURL = `http://${window.location.hostname}:${port}`;

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            try {
                // Updating the endpoint to /gpxfiles
                const response = await fetch(`${serverURL}/gpxfiles`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const fetchedFiles = await response.json();
                setFiles(fetchedFiles.map(file => ({ filename: file.filename, filepath: file.filepath })));
            } catch (error) {
                console.error('Error fetching files:', error);
                setError('Error loading files. Please try again later.');
            }
            setLoading(false);
        };

        fetchFiles();
    }, []);

    const handleCardClick = async (filename) => {
        setLoading(true);
        try {
            const response = await fetch(`${serverURL}/file-contents/${filename}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text(); // Assuming the endpoint sends plain text GPX data
            const formattedData = formatXml(data); // Format the XML data
            setSelectedFile(filename);
            setFileContents(formattedData);
        } catch (error) {
            console.error('Error fetching file contents:', error);
            setError('Error loading file contents. Please try again later.');
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: 20 }}>
            {error && <p>{error}</p>}
            {loading ? <CircularProgress /> : files.map((file, index) => (
                <Card key={index} style={{ margin: '20px 0' }}>
                    <CardContent onClick={() => handleCardClick(file.filename)}>
                        <Typography variant="h5" component="div">{file.filename}</Typography>
                    </CardContent>
                    {selectedFile === file.filename && (
                        <CardContent style={{ whiteSpace: 'pre-wrap', overflowY: 'auto', maxHeight: '300px' }}>
                             <pre>{fileContents}</pre>
                        </CardContent>
                    )}
                    <CardActions>
                        <Button size="small" href={`${serverURL}/download/${file.filename}`} download>Download Original</Button>
                    </CardActions>
                </Card>
            ))}
        </div>
    );
};

export default ExportGPXTab;
