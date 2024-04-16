module.exports = ({ config }) => {
  return {
    ...config,
    "android": {
      "package": "com.capstone21.GPXImport",
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_API_IOS
        }
      }
    },
    "ios": {
      "bundleIdentifier": "com.capstone21.GPXImport",
      "config": {
        "googleMapsApiKey": process.env.GOOGLE_API_IOS
      }
    }
  };
}