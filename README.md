# Lahti buses on a map - backend cloud function
Node.js cloud function that fetches real time bus location data from the LSL / Waltti API and serves it in JSON format.

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
