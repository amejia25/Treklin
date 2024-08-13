# <img src="ReactApp\GPXImport\GPXImport\assets\icons\appIcon.png" width="84" height="84" title="Treklin"><img src="ReactApp\GPXImport\GPXImport\assets\icons\LogoName.png" width="320" height="84" title="Treklin">

A project aimed at simplifying route planning, route recording, live location marking, and the handling of GPX files.

## Project Description

This project offers both a web and mobile application, each capable of operating independently; however, they deliver the best user experience when utilized in conjunction. The core functionality revolves around the utilization and manipulation of GPX files, enabling users to create and view routes seamlessly across both the web and mobile platforms. This project was designed with future integration possibilities in mind, such as incorporation into existing platforms like Komoot, Strava, or AllTrails.

The web application offers users the flexibility to plan and map out routes in advance by plotting route points directly on the map. These points can be saved as GPX files, which are then importable into the mobile app for on-the-go access. In the mobile app, users have the option to either follow a previously created route or start fresh by recording a new one. During their journey, they can record their route in real time and mark specific locations along the way as "Good" or "Bad" with just a simple tap. The user can then export the data recorded as a GPX file for later use. This seamless integration between the web and mobile platforms ensures that users can easily create, view, and interact with their routes, enhancing the navigation experience.  

This enhances the practicality of route planning and tracking, providing users with a tool that is not only useful for documenting and sharing their experiences but also for revising and improving their future journeys.

