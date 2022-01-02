const request = require('request-promise-native');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const parse = require('csv-parse/lib/sync');

const walttiUserName = process.env.WALTTIUSERNAME;
const walttiPassword = process.env.WALTTIPASSWORD;
const city = process.env.CITY;
var routeNames;

exports.getBusData = async (req, res) => {
    // Set CORS headers for preflight requests
    // Allows GETs from any origin with the Content-Type header
    // and caches preflight response for 3600s

    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {
        var busData;
        try {
            busData = await fetchBusData();
        } catch (error) {
            console.log(error);
        }
        res.send(busData);
    }
};

async function fetchBusData() {
  var requestSettings = {
    method: 'GET',
    url: 'https://' + walttiUserName + ':' + walttiPassword + '@data.waltti.fi/' + city + '/api/gtfsrealtime/v1.0/feed/vehicleposition',
    encoding: null    
  };
  var buses = [];
  await request(requestSettings, function (error, response, body) {
    //console.log('Got response from API. Status code: ' + response.statusCode);

    if (!error && response.statusCode == 200) {
      var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      feed.entity.forEach(function(entity) {
        var bus = JSON.parse(JSON.stringify(entity));
        bus.vehicle.trip.routeName = getRouteName(bus.vehicle.trip.routeId);
        buses.push(bus);
      });
    }
  });
  return (buses);
}

function getRouteName(id) {
  if (routeNames === undefined) {
    readRouteNames();    
  }
  
  if (routeNames[id]){
    return routeNames[id]    
  } else {
    return '-';
  }
}

function readRouteNames() {
  routeNamesArr = parse(routeNameData, {
    columns: true,    
    skip_empty_lines: true
  });
  console.log('Read route names into memory')
  routeNames = routeNamesArr.reduce(function(map, bus) {
    map[String(bus.route_id)] = bus.route_short_name;
    return map;
  }, {});
}

