import './App.css';


import TabLoader from './tabs/tab_loader.js';

function App() {
  return (
    
    <div className="App">    
        {/*Variable Declarations*/}
        {/* <input type="file" accept=".gpx" id="fileInput" style={{ display: 'none' }} />*/}
      
       {/* Loads Website Template - Main Menu Bar and Region Underneath */}
       <TabLoader />
      
    </div>
  );
}

export default App;
