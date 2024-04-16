//CycleAppTab.js
//This file contains code for the area in index.html when the user hits "Images"
//It also cotains the code to import an jpeg file.
//Coder: Jan Baraniecki
import React, { useState } from 'react';
import ReactGoogleMapAPI from '../react_scripts/react_google_map_api';
import GPXParseLocal from '../react_scripts/gpx_parser_local.js';


const HomeTab = () => {
    const [fileContents, setFileContents] = useState();
		/*{
			"error": false,
			"metadata": null,
			"routes": [],
			"tracks": [],
			"waypoints": []
		}*/

		const saveDataHook = (gpxFileData) => {
			//console.log(gpxFileData);
			setFileContents(gpxFileData);
		}

		const gpxCategoryType = "ROUTE";
		//TODO create enum constant for gpx category (route, track, waypoints)
    return (
        <div id="background">
            <p>Welcome to the Map Page of our experimental route website.</p>
            <p>This area will be used to view route content and to plan routes using markers.</p> 
            <GPXParseLocal saveDataHook={saveDataHook}/>
            <p></p>
            <ReactGoogleMapAPI
							gpxData={fileContents}
							gpxCategory={gpxCategoryType}
						/>
        </div>
    );
};

export default HomeTab;
