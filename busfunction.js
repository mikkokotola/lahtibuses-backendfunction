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
`"route_id","agency_id","route_short_name","route_long_name","route_desc","route_type","route_url","route_color","route_text_color","bikes_allowed"
"1401","7345","140","LAHTI","","3","","FFFFFF","000000",""
"1402","7345","140","SYSMÄ","","3","","FFFFFF","000000",""
"1462","7345","146","HIETALAHTI TH - VÄÄKSY","","3","","FFFFFF","000000",""
"2401","23098","240","SYSMÄ-LAHTI","","3","","FFFFFF","000000",""
"2402","23098","240","LAHTI-SYSMÄ","","3","","FFFFFF","000000",""
"2481","23098","248","SYSMÄ-HEINOLA","","3","","FFFFFF","000000",""
"2482","23098","248","HEINOLA-SYSMÄ","","3","","FFFFFF","000000",""
"9011","6741","1","JALKARANTA - LIIPOLA","","3","","FFFFFF","000000","0"
"9012","6741","1","LIIPOLA - JALKARANTA","","3","","FFFFFF","000000","0"
"9021","6741","2","METSÄ-PIETILÄ - ASEMANTAUSTA - MATKAKESKUS - KAUPPATORI - TONTTILA - VIUHA","","3","","FFFFFF","000000","0"
"9022","6741","2","VIUHA - TONTTILA - KAUPPATORI - MATKAKESKUS - ASEMANTAUSTA - METSÄ-PIETILÄ","","3","","FFFFFF","000000","0"
"9031","6741","3","HIEKKANUMMI-KAUPPATORI-MATKAKESKUS -(PHKS)","","3","","FFFFFF","000000","0"
"9032","6741","3","(PHKS)-MATKAKESKUS-KAUPPATORI-HIEKKANUMMI","","3","","FFFFFF","000000","0"
"9041","6741","4","NASTOLA-VILLÄHDE-MATKAKESKUS-KAUPPATORI-P-H KESKUSSAIRAALA-TIILIKANGAS","","3","","FFFFFF","000000","0"
"9042","6741","4","TIILIKANGAS-SALPAKANGAS-PHKS-KAUPPATORI-MATKAKESKUS-VILLÄHDE-NASTOLA","","3","","FFFFFF","000000","0"
"9051","6741","5","METSÄKANGAS-MATKAKESKUS-KAUPPATORI-KIVERIÖ-METSÄPELTO-HÖRÖLÄ","","3","","FFFFFF","000000","0"
"9052","6741","5","HÖRÖLÄ-KIVERIÖ-KAUPPATORI-MATKAKESKUS-METSÄKANGAS","","3","","FFFFFF","000000","0"
"9071","6741","7","KARISTO-KAUPPATORI-MATKAKESKUS-RENKOMÄKI-ÄMMÄLÄ","","3","","FFFFFF","000000","0"
"9072","6741","7","ÄMMÄLÄ-RENKOMÄKI-MATKAKESKUS-KAUPPATORI-KARISTO","","3","","FFFFFF","000000","0"
"9081","6741","8","METSÄMAA-KAUPPATORI-MATKAKESKUS-PHKS-TIILIJÄRVI","","3","","FFFFFF","000000","0"
"9082","6741","8","TIILIJÄRVI-SALPAKANGAS-HEDELMÄTARHA-PHKS-MATKAKESKUS-KAUPPATORI-METSÄMAA","","3","","FFFFFF","000000","0"
"9091","6741","9","METSÄMAA - KAUPPATORI - MATKAKESKUS - VILLÄHDE - NASTOLA KK - RAKOKIVI - HARJUVIIDANTIE","","3","","FFFFFF","000000",""
"9092","6741","9","HARJUVIIDANTIE - RAKOKIVI - NASTOLA KK - VILLÄHDE - MATKAKESKUS - KAUPPATORI - METSÄMAA","","3","","FFFFFF","000000",""
"9101","6741","10","SALPAKANGAS-KAUPPATORI","","3","","FFFFFF","000000",""
"9102","6741","10","KAUPPATORI-SALPAKANGAS","","3","","FFFFFF","000000",""
"9111","6741","11","HERRASMANNI/KOIVUKUMPU-KAUPPATORI-KESKUSSAIRAALA-(HOLLOLA KK)","","3","","FFFFFF","000000","0"
"9112","6741","11","KESKUSSAIRAALA-KAUPPATORI-HERRASMANNI/KOIVUKUMPU","","3","","FFFFFF","000000",""
"9121","6741","12","ALA-OKEROINEN-MATKAKESKUS-KAUPPATORI-KIVERIÖ","","3","","FFFFFF","000000","0"
"9122","6741","12","KIVERIÖ-KAUPPATORI-MATKAKESKUS-ALA-OKEROINEN","","3","","FFFFFF","000000","0"
"9131","6741","13","PYHÄTÖN - KAUPPATORI - MATKAKESKUS - NIKKILÄ","","3","","FFFFFF","000000","0"
"9132","6741","13","NIKKILÄ - MATKAKESKUS - KAUPPATORI - PYHÄTÖN","","3","","FFFFFF","000000","0"
"9161","6741","16","PATONIITTY - KAUPPATORI - VIPUSENKATU","","3","","FFFFFF","000000","0"
"9162","6741","16","VIPUSENKATU - KAUPPATORI - PATONIITTY","","3","","FFFFFF","000000","0"
"9171","6741","17","JOUTJÄRVI - MATKAKESKUS - KAUPPATORI - RUORINIEMI","","3","","FFFFFF","000000","0"
"9172","6741","17","RUORINIEMI - KAUPPATORI - MATKAKESKUS - JOUTJÄRVI","","3","","FFFFFF","000000","0"
"9181","6741","18","PAASIKIVENKATU-KAUPPATORI-KIVERIÖ","","3","","FFFFFF","000000",""
"9182","6741","18","KIVERIÖ-KAUPPATORI-PAASIKIVENKATU","","3","","FFFFFF","000000",""
"9191","6741","19","PAASIKIVENKATU-KAUPPATORI-PYHÄTÖN","","3","","FFFFFF","000000",""
"9192","6741","19","PYHÄTÖN-KAUPPATORI-PAASIKIVENKATU","","3","","FFFFFF","000000",""
"9201","6741","20","HOLLOLA KK-KAUPPATORI","","3","","FFFFFF","000000",""
"9202","6741","20","KAUPPATORI-HOLLOLA KK","","3","","FFFFFF","000000",""
"9211","6741","21","RIIHELÄ-KASAKKAMÄKI-MATKAKESKUS-KAUPPATORI-NIEMI-MUKKULA","","3","","FFFFFF","000000","0"
"9212","6741","21","MUKKULA-NIEMI-KAUPPATORI-MATKAKESKUS-KASAKKAMÄKI-RIIHELÄ","","3","","FFFFFF","000000","0"
"9311","6741","31","SOLTTI-MUKKULA-KAUPPATORI-MATKAKESKUS-PATONIITTY-MYYNTIMIEHENKATU","","3","","FFFFFF","000000","0"
"9312","6741","31","MYYNTIMIEHENKATU-PATONIITTY-MATKAKESKUS-KAUPPATORI-MUKKULA-SOLTTI","","3","","FFFFFF","000000","0"
"9321","6741","32","KARJUSAARI-MUKKULA-KAUPPATORI-MATKAKESKUS-SAKSALA","","3","","FFFFFF","000000","0"
"9322","6741","32","SAKSALA-MATKAKESKUS-KAUPPATORI-LEPOLANKATU-MUKKULA-KARJUSAARI","","3","","FFFFFF","000000","0"
"9331","6741","33","KUKKILA-KAUPPATORI","","3","","FFFFFF","000000",""
"9332","6741","33","KAUPPATORI-KUKKILA","","3","","FFFFFF","000000",""
"9351","6741","35","PHKS-TARJANTIE-KAUPPATORI-LEPOLANKATU-MUKKULA-KILPIÄINEN","","3","","FFFFFF","000000","0"
"9352","6741","35","KILPIÄINEN-MUKKULA-LEPOLANKATU-KAUPPATORI-TARJANTIE-PHKS","","3","","FFFFFF","000000","0"
"9401","6758","40","SYSMÄ-VÄÄKSY-LAHTI","","3","","FFFFFF","000000",""
"9402","6758","40","LAHTI-VÄÄKSY-SYSMÄ","","3","","FFFFFF","000000",""
"9451","6758","45","PAIMELAN KOULU-KUKKILA-KILPIÄINEN-METSÄKULMA","","3","","FFFFFF","000000",""
"9461","6758","46","ASIKKALA KK-VÄÄKSY-URAJÄRVI","","3","","FFFFFF","000000",""
"9462","6758","46","URAJÄRVI-VÄÄKSY-ASIKKALA KK","","3","","FFFFFF","000000",""
"9471","22375","47","HARTOLA-SYSMÄ","","3","","FFFFFF","000000",""
"9472","22375","47","SYSMÄ-HARTOLA","","3","","FFFFFF","000000",""
"9481","22375","48","SYSMÄ-LUSI-HEINOLA","","3","","FFFFFF","000000",""
"9482","22375","48","HEINOLA-LUSI-SYSMÄ","","3","","FFFFFF","000000",""
"9491","22375","49","SYSMÄ-ONKINIEMI (-HEINOLA)","","3","","FFFFFF","000000",""
"9492","22375","49","(HEINOLA-) ONKINIEMI-SYSMÄ","","3","","FFFFFF","000000",""
"9511","6741","51","PYSÄKKITIE/SILTAHAARANTIE TH-SILTALA-TENNILÄ-KUKONKOIVU-HÄLVÄLÄ-SALPAKANKAAN KOULU-HOLLOLA YA","","3","","FFFFFF","000000",""
"9512","6741","51","SALPAKANKAAN KOULU-HOLLOLA YA-HÄLVÄLÄ-KUKONKOIVU-TENNILÄ-HEINÄSUON TH-SILTALA-TENNILÄNTIE TH","","3","","FFFFFF","000000",""
"9521","6741","52","RIIHIMÄENTIE/HEINÄSUONTIE TH-HERRALA-KORPIKYLÄ-KUKONKOIVU-HÄLVÄLÄ-SALPAKANKAAN KOULU-HOLLOLAN YA","","3","","FFFFFF","000000",""
"9522","6741","52","SALPAKANKAAN KOULU-HOLLOLAN YA-HÄLVÄLÄ-KUKONKOIVU-KORPIKYLÄ-HERRALA-RIIHIMÄENTIE/HEINÄSUONTIE TH","","3","","FFFFFF","000000",""
"9541","6741","54","MARTTILA - JÄRVENTAUSTANTIE TH - KOUKUNTIE TH - JÄRVELÄ - KÄRKÖLÄ KK - TENNILÄ - SORAMÄKI - SALPAKANGAS - PHKS - KAUPPATORI","","3","","FFFFFF","000000",""
"9551","6741","55","MIEKKIÖ-OKEROINEN-HOLLOLAN YA-SALPAKANKAAN KOULU","","3","","FFFFFF","000000",""
"9552","6741","55","HOLLOLAN YA-SALPAKANKAAN KOULU-OKEROINEN-MIEKKIÖ","","3","","FFFFFF","000000",""
"9561","6741","56","LINTULANTIE TH-LUHTIKYLÄ-HERRALA-NOSTAVA-PAJAPELLONKATU-HOLLOLAN YA-SALPAKANKAAN KOULU","","3","","FFFFFF","000000",""
"9562","6741","56","HOLLOLAN YA/SALPAKANKAAN KOULU-PAJAPELLONKATU-NOSTAVA-HERRALA-LUHTIKYLÄ-LINTULANTIE TH","","3","","FFFFFF","000000",""
"9621","6741","62","HATSINA - USKILA - HERSALANTIE TH - MARJASTENTIE TH - PYHÄNIEMEN KOULU - TIIRISMAANTIE TH - HOLLOLA YA - SALPAKANKAAN KOULU","","3","","FFFFFF","000000",""
"9622","6741","62","SALPAKANKAAN KOULU - MESSILÄ - PYHÄNIEMEN KOULU - KUTAJOKI - SIIKANIEMEN TH - HOLLOLAN KIRKKO - USKILA - MANSKIVENTIE TH","","3","","FFFFFF","000000",""
"9631","6741","63","KASTARIN TH - SAIRAKKALA - TOIVOLANTIE TH - KYLÄ-HORKANTIE TH - KANTOLANTIE TH - JOENTAUKSENTIE TH - RIIHIMÄENTIE TH - PYSÄKKITIE TH - TENNILÄ - KUKONKOIVU - HÄLVÄLÄN KOULU - SALPAKANKAAN KOULU - HOLLOLAN YA","","3","","FFFFFF","000000",""
"9632","6741","63","SALPAKANGAS - HOLLOLAN YA - JARVALANTIE TH - TENNILÄ - KOKKOSALO - SAIRAKKALA - JÄRVENTAUSTA - MANSKIVENTIE TH","","3","","FFFFFF","000000",""
"9801","75918","80","KESKUSTA - TOMMOLA - KESKUSTA","","3","","FFFFFF","000000",""
"9802","75918","80","KESKUSTA - AAPELINPELTO - KIRKONKYLÄ - LAKEASUO - RAINIO - KESKUSTA","","3","","FFFFFF","000000","0"
"9861","6758","86","KAIVOKATU-PIRTTINIEMI(-HEVOSSAARI)","","3","","FFFFFF","000000","0"
"9862","6758","86","(HEVOSSAARI-)PIRTTINIEMI-KAIVOKATU","","3","","FFFFFF","000000","0"
"9871","6758","87","TOMMOLA-KAIVOKATU-VIERUMÄKI-MATKAKESKUS-PHKS","","3","","FFFFFF","000000","0"
"9872","6758","87","PHKS-MATKAKESKUS-VIERUMÄKI-KAIVOKATU-TOMMOLA","","3","","FFFFFF","000000","0"
"9881","6758","88","ORIMATTILA-MATKAKESKUS-KAUPPATORI-VIERUMÄKI-URHEILUOPISTO-KAIVOKATU-REUMANMÄKI","","3","","FFFFFF","000000","0"
"9882","6758","88","REUMANMÄKI-KAIVOKATU-URHEILUOPISTO-VIERUMÄKI-KAUPPATORI-MATKAKESKUS-ORIMATTILA","","3","","FFFFFF","000000","0"
"9891","6758","89","ORIMATTILA-MATKAKESKUS-KAUPPATORI-VIERUMÄKI-JYRÄNKÖ-KAIVOKATU-MUSTIKKAHAKA-HEINOLA KK","","3","","FFFFFF","000000","0"
"9892","6758","89","HEINOLA KK-MUSTIKKAHAKA-KAIVOKATU-JYRÄNKÖ-VIERUMÄKI-KAUPPATORI-MATKAKESKUS-ORIMATTILA","","3","","FFFFFF","000000","0"
"9901","6758","90","ORIMATTILA, ORIONAUKIO - KOKKI-HENNA - LUHTIKYLÄ- ORIMATTILAN KOULUKESKUS - JOKIVARREN KOULU - ORIONAUKIO","","3","","FFFFFF","000000",""
"9902","6758","90","ORIMATTILA, ORIONAUKIO - LUHTIKYLÄ - KOKKI-HENNA","","3","","FFFFFF","000000",""
"9911","6758","91","ORIMATTILA - PAKAA - ORIMATTILA","","3","","FFFFFF","000000",""
"9921","6758","92","PAAPIO-HUHDANOJA-KOULUKESKUS-ORIMATTILA, ORINAUKIO","","3","","FFFFFF","000000",""
"9931","6758","93","KUIVANTO-MONTARI-HEINÄMAA-VIRENOJAN KOULU-KOULUKESKUS-JOKIVARREN KOULU-ORIMATTILA, ORIONAUKIO","","3","","FFFFFF","000000",""
"9932","6758","93","ORIMATTILA, ORIONAUKIO-KOULUKESKUS-VIRENOJAN KOULU-HEINÄMAA-MONTARI-KUIVANTO","","3","","FFFFFF","000000",""
"9941","6758","94","ARTJÄRVI-NIINIKOSKI-JOKIVARREN KOULU-KOULUKESKUS-ORIMATTILA, ORIONAUKIO","","3","","FFFFFF","000000",""
"9942","6758","94","ORIMATTILA, ORIONAUKIO-KOULUKESKUS-JOKIVARREN KOULU-NIINIKOSKI-ARTJÄRVI","","3","","FFFFFF","000000",""
"9981","6741","98","MÄNTYLÄNTIE TH - VUOLENKOSKENTIE JA VIERUMÄENTIE TH - KORKEENTIE JA PÄRNÄMÄENTIE TH - KUMIANTIE JA ARRAKANTIE TH - MÄNNISTÖN KOULU","","3","","FFFFFF","000000",""
"9982","6741","98","KUKKASEN KOULU/MÄNNISTÖN KOULU - KIRKONKYLÄN KOULU - KUMIANTIE JA ARRAKANTIE TH - KORKEENTIE JA PÄRNÄMÄENTIE TH - VUOLENKOSKEN JA VIERUMÄENTIE TH","","3","","FFFFFF","000000",""`