# Lahti buses on a map - backend cloud function
Node.js cloud function that fetches real time bus location data from the LSL / Waltti API and serves it in JSON format.

## Deployed version
One instance of backend is deployed as a cloud function at https://europe-west1-lahti-buses.cloudfunctions.net/busdata.

## Frontend
Source for frontend is at https://github.com/mikkokotola/lahtibuses.

One instance of frontend is deployed at https://lahti-buses.appspot.com/.

## How to install to Google cloud
- Register a Waltti Id account - see https://opendata.waltti.fi/getting-started
- Insert your Waltti credentials into file .env at the root folder of the app (see 'configuration' below)
- Register a Google cloud platform account - see https://developers.google.com/maps/gmp-get-started
- Create a cloud function in Google cloud and select Nodejs 8 as the language
- Insert the contents of busfunction.js as the code, insert contents of package.json and set environmental variables as below

## Configuration
Add the following environmental variables to the function (filling in your own Waltti credentials)
WALTTIUSERNAME=xxx
WALTTIPASSWORD=xxx
CITY=lahti

## How it works
The fetcher retrieves data from the Waltti API, augments it with route names and servers the data in JSON format at the function endpoint. 

## Source data
Waltti API documentation is available at https://opendata.waltti.fi/.
