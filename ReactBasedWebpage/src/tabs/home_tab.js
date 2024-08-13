//home_tab.js
//This component is rendered as the home page, containing a map for route rendering and creation/editing
//It also contains the code to import an GPX file for direct rendering.
//Coder: Jan Baraniecki
//Modified by: Larry Huang

import React, { useState } from 'react';
import ReactGoogleMapAPI from '../react_scripts/react_google_map_api';
import GPXParseLocal from '../react_scripts/gpx_parser_local.js';
import SelectMenuComponent from '../react_scripts/select_menu_list.js';
import EditRouteComponent from '../react_scripts/edit_route_component.js';
import InstructionsList from '../react_scripts/instructions_list.js';
import useToggle from '../react_scripts/toggle_hook.js';
import { convertToXMLtext } from '../react_scripts/save_gpx_calls.js';

//default/new values for settings, gpx object, etc.
const defaultGpxCategory = {
  route: true,
  routeDrag: false,
  track: false,
  waypt: false
}
const emptyGpxObj = {
  "error": false,
  "metadata": null,
  "routes": [],
  "tracks": [],
  "waypoints": []
};

const HomeTab = () => {
  /**
   * route: make API call to render a route if true and is present in data
   * routeDrag: setting controlling the editing method
   *  true - prevent editing gpx points on list, edit w/ dragging markers on map
   *  false - enable editing gpx points on list, disable map-drag-edits
   * track: display tracks saved in file if present
   * waypt: display waypoints saved in file if present
   */
  const [gpxCategoryObj, setGPXcategory] = useState(defaultGpxCategory);

  /*{
    "error": false,
    "metadata": null,
    "routes": [],
    "tracks": [],
    "waypoints": []
  }*/
  const [fileContents, setFileContents] = useState(emptyGpxObj);

  //provides a passable function that allows subcomponents to modify gpx data stored in fileContents
  const saveDataHook = (gpxFileData) => {
    //console.log(gpxFileData);
    setFileContents(gpxFileData);
  }

  //used to pass data back and forth while editing a route on the map
  const [markerList, setMarkers] = useState([]);

  //local renders and dbname state
  const [fileCreateInput, flipCreateInput] = useToggle(false);
  const [dbNameInput, flipNameInput] = useToggle(false);
  const [saveNameVal, setSaveNameVal] = useState("enterUniqueName");
  const statusMessages = [
    "Provide a unique name. Press the above button again when done.",
    "Name not usable; try another one. Press the above button again when done."
  ];
  const [saveStatusMessage, setSaveStatus] = useState(0);

  //used in new-GPX creation flow
  const [newPointAx, setNewAx] = useState(0.0);
  const [newPointAy, setNewAy] = useState(0.0);
  const [newPointBx, setNewBx] = useState(0.0);
  const [newPointBy, setNewBy] = useState(0.0);
  const createAction = () => {
    //reset data on home page to new, empty GPX file
    resetHomeTab();
    //set new route with two points in creation dialog
    setFileContents({
      ...fileContents,
      routes: [{points: [
        {LatLng: {lat: newPointAx, lng: newPointAy}},
        {LatLng: {lat: newPointBx, lng: newPointBy}}
      ]}]
    });
    console.log("New route started! See plotting for details.");
    flipCreateInput();
  }

  //asynchronous save (opens save menu for user action)
  const saveFile = async (blob) => {
    try {
      const handle = await window.showSaveFilePicker({
        types: [{
          accept: {
            // Omitted to give user control; please be careful.
          },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return handle;
    } catch (err) {
      console.error(err.name, err.message);
    }
  }

  //functions called on specific page buttons
  const createRoute = () => {
    //instead of actually creating the route, this function opens the modal for starting input
    console.log("Creating new route!");
    flipCreateInput();
  }
  //collects the current GPX contents being edited and tries to save it
  const downloadAttempt = () => {
    console.log("Download attempt!");
    let xmlTxt = convertToXMLtext(fileContents);
    console.log(xmlTxt);
    let blob = new Blob([xmlTxt]);
    alert("File contents collected; see browser console if download does not appear.");
    saveFile(blob);
  }
  //function called to save to database
  const saveAttempt = () => {
    console.log("Save attempt!");
    if (dbNameInput === false) {
      flipNameInput();
    } else {
      //database check for the name calls
      console.log(`Checking name '${saveNameVal}' with the database...`);
      //TODO database call on name
      let successful = false;
      if (successful) {
        //on successful save, hide this again using the following lines
        console.log("Data saved to database!");
        flipNameInput();//hide
        setSaveStatus(0);
      } else {
        console.log("Save not successful. Try another name.");
        setSaveStatus(1);
      }
    }
  }
  //emergency reset called to reset the page to nothing
  const resetHomeTab = () => {
    console.log("Resetting page!");
    setGPXcategory({...defaultGpxCategory});
    setFileContents({...emptyGpxObj});
  }

  //modal of editing a new GPX route
  const FileCreationBlock = (
    <div>
      <p>Start Point Coordinates</p>
      LAT <input type="number" max={90} min={-90} onChange={event => setNewAx(parseFloat(event.target.value))}></input> LON <input type="number" max={180} min={-180} onChange={event => setNewAy(parseFloat(event.target.value))}></input>
      <p>End Point Coordinates</p>
      LAT <input type="number" max={90} min={-90} onChange={event => setNewBx(parseFloat(event.target.value))}></input> LON <input type="number" max={180} min={-180} onChange={event => setNewBy(parseFloat(event.target.value))}></input>
      <p></p>
      <p>WARNING: this will clear GPX data from the page! Export or Save first...</p>
      <button id="selectMenuButton" onClick={createAction}>Create new route with these coordinates.</button>
    </div>
    );

  //page DOM
  return (
    <div id="background">
        <p id="infoText">Welcome to the Map Page.</p>
        <p id="infoText">Here, you can view GPX contents (routes, tracks, & waypoints), and plan routes.</p>
        <GPXParseLocal saveDataHook={saveDataHook}/>
        <p id="infoText">Warning: importing a new file will clear any previous GPX data present; export or save first if data is already present.</p>
        <div id="horizontalBlock">
          <InstructionsList />
          <SelectMenuComponent saveCall={setGPXcategory}/>
        </div>
        <EditRouteComponent
          markerList={markerList}
          gpxCategory={gpxCategoryObj}
          gpxData={fileContents}
          saveDataHook={saveDataHook}
        />
        <ReactGoogleMapAPI
          gpxData={fileContents}
          gpxCategory={gpxCategoryObj}
          setMarkers={setMarkers}
        />
        <div id="backgroundMenu">
          <button id="actionMenuButton" onClick={createRoute}>Create New Route (New GPX File)</button>
          {fileCreateInput && FileCreationBlock}
          <p></p>
          <button id="actionMenuButton" onClick={downloadAttempt}>Download GPX File</button>
          <p></p>
          <button id="actionMenuButton" onClick={saveAttempt}>Save GPX File to Database</button>
          {dbNameInput && (<div>
            <p>{statusMessages[saveStatusMessage]}</p>
            <input type="text" onChange={event => setSaveNameVal(event.target.value)}></input>
          </div>)}
          <p></p>
          <button id="actionMenuButton" onClick={resetHomeTab}>Reset Page (This Does Not Save!)</button>
        </div>
    </div>
  );
};

export default HomeTab;
