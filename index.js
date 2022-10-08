let crcTable = [0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290, 45419, 49548, 53677, 57806, 61935, 4657, 528, 12915, 8786, 21173, 17044, 29431, 25302, 37689, 33560, 45947, 41818, 54205, 50076, 62463, 58334, 9314, 13379, 1056, 5121, 25830, 29895, 17572, 21637, 42346, 46411, 34088, 38153, 58862, 62927, 50604, 54669, 13907, 9842, 5649, 1584, 30423, 26358, 22165, 18100, 46939, 42874, 38681, 34616, 63455, 59390, 55197, 51132, 18628, 22757, 26758, 30887, 2112, 6241, 10242, 14371, 51660, 55789, 59790, 63919, 35144, 39273, 43274, 47403, 23285, 19156, 31415, 27286, 6769, 2640, 14899, 10770, 56317, 52188, 64447, 60318, 39801, 35672, 47931, 43802, 27814, 31879, 19684, 23749, 11298, 15363, 3168, 7233, 60846, 64911, 52716, 56781, 44330, 48395, 36200, 40265, 32407, 28342, 24277, 20212, 15891, 11826, 7761, 3696, 65439, 61374, 57309, 53244, 48923, 44858, 40793, 36728, 37256, 33193, 45514, 41451, 53516, 49453, 61774, 57711, 4224, 161, 12482, 8419, 20484, 16421, 28742, 24679, 33721, 37784, 41979, 46042, 49981, 54044, 58239, 62302, 689, 4752, 8947, 13010, 16949, 21012, 25207, 29270, 46570, 42443, 38312, 34185, 62830, 58703, 54572, 50445, 13538, 9411, 5280, 1153, 29798, 25671, 21540, 17413, 42971, 47098, 34713, 38840, 59231, 63358, 50973, 55100, 9939, 14066, 1681, 5808, 26199, 30326, 17941, 22068, 55628, 51565, 63758, 59695, 39368, 35305, 47498, 43435, 22596, 18533, 30726, 26663, 6336, 2273, 14466, 10403, 52093, 56156, 60223, 64286, 35833, 39896, 43963, 48026, 19061, 23124, 27191, 31254, 2801, 6864, 10931, 14994, 64814, 60687, 56684, 52557, 48554, 44427, 40424, 36297, 31782, 27655, 23652, 19525, 15522, 11395, 7392, 3265, 61215, 65342, 53085, 57212, 44955, 49082, 36825, 40952, 28183, 32310, 20053, 24180, 11923, 16050, 3793, 7920];
function crc16($) {
  var X, F, A = 65535;
  for (F = 0; F < $.length; F++) {
    if ((c = $.charCodeAt(F)) > 255) throw RangeError();
    A = crcTable[X = (c ^ A >> 8) & 255] ^ A << 8
  }
  return (0 ^ A) & 65535
};
let htmlForm = `<!DOCTYPE html><html><head><meta content="width=device-width,initial-scale=1" name="viewport"><title>Dynamic QRIS Generator</title><body><form action="/qris" method="POST" autocomplete="on"><textarea name="data" rows="4" cols="30" placeholder="QRIS data" required></textarea><br><input type="number" name="price" placeholder="Price" required/><select name="output"><option selected value="html">HTML</option><option value="json">JSON</option></select><br><input type="submit" value="submit"></form></body></html>`;
function generateQRIS(d, p) {
  let data = d.slice(0, -8).replace('11', '12').concat(`540${p.length}${p}`, '9920api.isan.eu.org/qris', '6304')
  let c = crc16(data).toString(16).toUpperCase()
  d = `${data}${c}`;
  return d;
};
function getMerchName(d) {
  let lgh = d.length
  let lmn = d.indexOf('02ID59') + 6
  let mnn = d.slice(lmn, lmn + 2)
  lmn = lmn + 2;
  let mmn = `-${lgh - lmn - mnn}`
  let mn = d.slice(lmn, mmn)
  return mn
};
async function handleRequest(request) {
  const formData = await request.formData()
  let d = formData.get('data');
  let p = formData.get('price');
  let o = formData.get('output');
  let data = generateQRIS(d, p);
  let name = getMerchName(d);
  let price = `Rp${p.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")},00`
  if (o === 'html') {
    let content = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><title>QRIS</title></head><body><img src="https://cdn.jsdelivr.net/gh/ihsangan/files/qris.svg" alt="QRIS logo" width="220" style="margin:27px 0"/><img src="https://cdn.jsdelivr.net/gh/ihsangan/files/gpn.svg" alt="GPN logo" width="50" style="float:right"/><br><center><img src="https://qr.isan.eu.org/v1/create-qr-code/?size=350x350&ecc=Q&qzone=0&margin=0&&format=svg&data=${data}" alt="QRIS data" height="350"/><br><h3>${price} ke ${name}</body></html>`;
    return new Response(content, {
      headers: { "Content-Type": "text/html" }
    })
  }
}
addEventListener('fetch', event => {
  const { request } = event;
  if (request.url.includes('/submit')) {
    return event.respondWith(new Response(htmlForm, {
      headers: { "Content-Type": "text/html" }
    }));
  }
  if (request.method === 'POST' && request.headers.get('Content-Type').includes('form')) {
    return event.respondWith(handleRequest(request));
  } else {
    return event.respondWith(new Response('https://github.com/ihsangan/qris'));
  }
});