// instructions_list.js
// provides a list of instructions for the map page (can be hidden with the attached button)
//
// Coder: Larry Huang

import useToggle from "./toggle_hook";

//data
const instructionTextList = [
  {
    id: 0,
    textVal: "INSTRUCTIONS"
  },
  {
    id: 1,
    textVal: "Import a GPX file to view contents or edit the route stored in it. Create a new one with the bottom menu."
  },
  {
    id: 2,
    textVal: "When edit-by-dragging (see -> menu to the right) is OFF, edit using the text interactables beside the map buttons."
  },
  {
    id: 3,
    textVal: "When edit-by-dragging is ON, the coordinate display below will be restricted. Use the polyline and small dot-markers on the map."
  },
  {
    id: 4,
    textVal: "Dragging the polyline may add a route point (small dot) to ensure the path is reproducible; dragging a route point may move the line much further."
  },
  {
    id: 5,
    textVal: "Always protect the route from dragging (toggle it off) before attempting to save; this action repopulates the coordinate data for user-keypad editing."
  },
  {
    id: 6,
    textVal: "WARNING: attempting to save before toggling drag-editing off may not collect the data appropriately."
  }
];

//nodes
const InstructionsList = () => {
  const [isVisible, toggleVisible] = useToggle(true);
  const data = instructionTextList.map(({id, textVal}) => {
    if (id===0) return (<li id="instructionListStyleFirst" key={id}>{textVal}</li>);
    else return (<li key={id}>{textVal}</li>);
  });
  return (<div id="halfBlock">
    {isVisible && <ul id="instructionListStyle">{data}</ul>}
    <button id="selectMenuButton" onClick={toggleVisible}>SHOW/HIDE INSTRUCTIONS</button>
    <p></p>
  </div>);
}

export default InstructionsList;