// QR kod oluşturmak için 'qrcode-terminal' paketi kullanılır.
const qrcode = require('qrcode-terminal');

// WhatsApp Web API'si için 'whatsapp-web.js' kütüphanesi kullanılır.
const { Client, LocalAuth } = require('whatsapp-web.js');

// Yeni bir WhatsApp client oluşturulur. Bu client, QR kod kullanılarak kullanıcının WhatsApp hesabına bağlanmayı sağlar.
const client = new Client({
    authStrategy: new LocalAuth()
});

// QR kodun oluşturulması ve küçük boyutlandırılması
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Kullanıcının WhatsApp hesabına başarılı bir şekilde giriş yaptığında, bir mesaj gösterilir.
client.on('ready', () => {
    console.log("Whatsapp'a giriş sağlandı!");
});


// 'axios' paketi, HTTP isteklerini göndermek için kullanılır.
// 'cheerio' paketi, HTTP istekleri sonucunda gelen HTML verisini parse etmek ve üzerinde işlem yapabilmek için kullanılır.
const axios = require('axios');
const cheerio = require('cheerio');

// Bu fonksiyon, Kandilli Rasathanesi'nin sağladığı verileri çekerek en son gerçekleşen depremlerin verilerini getirir.
async function getEarthquakeData() {
    const url = "http://www.koeri.boun.edu.tr/scripts/lst5.asp"; 

    // Belirtilen URL'ye HTTP GET isteği atılır.
    const response = await axios.get(url);
    // Gelen HTML verisi parse edilir.
    const $ = cheerio.load(response.data);

    // 'pre' elementinin içindeki tüm metin verisi çekilir.
    const data = $('pre').text(); 
    // Çekilen metin verisi, satır satır ayrılır.
    const lines = data.split('\n'); 

    const earthquakes = [];

    // Her satır için, belirli sütunlarda yer alan veriler çekilir.
    for(let i = 6; i < lines.length; i++) {
        const line = lines[i];

        // Çekilen veriler, bir deprem nesnesine eklenir ve topluca bu nesne 'earthquakes' listesine eklenir.
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

    // Tüm deprem verileri döndürülür.
    return earthquakes;
}

// Bu fonksiyon, iki listeyi karşılaştırır ve bir listeye yeni eklenen öğelerin olup olmadığını kontrol eder.
function compareArrays(a, b) {
    let items = []

    // A listesindeki her öğe için, eğer bu öğe B listesinde yoksa, bu öğe 'items' listesine eklenir.
    for (let item of a) {
        if (!JSON.stringify(b).includes(JSON.stringify(item))) {
           items.push(item);
        }
    }

    // Eğer 'items' listesinde bir öğe varsa, yeni öğeler eklenmiş demektir ve bu durum bildirilir.
    // Eğer 'items' listesinde bir öğe yoksa, yeni öğe eklenmemiş demektir ve bu durum bildirilir.
    return items.length > 0 ? {status: true, data: items} : {status: false};
}

// Bu fonksiyon, programın ana işlemlerini gerçekleştirir.
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

                // Deprem olduğunda, bu durum ilgili WhatsApp grubuna mesaj olarak gönderilir.
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

    }, 5000); // Her 5 saniyede bir bu işlem tekrarlanır.

}

// Ana fonksiyon çalıştırılır.
Main()

// WhatsApp client'ı başlatılır.
client.initialize();
