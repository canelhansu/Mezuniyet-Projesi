const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});
 

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log("Whatsapp'a giriş sağlandı!");
});


const axios = require('axios');
const cheerio = require('cheerio');

async function getEarthquakeData() {
    const url = "http://www.koeri.boun.edu.tr/scripts/lst5.asp"; 

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const data = $('pre').text(); 
    const lines = data.split('\n'); 

    const earthquakes = [];

    
    for(let i = 6; i < lines.length; i++) {
        const line = lines[i];

      
        const date = line.substr(0, 10).trim();
        const time = line.substr(11, 8).trim();
        const latitude = line.substr(20, 7).trim();
        const longitude = line.substr(28, 7).trim();
        const depth = line.substr(46, 5).trim();
        let magnitudes = line.substr(60, 5).trim(); 
        const location = line.substr(71, 36).trim() 
        const solution = line.substr(121, 33).trim().replace("�", "İ");

        if(date) {
            earthquakes.push({
                date,
                time,
                latitude,
                longitude,
                depth,
                magnitudes,
                location,
                solution
            });
        }
    }

    return earthquakes;
}


function compareArrays(a, b) {
    let items = []
   JSON.stringify()
    for (let item of a) {
        if (!JSON.stringify(b).includes(JSON.stringify(item))) {
           items.push(item);

        }
    }

    return items.length > 0 ? {status: true, data: items} : {status: false};
}


async function Main() {
    let sayi = 0
    var mce = [];
setInterval(async () => {
    sayi++
let Depremler = await getEarthquakeData()
if (sayi == 1) return mce = Depremler;
let check = compareArrays(Depremler, mce)
// console.log("Değişiklik Durumu: "+check.status);
if(check.status == true) {
    for (const deprem of check.data) {
        mce.push(deprem)
        console.log(deprem);

        let message = 
  `*DEPREM OLDU ⚠️*\n
  *${deprem.date}* tarihinde, *${deprem.time}* saatinde, *${deprem.location}* bölgesinde bir deprem meydana geldi.\n
  Depremin büyüklüğü *${deprem.magnitudes}* büyüklüğünde ve yerin *${deprem.depth}* km derinliğinde gerçekleşti.
  Depremin merkez üssü koordinatları ise *${deprem.latitude}* enlem ve *${deprem.longitude}* boylam olarak ölçüldü.\n
  Bu depremin çözümü *${deprem.solution}* olarak belirlenmiştir.`

  const contacts = await client.getContacts()
  const contact = contacts.find(({ isGroup, name }) => isGroup === true && name === "DEPREM");
  const { id: { _serialized: chatId } } = contact
await client.sendMessage(chatId, message);
    }

}

    }, 5000);

}


Main()


client.initialize();