### Technologies Used:

 **Frontend:**
  - ![React](https://img.shields.io/badge/REACT-61DBFB?style=for-the-badge&logo=react&logoSize=amg&labelColor=black)

  - ![React Native](https://img.shields.io/badge/REACT_Native-61DBFB?style=for-the-badge&logo=react&logoSize=amg&labelColor=black)

**Backend:**
  - ![Static Badge](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=PostgreSQL&logoColor=white&logoSize=auto&labelColor=111111)

  - ![AWS](https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white&labelColor=111111)

  - ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white&labelColor=111111)

  - ![Google Directions API](https://img.shields.io/badge/Google_Directions_API-176bef?style=for-the-badge&logo=google&logoColor=white&labelColor=111111)

**Development Tools:**
  - ![Expo](https://img.shields.io/badge/Expo-222222?style=for-the-badge&logo=expo&logoSize=amg&labelColor=111111)
  
  - ![Expo Go](https://img.shields.io/badge/Expo_Go-222222?style=for-the-badge&logo=expo&logoSize=amg&labelColor=111111)


### Key Features:
#### Web Application:
- **Import/export**: Users can import previously created GPX files. Users can also export GPX files of data they created for a planned route for later use - ideally, in preparation for mobile app usage. 

- **Route Customization**: After a GPX import, users can modify and customize routes directly within the web app. This feature provides a dynamic mapping experience that adapts to the user’s preferences.
  
- **Interactive Route Planning**: The app allows for interactive route planning by loading a GPX file and displaying all marked highlights. This functionality helps users in planning and modifying their routes based on previously marked locations.

- **Route Point Plotting**: Users can manually plot or drag route points on the map as part of their route planning. See below.
   
    <img src="ReactApp\GPXImport\GPXImport\assets\README gifs\Gif4.gif" height="250" title="Share/Export Demo">
 
- **Suggest a path**: The app will give a suggested path between all plotted route points.

- **Image upload**: Images taken while route recording are displayed in a gallery-style window.   

#### Mobile Application:
- **Import/export**: Users can import GPX files for use and export them after modifications, or create new ones by recording a route session. See below.
    
    <img src="ReactApp\GPXImport\GPXImport\assets\README gifs\Gif3.gif" height="300" title="Share/Export Demo">

- **Route Recording**: As users travel, they can record their route in real time with flexibility on what data is to be included in the GPX file. 

- **Good/Bad location Markers**: While recording a route, the user can add waypoints to mark locations as "good" or "bad" with a simple tap. See below.  
    <img src="ReactApp\GPXImport\GPXImport\assets\README gifs\Gif2.gif" height="300" title="Route Record/Add Waypoint Demo">

- **File List Tabs**: Two tabs with listed GPX files are available. One named "Created" for GPX files recorded on the mobile app, and another named "Imported" for GPX files created elsewhere that is not the app, like the web app, for example. 

- **Suggest a path**: GPX files that only have route points as data will render with a suggested path going through all route points.  

- **Route Rendering**: GPX data will render on the map upon clicking on the file. The app  will look for and render all routes, routepoints, tracks, trackpoints, and waypoints. See below.

    <img src="ReactApp\GPXImport\GPXImport\assets\README gifs\Gif1.gif" height="300" title="Render Routes">

- **Waypoint Customization**: Delete or customize waypoint data directly on the map by simply clicking on it. This gives the user full control of the GPX data. 

- **Gesture Control**: Allows certain gestures to move the user to another window for easier navigation and access during the route. 

- **Image Upload**: Allows users to take pictures while riding, storing them alongside route files.



### How it works:
The following presents a technical overview of key components and specific operations within our project.

#### Applies to entire project:
- **GPX Files**: The main component of this project is a GPX file. It is what is shared between both the web app and mobile app. The user can manage such files with the ability to write, edit, import, and export.  

- **Utilization of Tracks and Routes**: Keeping up with common practices of GPX data handling, we write to the GPX file using Tracks when recording cycling sessions on the mobile app and Routes when planning future sessions on the web app. 

- **API Calls**: This project uses Google API calls for finding paths between route points, creating the most efficient traversable path for the user.  

- **Secure Management of Sensitive Data**: Our API keys are protected by using .env files that separate confidential data from the main codebase, avoiding version control tracking. We enhance security with Expo Secrets, ensuring they are accessed securely and only within the Expo environment. This guarantees protection and prevents unauthorized access.


#### Applies to Web Application:

- **Route Rendering**: Ability to render and display GPX data from routes created in other platforms. 

- **Manual Route Editing**: Functionality to display route points as a set list gives the user the ability to manually input each route point as a coordinate. 

- **Marker Drag**: Users can manually edit a route by dragging each point on the map to a new location which instantaneously re-renders a new suggested path. 

- **Save to Database**: Allows the user to save the GPX file to a database for easier access.


#### Applies to Mobile Application:

- **Routes/Tracks Rendering**: It is important to differentiate between the Routes and Tracks. We have done so by assigning unique aesthetics to each. When a user wishes to see an already created file, they will see Tracks rendered on the map as a gray dashed line, and Routes as a suggested path with a smooth blue line. 

- **Real Time Recording**: As soon as the user starts their cycling session, a new GPX file with a Track is created and added to the GPX file list. It leverages the user's current location for ongoing location monitoring. Each new location captured during the cycling session is added as a new Trackpoint to the ongoing Track in the GPX file, updating the GPX file dynamically as the user moves. Tracks are be broken up by Segments in case of any connection interruptions. 

- **Main GPX File**: The "Created" files list tab contains a file named "mainGPXFile.gpx" that serves as a master file that holds all the data from all the GPX files in one place giving the user a snapshot of all previous and future cycling sessions. This file is updated as needed to so that it always reflects all GPX files in the lists.   

### Deployment:

Currently, the app is being developed for mobile platforms, with deployment focused on providing Android `.apk` files due to the ease of installation. iOS versions are be available through specific download links, tailored to individual device UDIDs to comply with installation requirements.



## How to run the Project

### Mobile App:
**Prerequisites:** 
- Install Node.Js if you haven’t already, [Here.](https://nodejs.org/en)
- Install Expo using command: 
    ```bash
    npm install -g expo-cli
    ```
- Have a device for testing/builds:
    - *Option 1* - Install the Expo Go app on your phone. Apple/Android compatible.
    - *Option 2* - Install Android Studio, and create a virtual device. Expo has an integrated button that detects virtual android devices, and allows you to open the built app on them.

**Running the mobile app:**

- Clone or download the codebase
- Navigate to the mobile app directory: 
```CapstoneTeam21/ReactApp/GPXImport/GPXImport```
- Open a terminal window (we recommend not running your first project session through git bash as it does not display the needed QR code). 
- Install dependencies with command:
    ```
    npm install
    ```
- Run the project using command:
    ```
    npx expo start
    ``` 
    *or alternatively use:*

    ```
    npx expo start --go
    ```
- Scan the QR code using Expo Go on your phone or open the app on a virtual device using android studio.
If you make changes, you can reload from expo without restarting this process.
- To take advantage of the Google Directions API functionality, collect the necessary keys. see method and requirements [Here.](https://github.com/jbaranie/CapstoneTeam21/blob/dev/Documentation/CodeFeatures/API%20Keys%20and%20Dev%20Accounts.pdf)


    - Place the .env file in the project directory and collect values
    - Both the keys for this app are created using the Google Developer Account
    - .env template: 
    ```
    GOOGLE_API_ANDROID={Key code here without brackets}
    GOOGLE_API_IOS= [Key code here without brackets]
    ```


### Web App:

- Clone or download the codebase if you haven't already. 
- Navigate to the web app directory:     
    ```CapstoneTeam21\ReactBasedWebpage```
- Install dependencies with command:
    ```
    npm install
    ```
- Download Postgresql from [Here](https://www.postgresql.org/) 
- Collect the necessary keys (see method and requirements [Here](https://github.com/jbaranie/CapstoneTeam21/blob/dev/Documentation/CodeFeatures/API%20Keys%20and%20Dev%20Accounts.pdf))

    - Place the .env file in the project directory and collect values
    - Both the keys for this app are created using the Google Developer Account
    - .env template: 
    ```
    REACT_APP_GOOGLEMAPS_KEY= [key code here without brackets]
    REACT_APP_GOOGLEMAPS_MAPID= [key code here without brackets]
    ```
- Run the default start 
    ```
    npm start
    ``` 
    to run the entire application with the access port on localhost.

---
 
**Developers:**

A collaborative effort by students at Arizona State University:
- Abel Mejia
- John French
- Larry Huang
- Jan Baraniecki

Sponsor:
- Dr. Alexandra Mehlhase