const routeNameData = 
`"route_id","agency_id","route_short_name","route_long_name","route_desc","route_type","route_url","route_color","route_text_color","bikes_allowed","include_public_feed"
"1081","6741","8H","Tiilijärvi - Salpakangas - Hedelmätarha - PHKS - Matkakeskus - Kauppatori - Herrasmanni","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"1082","6741","8H","Herrasmanni - Kauppatori - Matkakeskus - PHKS - Hedelmätarha - Salpakangas - Tiilijärvi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"1083","6741","8K","Tiilijärvi - Salpakangas - Hedelmätarha - PHKS - Matkakeskus - Kauppatori - Koivukumpu","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"1084","6741","8K","Koivukumpu - Kauppatori - Matkakeskus - PHKS - Hedelmätarha - Salpakangas - Tiilijärvi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"1085","6741","8KH","Tiilijärvi - Salpakangas - Hedelmätarha - PHKS - Matkakeskus - Kauppatori - Kaukkari - Herrasmanni","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"1086","6741","8KH","Herrasmanni - Kaukkari - Kauppatori - Matkakeskus - PHKS - Hedelmätarha - Salpakangas - Tiilijärvi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"1087","6741","8M","Tiilijärvi - Salpakangas - Hedelmätarha - PHKS - Matkakeskus - Kauppatori - Metsämaa","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"1088","6741","8M","Metsämaa - Kauppatori - Matkakeskus - PHKS - Hedelmätarha - Salpakangas - Tiilijärvi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"2263","4832","49","Lahti - Sysmä","","3","http://www.lsl.fi","FF9900","005EBB","0","1"
"2264","4832","49","Sysmä - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"3401","22375","46","Sysmä - Vääksy - Rantakulma - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"3402","22375","46","Lahti - Rantakulma - Vääksy - Sysmä","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"3411","22375","46","Sysmä - Vääksy - Rantakulma - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"3412","22375","46","Lahti - Rantakulma - Vääksy - Sysmä","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"3421","22375","46","Sysmä - Vääksy - Rantakulma - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"3422","22375","46","Lahti - Rantakulma - Vääksy - Sysmä","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"8011","6741","1K","Karjusaari - Mukkula - Kauppatori - Matkakeskus - Liipola","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"8012","6741","1K","Liipola - Matkakeskus - Kauppatori - Mukkula - Karjusaari","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"8013","6741","1S","Soltti - Mukkula - Kauppatori - Matkakeskus - Liipola","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"8014","6741","1S","Liipola - Matkakeskus - Kauppatori - Mukkula - Soltti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"8015","6741","1Y","Soltti - Mukkula - Niemi - Kauppatori - Matkakeskus - Liipola - Patomäki - Renkomäki","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"8016","6741","1Y","Renkomäki - Patomäki - Liipola - Matkakeskus - Kauppatori - Niemi - Mukkula - Soltti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"8111","6741","11B","Hollola kk - Hälvälä - Työtjärvi - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"8112","6741","11B","Salpakangas - Messilä - Pyhäniemi - Hollola kk","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"8113","6741","11A","Hollola kk - Pyhäniemi - Messilä - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"8114","6741","11A","Salpakangas - Työtjärvi - Hälvälä - Hollola kk","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"8116","6741","11B","Messilä - Hollola kk","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9021","6741","2","Metsä-Pietilä - Matkakeskus - Kauppatori - Viuha","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9022","6741","2","Viuha - Kauppatori - Matkakeskus - Metsä-Pietilä","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9031","6741","3","Hiekkanummi - Kauppatori - Matkakeskus","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9032","6741","3","Matkakeskus - Kauppatori - Hiekkanummi","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9033","6741","3S","Mäkelä - Kauppatori - Matkakeskus - PHKS","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9034","6741","3S","PHKS - Matkakeskus - Kauppatori - Mäkelä","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9035","6741","3K","Hiekkanummi - Kauppatori - Matkakeskus - PHKS","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9036","6741","3K","PHKS - Matkakeskus","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9037","6741","3T","Hiekkanummi - Tonttila - Kauppatori - Matkakeskus","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9038","6741","3T","Matkakeskus - Kauppatori - Tonttila - Hiekkanummi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9041","6741","4","Tiilikangas - Salpakangas - PHKS - Kauppatori - Matkakeskus - Villähde - Nastola kk - Rakokivi - Uusikylä","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9042","6741","4","Uusikylä - Rakokivi - Nastola kk - Villähde - Matkakeskus - Kauppatori - PHKS - Salpakangas - Tiilikangas","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9043","6741","4H","Tiilikangas - Salpakangas - PHKS - Kauppatori - Matkakeskus - Villähde - Nastola kk - Rakokivi - Harjuviidantie","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9044","6741","4H","Harjuviidantie - Rakokivi - Nastola kk - Villähde - Matkakeskus - Kauppatori - PHKS - Salpakangas - Tiilikangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9045","6741","4Y","Tiilikangas - Tiilijärvi - Salpakangas - Hedelmätarha - PHKS - Matkakeskus - Kauppatori - Villähde - Nastola kk - Rakokivi - Uusikylä","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9046","6741","4Y","Uusikylä - Rakokivi - Nastola kk - Villähde - Matkakeskus - Kauppatori - PHKS - Hedelmätarha - Salpakangas - Tiilijärvi - Tiilikangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9051","6741","5","Metsäkangas - Matkakeskus - Kauppatori - Kiveriö - Metsäpelto - Hörölä","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9052","6741","5","Hörölä - Kiveriö - Kauppatori - Matkakeskus - Metsäkangas","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9061","6741","6","Riihelä - Kauppatori - Matkakeskus - Saksala","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9062","6741","6","Saksala - Matkakeskus - Kauppatori - Riihelä","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9071","6758","7","Karisto - Kauppatori - Matkakeskus - Renkomäki","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9072","6758","7","Renkomäki - Matkakeskus - Kauppatori - Karisto","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9073","6758","7T","Karisto - Kauppatori - Matkakeskus - Tupalankatu - Renkomäki","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9074","6758","7T","Renkomäki - Tupalankatu - Matkakeskus - Kauppatori - Karisto","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9075","6758","7KR","Kauppatori - Renkomäki","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9076","6758","7KR","Renkomäki - Kauppatori","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9077","6758","7KK","Karisto - Kauppatori","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9078","6758","7KK","Kauppatori - Karisto","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9081","6741","8H","Tiilijärvi - Salpakangas - Hedelmätarha - PHKS - Matkakeskus - Kauppatori - Herrasmanni","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9082","6741","8H","Herrasmanni - Kauppatori - Matkakeskus - PHKS - Hedelmätarha - Salpakangas - Tiilijärvi","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9083","6741","8K","Tiilijärvi - Salpakangas - Hedelmätarha - PHKS - Matkakeskus - Kauppatori - Koivukumpu","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9084","6741","8K","Koivukumpu - Kauppatori - Matkakeskus - PHKS - Hedelmätarha - Salpakangas - Tiilijärvi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9091","6741","9","Metsämaa - Kauppatori - Matkakeskus - Nastola kk - Rakokivi - Harjuviidantie","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9092","6741","9","Harjuviidantie - Rakokivi - Nastola kk - Matkakeskus - Kauppatori - Metsämaa","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9093","6741","9K","Metsämaa - Kauppatori - Matkakeskus - Kouvolantie - Rakokivi - Harjuviidantie","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9094","6741","9K","Harjuviidantie - Rakokivi - Kouvolantie - Matkakeskus - Kauppatori - Metsämaa","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9095","6741","9B","Metsämaa - Kauppatori","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9096","6741","9B","Kauppatori - Metsämaa","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9097","6741","9K","Kauppatori - Matkakeskus - Villähde - Kouvolantie - Rakokivi - Harjuviidantie","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9121","6758","12","Kauppatori - Metsä-Hennala - Ala-Okeroinen","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9122","6758","12","Ala-Okeroinen - Metsä-Hennala - Kauppatori","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9123","6758","12R","Kauppatori - Jokimaa - Ala-Okeroinen","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9124","6758","12R","Ala-Okeroinen - Jokimaa - Kauppatori","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9125","6758","12B","Kauppatori - Ala-Okeroinen","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9131","6758","13","Niemi - Nikkilä","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9132","6758","13","Nikkilä - Niemi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9161","6741","16","Kauppatori - Vipusenkatu","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9162","6741","16","Vipusenkatu - Kauppatori","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9171","6758","17","Joutjärvi - Matkakeskus - Kauppatori - Ruoriniemi","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9172","6758","17","Ruoriniemi - Kauppatori - Matkakeskus - Joutjärvi","","3","http://www.lsl.fi","FF9900","005DB9","0","1"
"9181","6758","18","Paasikivenkatu - Kauppatori - Kiveriö","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9182","6758","18","Kiveriö - Kauppatori","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9191","6758","19","Kauppatori - Pyhätön","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9192","6758","19","Pyhätön - Kauppatori - Paasikivenkatu","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9201","6741","20","Hollola kk - Kauppatori","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9202","6741","20","Kauppatori - Hollola kk","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9221","6741","22","Mukkula - Niemi - Kauppatori - Matkakeskus - Asemantausta - Patoniitty - Myyntimiehenkatu","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9222","6741","22","Myyntimiehenkatu - Patoniitty - Asemantausta - Matkakeskus - Kauppatori - Niemi - Mukkula","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9231","6741","23","Kukkila - Kauppatori","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9232","6741","23","Kauppatori - Kukkila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9281","6741","28","Kiikkula - Tarjantie - Kauppatori - Tonttila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9282","6741","28","Tonttila - Kauppatori - Tarjantie - Kiikkula","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9283","6741","28R","Rautakankare - Kauppatori - Tonttila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9284","6741","28R","Tonttila - Kauppatori - Rautakankare","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9285","6741","28K","Korpikankare - Kauppatori - Tonttila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9286","6741","28K","Tonttila - Kauppatori - Korpikankare","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9287","6741","28KT","Korpikankare - Tarjantie - Kauppatori - Tonttila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9288","6741","28KT","Tonttila - Kauppatori - Tarjantie - Korpikankare","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9289","6741","28KR","Korpikankare - Rautakankare - Kauppatori - Tonttila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9301","6758","30","Ämmälä - Laune - Keskusta - Laune - Ämmälä","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9302","6758","30","Hiekkanummi - Karisto - Keskusta - Karisto - Hiekkanummi","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9303","6758","30","Soltti - Paavola - Keskusta - Paavola - Soltti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9304","6758","30","Jalkaranta - Laune - Keskusta - Laune - Jalkaranta","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9401","6758","40","Vääksy - Vesivehmaa - Paimela - Lahti","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9402","6758","40","Lahti - Paimela - Vesivehmaa - Vääksy","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9403","6758","40A","Asikkala kk - Vääksy - Vesivehmaa - Paimela - Lahti","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9404","6758","40A","Lahti - Paimela - Vesivehmaa - Vääksy - Asikkala kk","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9411","6758","41","Vääksy - Rantakulma - Lahti","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9412","6758","41","Lahti - Rantakulma - Vääksy","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9423","6741","42","Padasjoki - Kurhila - Vääksy - Rantakulma - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9424","6741","42","Lahti - Rantakulma - Vääksy - Kurhila - Padasjoki","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9431","6758","43","Heinlammi - Kalliola - Metsäkulma - Paimela - Kalliola","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9441","6758","44","Vääksy - Asikkala kk - Pulkkilanharju - Vääksy","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9451","6758","45","Vääksy - Salonsaari - Urajärvi - Vesivehmaa","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9452","6758","45","Urajärvi - Salonsaari - Vääksy","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9453","6758","45A","Vääksy - Urajärvi - Vesivehmaa - Vääksy","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9511","6741","51","Sairakkala - Tennilä - Kukonkoivu - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9512","6741","51","Salpakankaan koulu - Salpakangas - Kukonkoivu - Tennilä - Sairakkala","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9521","6741","52","Tennilä - Heinäsuo - Hurola - Herrala - Korpikylä - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9522","6741","52","Salpakangas - Korpikylä - Herrala - Hurola - Heinäsuo - Tennilä","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9551","6741","55","Miekkiö - Okeroinen - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9552","6741","55","Salpakangas - Okeroinen - Miekkiö","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9561","6741","56","Korpikylä - Herrala - Nostava - Okeroinen - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9562","6741","56","Salpakangas - Okeroinen - Nostava - Herrala - Korpikylä","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9571","6741","57","Hollola kk - Pyhäniemi - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9572","6741","57","Salpakangas - Pyhäniemi - Hollola kk","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9573","6741","57","Hollola kk - Pyhäniemi - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9581","6741","58","Hatsina - Hollola kk - Pyhäniemi - Hälvälä - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9582","6741","58","Salpakangas - Hälvälä - Pyhäniemi - Hollola kk - Harsina - Sairakkala","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9583","6741","58","Hatsina - Hollola kk - Hälvälä - Salpakangas","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9601","6758","60","Lahti - Orimattila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9602","6758","60","Orimattila - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9611","6758","61","Lahti - Renkomäki - Pasina - Pennala - Orimattila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9612","6758","61","Orimattila - Pennala - Pasina - Renkomäki - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9691","6758","69","Heinola kk - Heinola - Jyränkö - Urheiluopisto - Vierumäki - Lahti - Orimattila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9692","6758","69","Orimattila - Lahti - Vierumäki - Urheiluopisto - Jyränkö - Heinola - Heinola kk","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9701","6758","70","Tommola - Heinola - Lahti - PHKS","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9702","6758","70","PHKS - Lahti - Heinola - Tommola","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9703","6758","70A","Tommola - Heinola - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9704","6758","70A","Lahti - Heinola - Tommola","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9711","6758","71","Heinola kk - Heinola - Jyränkö - Vierumäki - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9712","6758","71","Lahti - Vierumäki - Jyränkö - Heinola - Heinola kk","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9721","6758","72","Reumanmäki - Heinola - Urheiluopisto - Vierumäki - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9722","6758","72","Lahti - Vierumäki - Urheiluopisto - Heinola - Reumanmäki","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9731","6758","73","Heinola kk - Heinola - Jyränkö - Urheiluopisto - Vierumäki - Lahti","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9732","6758","73","Lahti - Vierumäki - Urheiluopisto - Jyränkö - Heinola - Heinola kk","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9741","6758","74","Pirttiniemi - Kaivokatu","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9742","6758","74","Kaivokatu - Pirttiniemi","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9743","6758","74A","Pirttiniemi - Kaivokatu - Hevossaari","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9744","6758","74A","Hevossaari - Kaivokatu - Pirttiniemi","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9745","6758","74B","Pirttiniemi - Vuohkallio - Mustikkahaka - Kaivokatu","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9746","6758","74B","Kaivokatu - Mustikkahaka - Vuohkallio - Pirttiniemi","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9791","6758","69","Heinola kk - Heinola - Jyränkö - Urheiluopisto - Vierumäki - Lahti - Orimattila","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9792","6758","69","Orimattila - Lahti - Vierumäki - Urheiluopisto - Jyränkö - Heinola - Heinola kk","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9811","75918","81A","Keskusta - Tommola - Kirkonkylä - Keskusta","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9812","75918","81B","Keskusta - Jyränkö - Mustikkahaka - Keskusta","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9813","75918","81C","Keskusta - Myllyoja - Tommola - Keskusta","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9814","75918","81D","Keskusta - Kirkonkylä - Jyränkö - Keskusta","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9815","75918","81E","Keskusta - Mustikkahaka - Myllyoja - Keskusta","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9817","75918","81","Kaivokatu - Mustikkahaka - Vuohkallio","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9818","75918","81","Vuohkallio - Mustikkahaka - Kaivokatu","","3","http://www.lsl.fi","FF9900","005EBB","","1"
"9901","6758","90","Orimattila - Kokki-Henna - Luhtikylä - Orimattilan koulukeskus - Jokivarren koulu - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9902","6758","90K","Orimattila - Luhtikylä - Kokki-Henna","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9903","6758","90A","Orimattilan koulukeskus - Orionaukio - Jokivarren koulu - Mallusjoki - Huhdanoja - Luhtikylä - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9911","6758","91","Orimattila - Pakaa - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9912","6758","91A","Orimattila - Niinikoski - Pakaa - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9913","6758","91B","Orimattila - Pakaa - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9915","6758","91T","Orimattila - Pakaa - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9917","6758","91S","Orimattila - Jokivarren koulu - Niinikoski - Pakaa - Koulutie - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9919","6758","91K","Orimattila - Jokivarren koulu - Niinikoski - Pakaa - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9921","6758","92","Huhdanoja - Kurunkulma - Mallusjoki - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9923","6758","92A","Orimattila, koulukeskus - Orionaukio - Mallusjoki - Paapio - Huhdanoja - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9931","6758","93","Kuivanto - Montari - Heinämaa - Virenojan koulu - Koulukeskus - Jokivarren koulu - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9932","6758","93","Orimattila - Koulukeskus - Virenojan koulu - Heinämaa - Montari - Kuivanto","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9933","6758","93A","Montari - Heinämaa - Virenojan koulu","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9935","6758","93B","Virenojan koulu - Heinämaa - Montari - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9941","6758","94","Artjärvi - Niinikoski - Jokivarren koulu - Koulukeskus - Orimattila","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9942","6758","94","Orimattila - Koulukeskus - Jokivarren koulu - Niinikoski - Artjärvi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9981","6741","98","Mäntyläntie th - Vuolenkoskentie ja Vierumäentie th - Korkeentie ja Pärnämäentie th - Kumiantie ja Arrakantie th - Rakokivi","","3","http://www.lsl.fi","FF9900","005DB9","","1"
"9982","6741","98","Kukkasen koulu - Kirkonkylän koulu - Kumiantie ja Arrakantie th - Korkeentie ja Pärnämäentie th - Vuolenkosken ja Vierumäentie th","","3","http://www.lsl.fi","FF9900","005DB9","","1"`