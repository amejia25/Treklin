// select_menu_list.js
// Provides toggle buttons for displaying different parts of a GPX file's data
// Button text changes with the state changes
//
// Coder: Larry Huang
//

import { useEffect } from 'react';
import useToggle from './toggle_hook';

//Component used to select routes, tracks, or waypoints display on/off
const SelectMenuComponent = ({ saveCall = undefined }) => {
  const [routeDisplay, setRouteDisplay] = useToggle(true);
  const [routeDraggable, setDraggable] = useToggle(false);
  const [trackDisplay, setTrackDisplay] = useToggle(false);
  const [wayptDisplay, setWayptDisplay] = useToggle(false);

  useEffect(() => {
    if (saveCall === undefined) return;
    let saveObj = {
      route: routeDisplay.valueOf(),
      routeDrag: routeDraggable.valueOf(),
      track: trackDisplay.valueOf(),
      waypt: wayptDisplay.valueOf()
    };
    //console.log(saveObj);
    saveCall(saveObj);
  }, [routeDisplay, routeDraggable, trackDisplay, wayptDisplay, saveCall]);

  //data of hte buttons
  let toggleContents = [
    {
      id: 0,
      displayText: [
        "Hide Route Plotting",
        "Show Route Plotting"
      ],
      val: routeDisplay,
      func: setRouteDisplay
    },
    {
      id: 1,
      displayText: [
        "Protect Displayed Route from Marker-Drag Editing",
        "Enable Editing Route by Dragging Markers"
      ],
      val: routeDraggable,
      func: setDraggable
    },
    {
      id: 2,
      displayText: [
        "Hide Track Lines",
        "Show Track Lines"
      ],
      val: trackDisplay,
      func: setTrackDisplay
    },
    {
      id: 3,
      displayText: [
        "Hide Waypoints",
        "Show Waypoints"
      ],
      val: wayptDisplay,
      func: setWayptDisplay
    }
  ];

  //provides the buttons through a map of the data
  const toggleComponents = toggleContents.map(({id, displayText, val, func}) => {
    let actualText = val ? displayText[0] : displayText[1];
    return (<li key={id} id="selectMenuNode">
      <button id="selectMenuButton" onClick={func}>{actualText}</button>
    </li>); }
  );

  return (<div id="halfBlock">
    <ul id="selectMenu">{toggleComponents}</ul>
  </div>);
}

export default SelectMenuComponent;