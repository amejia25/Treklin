SER Capstone 2023-2024 Group 21
SER401 [76999]
SER402 [TBD]

Members:
- Jan Baraniecki
- John French
- Larry Huang
- Abel Mejia


Sponsor: Dr. Alexandra Mehlhase

The purpose of this project is to create a cycling route app able to mark places on a route as good, bad, or points of interest. The idea is that the app is very simple and allows a user to quickly highlight a spot.
Further points of development:
- Routes should be controllable/modifiable by the user.
- On a web interface or on the phone it should allow the user to upload a GPX file with route information and highlight the sports and allow the user to add further information and images to these sports.
  - Especially interesting would be "bad road", "too much traffic", "great road", "point of interest".
- Later on it should be possible to load in a gpx and the tool should show all the highlights on that route, so that while planning new routes we can easily see if some points of interest are close by, or if a bad road part was included so the user can make changes to it.
- Existing route planning already allows people to take pictures while riding, storing them alongside route files; here it is more about classifying specific points.
  - Preferably this could later on be integrated into Komoot but probably beyond the scope of this project.
  - For a start it would be to highlight spots, be able to tag them, provide more detailed info if needed and save them in a map.
  - Then be able to load a route into it and see if there are any tags on that route so that we include good things on the route.
  - Changing the gpx in the app would be nice but can be an add on later.

Deployment

Mobile app directory: _project_/ReactApp/GPXImport/GPXImport/

Release versions (currently in development) will only Android .apk files and download links for iOS. This is because iOS downloads require device UDIDs to install anyways, so the link will only work on specific devices. The Android .apk files are for any sufficiently up-to-date Android device.
