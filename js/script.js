/* =========================================================
   StitchShift - script.js (Tugas Minggu 5: JavaScript & jQuery)
   Satu file dipakai semua halaman. Bagian awal = JavaScript murni
   (data, function, render). Bagian akhir = jQuery (event & efek).
   ========================================================= */

/* ---------- 1. DATA DUMMY (array of object) ---------- */
var URL_PLATFORM = {
  "Tokopedia": "https://www.tokopedia.com",
  "Shopee": "https://shopee.co.id",
  "TikTokShop": "https://www.tiktok.com/shop",
  "Zara": "https://www.zara.com",
  "Uniqlo": "https://www.uniqlo.com",
  "Levi's": "https://www.levi.com"
};

// Gambar lokal (folder img/)
var IMG_URBAN = "img/img 1.jpg";
var IMG_WEEKEND = "img/img 2.jpg";
var IMG_BOARDROOM = "img/img 3.jpg";

var outfitDefault = [
  {
    id: "urban-monochrome", nama: "Urban Monochrome", vibe: "streetwear",
    kategori: ["atasan", "bawahan"], cutting: "oversized", tier: "casual", gambar: IMG_URBAN,
    deskripsi: "Atasan & bawahan untuk tampilan kasual yang rapi dan mudah dikombinasikan ulang.",
    items: [
      { id: "u1", nama: "Hoodie oversized hitam", platform: "Tokopedia", owned: true },
      { id: "u2", nama: "Celana cargo abu-abu", platform: "Shopee", owned: true },
      { id: "u3", nama: "Sneakers putih", platform: "TikTokShop", owned: false },
      { id: "u4", nama: "Tas selempang hitam", platform: "Shopee", owned: false }
    ]
  },
  {
    id: "weekend-minimalist", nama: "Weekend Minimalist", vibe: "kasual",
    kategori: ["dress"], cutting: "regular", tier: "higher", gambar: IMG_WEEKEND,
    deskripsi: "Dress sederhana dengan aksesori netral untuk akhir pekan.",
    items: [
      { id: "w1", nama: "Dress linen putih", platform: "Uniqlo", owned: false },
      { id: "w2", nama: "Flat shoes krem", platform: "Zara", owned: false },
      { id: "w3", nama: "Tote bag kanvas", platform: "Zara", owned: false }
    ]
  },
  {
    id: "boardroom-classic", nama: "Boardroom Classic", vibe: "formal",
    kategori: ["outer", "bawahan"], cutting: "slimfit", tier: "higher", gambar: IMG_BOARDROOM,
    deskripsi: "Outer dan bawahan tegas untuk rapat dan presentasi.",
    items: [
      { id: "b1", nama: "Blazer hitam slim fit", platform: "Zara", owned: true },
      { id: "b2", nama: "Celana chino navy", platform: "Levi's", owned: true },
      { id: "b3", nama: "Kemeja putih", platform: "Uniqlo", owned: true }
    ]
  }
];

/* ---------- 2. PENYIMPANAN SEDERHANA (agar progres terbawa antar halaman) ---------- */
var KUNCI = "stitchshift-outfits-v2"; // dinaikkan agar data lama (gambar URL) tidak terbawa

function muatData() {
  try {
    var tersimpan = localStorage.getItem(KUNCI);
    if (tersimpan) { return JSON.parse(tersimpan); }
  } catch (e) { /* abaikan, pakai data default */ }
  return JSON.parse(JSON.stringify(outfitDefault));
}

function simpanData() {
  try { localStorage.setItem(KUNCI, JSON.stringify(outfits)); } catch (e) { /* abaikan */ }
}

var outfits = muatData();

/* ---------- 3. FUNCTION PEMROSES DATA ---------- */

// Menghitung progres belanja satu outfit (perulangan + percabangan)
function hitungProgress(outfit) {
  var dimiliki = 0;
  for (var i = 0; i < outfit.items.length; i++) {
    if (outfit.items[i].owned) { dimiliki++; }
  }
  return { dimiliki: dimiliki, total: outfit.items.length, sisa: outfit.items.length - dimiliki };
}

