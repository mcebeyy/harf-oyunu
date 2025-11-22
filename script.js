function surukle(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("harf", ev.target.getAttribute("data-ses"));
}

function suruklemeIzni(ev) {
    ev.preventDefault();
}

function birak(ev, hedefHarf) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var gelenHarf = ev.dataTransfer.getData("harf");
    var suruklenenOge = document.getElementById(data);

    // Harf Kontrolü
    if (hedefHarf === gelenHarf) {
        // Hedef gerçekten bir raf mı?
        if (ev.target.classList.contains('raf')) {
            ev.target.appendChild(suruklenenOge);
            
            // Görsel ve davranış değişikliği
            suruklenenOge.classList.add("dogru");
            suruklenenOge.setAttribute("draggable", "false");
        }
    } else {
        // HATA DURUMU:
        // Nesneye 'hata' sınıfını ekle (titremesi için)
        suruklenenOge.classList.add("hata");
        
        // 0.5 saniye sonra 'hata' sınıfını kaldır (ki tekrar titreyebilsin)
        setTimeout(function() {
            suruklenenOge.classList.remove("hata");
        }, 500);
    }
}

/* --- KARIŞTIRMA KODU BAŞLANGICI --- */

// Sayfa tamamen yüklendiğinde bu çalışır
window.onload = function() {
    var alan = document.querySelector('.nesneler-alani');
    // Sadece 'nesne' sınıfına sahip kutuları seç (Başlığı seçmemek için)
    var nesneler = Array.from(alan.querySelectorAll('.nesne'));

    // Matematiksel olarak rastgele sıralama yap
    nesneler.sort(function() { 
        return 0.5 - Math.random(); 
    });

    // Karışmış nesneleri tekrar alana ekle
    nesneler.forEach(function(nesne) {
        alan.appendChild(nesne);
    });
};

/* ==========================================
   MOBİL / DOKUNMATİK EKRAN DESTEĞİ (TOUCH)
   ========================================== */

// Tüm nesneleri seç ve dinleyici ekle
var tumNesneler = document.querySelectorAll('.nesne');
var aktifTasima = null;
var baslangicX, baslangicY;
var orijinalX = 0, orijinalY = 0;

tumNesneler.forEach(function(nesne) {
    nesne.addEventListener('touchstart', dokunmaBasladi, {passive: false});
    nesne.addEventListener('touchmove', dokunmaSurukle, {passive: false});
    nesne.addEventListener('touchend', dokunmaBitti);
});

function dokunmaBasladi(e) {
    // Eğer nesne zaten doğru yerleşmişse hareket ettirme
    if (e.target.classList.contains('dogru') || e.target.parentElement.classList.contains('dogru')) return;

    aktifTasima = e.currentTarget;
    var touch = e.touches[0];
    
    // Başlangıç koordinatlarını kaydet
    baslangicX = touch.clientX;
    baslangicY = touch.clientY;
    
    // Nesneyi öne getir
    aktifTasima.style.zIndex = 1000;
    aktifTasima.style.position = 'relative'; // Hareket edebilmesi için
}

function dokunmaSurukle(e) {
    if (!aktifTasima) return;
    e.preventDefault(); // Sayfanın kaymasını engelle

    var touch = e.touches[0];
    var farkX = touch.clientX - baslangicX;
    var farkY = touch.clientY - baslangicY;

    // Nesneyi parmağın gittiği yere ötele (Transform kullanarak)
    aktifTasima.style.transform = "translate(" + (orijinalX + farkX) + "px, " + (orijinalY + farkY) + "px)";
}

function dokunmaBitti(e) {
    if (!aktifTasima) return;

    // Parmağın kaldırıldığı yerdeki elemanı bul
    var touch = e.changedTouches[0];
    
    // Nesneyi geçici olarak görünmez yap ki arkasındaki rafı görebilelim
    aktifTasima.style.display = 'none';
    var altindakiEleman = document.elementFromPoint(touch.clientX, touch.clientY);
    aktifTasima.style.display = 'flex'; // Tekrar görünür yap

    // Altındaki eleman "raf" mı kontrol et?
    // (Bazen rafın içindeki yazıya denk gelir, o yüzden en yakın .raf class'ına bakıyoruz)
    var hedefRaf = altindakiEleman ? altindakiEleman.closest('.raf') : null;

    if (hedefRaf) {
        var nesneHarfi = aktifTasima.getAttribute('data-ses');
        var rafID = hedefRaf.id;
        
        // Raf ID'sine göre Harf Kontrolü (raf-h, raf-r, raf-k)
        var rafHarfi = "";
        if(rafID === "raf-h") rafHarfi = "H";
        if(rafID === "raf-r") rafHarfi = "R";
        if(rafID === "raf-k") rafHarfi = "K";

        if (nesneHarfi === rafHarfi) {
            // DOĞRU İSE:
            hedefRaf.appendChild(aktifTasima);
            aktifTasima.classList.add("dogru");
            aktifTasima.style.transform = "none"; // Kaydırmayı sıfırla, rafa otursun
            aktifTasima.style.position = "static"; 
            
            // Daha önce eklediğimiz ses ve sayaç kodları varsa burada manuel tetikleyebiliriz
            // (Ses çalma kodu buraya eklenebilir)
            var ses = document.getElementById("dogruSesi");
            if(ses) ses.play();
             
        } else {
            // YANLIŞ İSE:
            hataEfekti(aktifTasima);
        }
    } else {
        // BOŞLUĞA BIRAKILDI İSE:
        hataEfekti(aktifTasima);
    }

    // Değişkenleri sıfırla
    aktifTasima.style.zIndex = "";
    aktifTasima = null;
    orijinalX = 0;
    orijinalY = 0;
}

// Yanlış bırakılınca geri sekme efekti
function hataEfekti(nesne) {
    nesne.style.transform = "translate(0px, 0px)"; // Başlangıç yerine dön
    nesne.classList.add("hata");
    setTimeout(function() {
        nesne.classList.remove("hata");
    }, 500);
}