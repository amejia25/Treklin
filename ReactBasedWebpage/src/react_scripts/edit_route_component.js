// gpx_routing.js
// Provides an object that acts on a sibling Map and parent APIProvider to render route navigation
//
// Coder: Larry Huang

import { useEffect, useState } from "react";

//PARAMETERS
  //markerList
    //when gpxData is passed to routing, it returns a list of marker coordinates to this
    //when drag-modified, we will update this component based upon the changes
    //when not drag-modified, we update fileContents.route using saveDataHook
  //gpxCategory.routeDrag
    //true means this component cannot edit the route, and changes propogate in through markerList
      //basically, don't allow the user to make changes when this is the value
    //false means you can edit the route using this component
  //gpxData - an object representing a GPX file
    //used as a prev-state when calling saveDataHook
    //modify and save a copy of this using saveDataHook
  //saveDataHook - repopulates GPX file data, modifying it based upon edits to this component when possible
const EditRouteComponent = ({ markerList=[], gpxCategory={}, gpxData={}, saveDataHook=()=>{} }) => {
  const [markerDataSetup, setMarkerDataSetup] = useState([]); //use to preload list contents for components
  const [markerComponents, setMarkerComponents] = useState([]);
  const [firstItemKey, keyMove] = useState(0); //used when repopulating list to avoid key overlap issues

  useEffect(() => {
    if (markerList && markerList.length > 0) {
      console.log("Editable component has marker data!");
      console.log(markerList);
      let keyVal = firstItemKey;
      setMarkerDataSetup(markerList.map((item) => {
        let newItem = {...item, keyVar: keyVal++};
        console.log(newItem);
        return newItem;
      }));
      keyMove((keyVal + 1));
    } else {
      setMarkerDataSetup([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerList]);

  useEffect(() => {
    if (markerDataSetup && markerDataSetup.length > 0) {
      //map contents of setup to components
      let markerMap = markerDataSetup.map(({keyVar, lat, lng}) => {
        return (
          <EditListItem
            lat={lat}
            lng={lng}
            key={keyVar}
            keyVar={keyVar}
            moveFunc={() => {markerMove(keyVar)}}
            newFunc={() => {markerAdd(keyVar)}}
            deleteFunc={() => deletePoint(keyVar)}
          />
        );
      });
      setMarkerComponents(markerMap);
    } else {
      setMarkerComponents([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerDataSetup, gpxCategory.routeDrag]);

  const EditListItem = ({keyVar, lat, lng, moveFunc, newFunc, deleteFunc}) => {
    return (
      <li id="selectMenuNode" key={keyVar}>
        LAT <input
          type="number"
          step="0.00001"
          disabled={gpxCategory.routeDrag}
          defaultValue={lat}
          name={keyVar + "lat"}
        /> LON <input
          type="number"
          step="0.00001"
          disabled={gpxCategory.routeDrag}
          defaultValue={lng}
          name={keyVar + "lng"}
        /> <button
          id="pointEditButton"
          type="button"
          onClick={moveFunc}
          disabled={gpxCategory.routeDrag}
        >Move Up</button> <button
          id="pointEditButton"
          type="button"
          onClick={newFunc}
          disabled={gpxCategory.routeDrag}
        >Add New Point Below</button> <button
          id="pointEditButton"
          type="button"
          onClick={deleteFunc}
          disabled={gpxCategory.routeDrag}
        >Delete Route Point</button>
      </li>
    );
  }

  //add to first item in list
  const markerAddStart = (event) => {
    event.preventDefault();//prevent reload; this is a form action
    let startPoint = Object.fromEntries(new FormData(event.target).entries());
    //console.log(startPoint);
    let newPoints = [
      {lat: parseFloat(startPoint.startLat), lng: parseFloat(startPoint.startLng), keyVar: firstItemKey.valueOf()},
      ...markerDataSetup
    ];
    keyMove(firstItemKey => firstItemKey + 1);
    setMarkerDataSetup(newPoints);
  }

  //add to the list of markers right below the specific keyVar
  const markerAdd = (keyVar) => {
    //console.log(keyVar+"add");
    //find index of keyVar marker
    let found = false;
    let keyIdx = 0;
    for (; keyIdx < markerDataSetup.length; keyIdx = keyIdx + 1) {
      if (markerDataSetup[keyIdx].keyVar === keyVar) {
        found = true;
        //console.log(keyIdx);
        break;
      }
    }
    //if found, add; if not found, alert issue and cancel
    if (found) {
      let newPoints = [...markerDataSetup];
      //add new one right below targeted index
      let newPoint = {lat: markerDataSetup[keyIdx].lat, lng:markerDataSetup[keyIdx].lng, keyVar: firstItemKey.valueOf()};
      newPoints.splice(keyIdx + 1, 0, newPoint);
      setMarkerDataSetup(newPoints);
      console.log("Point replica added successfully...");
      keyMove(firstItemKey => firstItemKey + 1);
    } else {
      alert("An error has occured in the editing component. Please export changes if you wish to try and recover data manually, or reset the page.");
    }
  }
  
  //swap this marker with the one above it if it is above the specific key
  const markerMove = (keyVar) => {
    //console.log(keyVar+"move");
    //find index of keyVar marker
    let found = false;
    let keyIdx = 0;
    for (; keyIdx < markerDataSetup.length; keyIdx = keyIdx + 1) {
      if (markerDataSetup[keyIdx].keyVar === keyVar) {
        found = true;
        //console.log(keyIdx);
        break;
      }
    }
    if (found) {
      if (keyIdx === 0) {
        console.log("Cannot move start point above itself?");
        return;
      }
      let newPoints = [...markerDataSetup];
      [newPoints[keyIdx], newPoints[keyIdx - 1]] = [newPoints[keyIdx - 1], newPoints[keyIdx]];
      setMarkerDataSetup(newPoints);
    } else {
      alert("An error has occured in the editing component. Please export changes if you wish to try and recover data manually, or reset the page.");
    }
  }

  //"save" function
  const callPointsUpdate = (event) => {
    //console.log(gpxData);
    //console.log(markerList);
    event.preventDefault();
    //console.log(event);
    let saveData = Object.fromEntries(new FormData(event.target).entries());
    //console.log(saveData);
    let keyList = [];
    for (let i = 0; i < markerDataSetup.length; i = i + 1) {
      keyList.push(markerDataSetup[i].keyVar);
    }
    //console.log(keyList);
  
    //filter form data using the keyList above
    let newPointList = [];
    for (let i = 0; i < keyList.length; i = i + 1) {
      let newLat = parseFloat(saveData[keyList[i]+"lat"]);
      let newLng = parseFloat(saveData[keyList[i]+"lng"]);
      if (isNaN(newLat) || isNaN(newLng)) continue;
      newPointList.push({lat: newLat, lng: newLng});
    }
    if (newPointList.length > 1) {
      let newGPXData = {
        ...gpxData,
        routes: [
          ...gpxData.routes
        ]
      };
      newGPXData.routes[0].points = newPointList.map(item =>({LatLng: item}));
      //console.log(newGPXData);//new GPX file state
      saveDataHook(newGPXData);
    } else {
      alert("There was an issue: not enough points to save these route contents.");
    }
  }

  //"delete" function
  const deletePoint = (keyVar) => {
    //console.log(keyVar+"move");
    //find index of keyVar marker
    let found = false;
    let keyIdx = 0;
    for (; keyIdx < markerDataSetup.length; keyIdx = keyIdx + 1) {
      if (markerDataSetup[keyIdx].keyVar === keyVar) {
        found = true;
        //console.log(keyIdx);
        break;
      }
    }
    if (found) {
      let newPoints = [...markerDataSetup];
      //remove the point from newPoints
      if (newPoints.length > 2) {
        let removed = newPoints.splice(keyIdx, 1);
        console.log(removed);
        setMarkerDataSetup(newPoints);
      } else {
        alert("Cannot have a route with fewer than two points. Delete cancelled.");
      }
    }
  }

  //return function
  return ((markerDataSetup.length > 1) &&
    <div>
      <div id="selectMenuNode">
        <form method="post" onSubmit={markerAddStart}>
          Add to list start: LAT <input type="number"
            step="0.00001"
            disabled={gpxCategory.routeDrag}
            readOnly={gpxCategory.routeDrag}
            name="startLat"
          /> LON <input type="number"
            step="0.00001"
            disabled={gpxCategory.routeDrag}
            readOnly={gpxCategory.routeDrag}
            name="startLng"
          /> <button
            disabled={gpxCategory.routeDrag}
            type="submit"
            id="pointEditButton"
          >Add values as New Start Point</button>
        </form>
      </div>
      <form method="post" onSubmit={callPointsUpdate}>
        <ul>{markerComponents}</ul>
        <input
          id="selectMenuButton"
          disabled={gpxCategory.routeDrag}
          type="submit"
          value="Update Route"
        />
      </form>
      <p>Note: if you do not use this button before making a dragging edit, changes will be lost.</p>
    </div>
  );
}

export default EditRouteComponent;