// Memfilter outfit berdasarkan vibe
function filterOutfit(daftar, vibe) {
  if (vibe === "semua") { return daftar; }
  return daftar.filter(function (o) { return o.vibe === vibe; });
}

// Simulasi mesin rekomendasi: skor = jumlah tag yang cocok (maks. 4)
function hitungSkor(outfit, pref) {
  var cocok = [];
  if (outfit.vibe === pref.vibe) { cocok.push("vibe " + pref.vibe); }
  if (outfit.kategori.indexOf(pref.kategori) !== -1) { cocok.push("kategori " + pref.kategori); }
  if (outfit.cutting === pref.cutting) { cocok.push("cutting " + pref.cutting); }
  if (outfit.tier === pref.tier) { cocok.push(pref.tier + " tier"); }
  return { skor: cocok.length, cocok: cocok };
}

// Mengurutkan semua outfit dari skor tertinggi
function urutkanRekomendasi(pref) {
  var hasil = outfits.map(function (o) {
    var h = hitungSkor(o, pref);
    return { outfit: o, skor: h.skor, cocok: h.cocok };
  });
  hasil.sort(function (a, b) { return b.skor - a.skor; });
  return hasil;
}

function esc(teks) {
  return String(teks).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function labelTier(tier) { return tier === "higher" ? "Higher tier" : "Casual tier"; }
function labelVibe(v) { return v.charAt(0).toUpperCase() + v.slice(1); }

/* ---------- 4. RENDER DINAMIS ---------- */

// Beranda: ringkasan angka
function renderRingkasan() {
  var totalDimiliki = 0, totalSisa = 0;
  for (var i = 0; i < outfits.length; i++) {
    var p = hitungProgress(outfits[i]);
    totalDimiliki += p.dimiliki;
    totalSisa += p.sisa;
  }
  $("#stat-outfit").text(outfits.length);
  $("#stat-dimiliki").text(totalDimiliki);
  $("#stat-perlu").text(totalSisa);
}

// Beranda: kartu outfit dari array
function renderBeranda(vibe) {
  var daftar = filterOutfit(outfits, vibe);
  var html = "";
  for (var i = 0; i < daftar.length; i++) {
    var o = daftar[i];
    var p = hitungProgress(o);
    var besar = (i === 0 && daftar.length >= 3);
    var kelas = besar ? "md:col-span-2 md:row-span-2 min-h-96" : "";
    var status = p.sisa === 0 ? "Lengkap, semua item dimiliki" : p.dimiliki + " dari " + p.total + " item dimiliki";
    html += '<a href="detail.html?id=' + o.id + '" class="group relative block min-h-64 overflow-hidden rounded-xl bg-panel ' + kelas + '">' +
      '<img src="' + o.gambar + '" alt="Set outfit ' + esc(o.nama) + '" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">' +
      '<div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent"></div>' +
      '<div class="relative flex h-full flex-col justify-end p-5">' +
      '<h3 class="font-serif text-2xl font-bold">' + esc(o.nama) + '</h3>' +
      '<p class="text-sm text-muted">' + labelVibe(o.vibe) + ' · ' + labelTier(o.tier) + '</p>' +
      '<p class="mt-2 text-sm font-semibold ' + (p.sisa === 0 ? 'text-cream' : 'text-accent') + '">' + status + '</p>' +
      '</div></a>';
  }
  $("#grid-outfit").html(html).hide().fadeIn(300);
  if (daftar.length === 0) { $("#kosong").show(); } else { $("#kosong").hide(); }
}

// Detail: outfit aktif dipilih lewat ?id=...
function ambilOutfitAktif() {
  var id = new URLSearchParams(window.location.search).get("id");
  for (var i = 0; i < outfits.length; i++) {
    if (outfits[i].id === id) { return outfits[i]; }
  }
  return outfits[0];
}

function renderDetail(outfit) {
  var p = hitungProgress(outfit);
  document.title = "StitchShift - " + outfit.nama;
  $("#detail-judul").text(outfit.nama);
  $("#detail-meta").text(labelVibe(outfit.vibe) + " · " + labelTier(outfit.tier));
  $("#detail-intro").text(outfit.deskripsi);
  $("#detail-gambar").attr({ src: outfit.gambar, alt: "Set outfit " + outfit.nama });

  var baris = "", daftar = "";
  for (var i = 0; i < outfit.items.length; i++) {
    var it = outfit.items[i];
    var url = URL_PLATFORM[it.platform] || "#";
    var status = it.owned ? "Dimiliki" : "Perlu dibeli";
    var warna = it.owned ? "text-muted" : "text-accent";
    baris += '<tr class="odd:bg-white/[0.02]">' +
      '<td class="px-3 py-4">' + esc(it.nama) + '</td>' +
      '<td class="px-3 py-4"><a href="' + url + '" target="_blank" rel="noopener noreferrer" class="font-semibold text-accent hover:underline">' + esc(it.platform) + '</a></td>' +
      '<td class="px-3 py-4 font-semibold ' + warna + '">' + status + '</td></tr>';
    daftar += '<li class="flex items-center gap-4 border-b border-white/10 py-4 last:border-0" data-id="' + it.id + '">' +
      '<input type="checkbox" id="chk-' + it.id + '" class="h-5 w-5 accent-accent"' + (it.owned ? " checked" : "") + '>' +
      '<label for="chk-' + it.id + '" class="flex-1 font-medium">' + esc(it.nama) + '</label>' +
      '<span class="text-xs font-bold ' + warna + '">' + status + '</span>' +
      '<button type="button" class="btn-hapus rounded-full px-3 py-1 text-xs font-semibold text-muted hover:text-accent" aria-label="Hapus ' + esc(it.nama) + '">Hapus</button></li>';
  }
  if (outfit.items.length === 0) {
    baris = '<tr><td colspan="3" class="px-3 py-6 text-muted">Belum ada item. Tambahkan item pertamamu.</td></tr>';
  }
  $("#tbody-item").html(baris);
  $("#daftar-checklist").html(daftar);

  var persen = p.total === 0 ? 0 : Math.round((p.dimiliki / p.total) * 100);
  $("#bar-progress").css("width", persen + "%");
  if (p.total > 0 && p.sisa === 0) {
    $("#progress-note").html("Semua <strong class='text-cream'>" + p.total + "</strong> item sudah dimiliki. Outfit ini lengkap.");
  } else {
    $("#progress-note").html("Progres: <strong class='text-cream'>" + p.dimiliki + " dari " + p.total + "</strong> item dimiliki. Sisa <strong class='text-cream'>" + p.sisa + " item</strong> perlu dibeli.");
  }
}

// Preferensi: hasil rekomendasi
function renderHasil(pref) {
  var hasil = urutkanRekomendasi(pref);
  var html = "";
  for (var i = 0; i < hasil.length; i++) {
    var h = hasil[i];
    if (h.skor === 0) { continue; } // lewati yang sama sekali tidak cocok
    var alasan = h.cocok.join(", ");
    html += '<li><a href="detail.html?id=' + h.outfit.id + '" class="flex items-center gap-4 rounded-xl bg-panel p-4 transition-colors hover:bg-white/10">' +
      '<img src="' + h.outfit.gambar + '" alt="" class="h-20 w-16 rounded-lg object-cover">' +
      '<div class="flex-1"><h3 class="font-serif text-lg font-bold">' + esc(h.outfit.nama) + '</h3>' +
      '<p class="text-sm text-muted">Cocok di: ' + esc(alasan) + '</p></div>' +
      '<span class="text-sm font-bold ' + (h.skor >= 3 ? 'text-accent' : 'text-muted') + '">' + h.skor + ' dari 4 cocok</span></a></li>';
  }
  if (html === "") {
    $("#daftar-hasil").html('<li class="text-muted">Belum ada outfit yang cocok. Coba ubah vibe atau kategorinya.</li>');
  } else {
    $("#daftar-hasil").html(html);
  }
}

/* ---------- 5. jQuery: NOTIFIKASI, EVENT, EFEK ---------- */
function tampilNotif(teks) {
  if ($("#notif").length === 0) {
    $("body").append('<div id="notif" role="status" aria-live="polite" style="display:none" class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-accent px-6 py-3 text-sm font-semibold shadow-lg"></div>');
  }
  $("#notif").stop(true, true).text(teks).fadeIn(200).delay(2000).fadeOut(400);
}

$(function () {

  /* --- Beranda --- */
  if ($("#grid-outfit").length) {
    renderRingkasan();
    renderBeranda("semua");

    $("#filter-vibe").on("click", ".filter-btn", function () {
      $(".filter-btn").removeClass("bg-accent text-white").addClass("bg-panel text-muted");
      $(this).removeClass("bg-panel text-muted").addClass("bg-accent text-white");
      renderBeranda($(this).data("vibe"));
    });
  }

  /* --- Detail --- */
  if ($("#tbody-item").length) {
    var aktif = ambilOutfitAktif();
    renderDetail(aktif);

    // Centang = tandai dimiliki / belum
    $("#daftar-checklist").on("change", "input[type=checkbox]", function () {
      var id = $(this).closest("li").data("id");
      for (var i = 0; i < aktif.items.length; i++) {
        if (aktif.items[i].id === id) { aktif.items[i].owned = $(this).is(":checked"); }
      }
      simpanData();
      renderDetail(aktif);
      tampilNotif("Progres diperbarui");
    });

    // Hapus item dari daftar
    $("#daftar-checklist").on("click", ".btn-hapus", function () {
      var $li = $(this).closest("li");
      var id = $li.data("id");
      $li.fadeOut(250, function () {
        aktif.items = aktif.items.filter(function (it) { return it.id !== id; });
        simpanData();
        renderDetail(aktif);
        tampilNotif("Item dihapus");
      });
    });

    // Tampil/sembunyi form tambah item
    $("#btn-toggle-form").on("click", function () {
      var $btn = $(this);
      $("#form-tambah").slideToggle(250, function () {
        var terbuka = $(this).is(":visible");
        $btn.text(terbuka ? "Tutup form" : "Tambah item").attr("aria-expanded", terbuka);
      });
    });

    // Submit + validasi sederhana
    $("#form-tambah").on("submit", function (e) {
      e.preventDefault();
      var nama = $.trim($("#nama-item").val());
      var platform = $("#platform-item").val();
      var valid = true;

      $(".pesan-error").hide();
      if (nama === "") {
        $("#error-nama").text("Nama item wajib diisi.").fadeIn(200); valid = false;
      } else if (nama.length < 3) {
        $("#error-nama").text("Nama item minimal 3 karakter.").fadeIn(200); valid = false;
      }
      if (platform === "") {
        $("#error-platform").text("Pilih platform belanja.").fadeIn(200); valid = false;
      }
      if (!valid) { return; }

      aktif.items.push({ id: "x" + Date.now(), nama: nama, platform: platform, owned: false });
      simpanData();
      renderDetail(aktif);
      this.reset();
      $("#form-tambah").slideUp(250);
      $("#btn-toggle-form").text("Tambah item").attr("aria-expanded", false);
      tampilNotif("Item ditambahkan ke daftar belanja");
    });
  }

  /* --- Preferensi --- */
  if ($("#form-preferensi").length) {
    $("#form-preferensi").on("submit", function (e) {
      e.preventDefault();
      var pref = {
        vibe: $("input[name=vibe]:checked").val(),
        kategori: $("input[name=kategori]:checked").val(),
        cutting: $("input[name=cutting]:checked").val(),
        tier: $("input[name=tier]:checked").val()
      };
      renderHasil(pref);
      $("#hasil").hide().slideDown(300, function () {
        this.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      tampilNotif("Rekomendasi ditemukan");
    });
  }
});
