# Metin2 Okey Kart Takip v3

Bu sürüm kart takip sistemi + oyun sayacı + etkinlik geri sayımını içerir.

## Özellikler

- 24 Okey kartı: kırmızı, sarı, mavi / 1-8
- Tıklanan kart griye döner; renkli kartlar elde kalan kartlardır
- Kalan kart sayacı ve ilerleme çubuğu
- LocalStorage kart kaydı
- Yeni Oyun düğmesi
- Tamamlanan Oyun sayacı
- Tamamlanan Oyun sayacı LocalStorage ile kalıcıdır
- Oyun sayacı ayrıca sıfırlanabilir
- Kartlar ayrıca sayaç değişmeden sıfırlanabilir
- YouTube kanal destek butonu
- Dinamik Okey etkinliği geri sayımı
- Mobil uyumlu tasarım
- GitHub Pages uyumlu
- Framework yok

## YouTube kanal adresini değiştirme

`script.js` içinde:

```js
youtubeChannelUrl: "https://www.youtube.com/",
```

satırını kendi kanal adresinle değiştir.

## Etkinlik tarihleri

Kod şu tarihlere göre ayarlı:

- Başlangıç: 08.09.2026 00:00 CEST
- Drop sonu: 30.09.2026 23:59 CEST
- Etkinlik sonu: 01.10.2026 23:59 CEST

Tarihler `script.js > CONFIG.event` içinde tutuluyor.

## GitHub Pages

Repository köküne şu dosyaları yükle:

- `index.html`
- `styles.css`
- `script.js`

Sonra:

Settings > Pages > Deploy from a branch > main / root
