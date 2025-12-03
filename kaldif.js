let data = [];
let grafik = null;

// daftar default watt untuk tiap barang
const defaultWatt = {
  "Pilih Barang": 0,
  "Kulkas": 150,
  "AC": 1100,
  "Setrika": 300,
  
  "Lampu": 10,
  "Kipas Angin": 50,
  "Mesin Cuci": 400,
  "TV": 100,
  "Rice Cooker": 300
};

function add(n='', w=0, j=0, h=0){
  data.push({nama:n, watt:w, jumlah:j, jam:h, custom:false});
  render();
}

function contoh(){
  add("AC",1100,1,8);
  add("Kulkas",150,1,24);
  add("Lampu",10,6,6);
}

function render(){
  let tb = document.getElementById("tabel");
  tb.innerHTML = "";
  data.forEach((d,i)=>{
    tb.innerHTML += `
      <tr>
        <td>
          <select onchange="handleSelect(${i}, this.value)">
            <option value="Pilih Barang" ${d.nama==="Pilih Barang"?"selected":""}>Pilih Barang</option>
            <option value="Kulkas" ${d.nama==="Kulkas"?"selected":""}>Kulkas</option>
            <option value="AC" ${d.nama==="AC"?"selected":""}>AC</option>
            <option value="Setrika" ${d.nama==="Setrika"?"selected":""}>Setrika</option>
            <option value="Lampu" ${d.nama==="Lampu"?"selected":""}>Lampu</option>
            <option value="Kipas Angin" ${d.nama==="Kipas Angin"?"selected":""}>Kipas Angin</option>
            <option value="Mesin Cuci" ${d.nama==="Mesin Cuci"?"selected":""}>Mesin Cuci</option>
            <option value="TV" ${d.nama==="TV"?"selected":""}>TV</option>
            <option value="Rice Cooker" ${d.nama==="Rice Cooker"?"selected":""}>Rice Cooker</option>
            <option value="lainnya" ${d.custom?"selected":""}>Barang lainnya</option>
          </select>
          ${d.custom ? `<input type="text" value="${d.nama}" 
             placeholder="Nama barang..." 
             onchange="upd(${i},'nama',this.value)">` : ""}
        </td>
        <td><input type="number" value="${d.watt}" onchange="upd(${i},'watt',this.value)"></td>
        <td><input type="number" value="${d.jumlah}" onchange="upd(${i},'jumlah',this.value)"></td>
        <td><input type="number" value="${d.jam}" onchange="upd(${i},'jam',this.value)"></td>
        <td><button onclick="hapus(${i})" class="outline">Hapus</button></td>
      </tr>`;
  });
}

function handleSelect(i, val){
  if(val==="lainnya"){
    data[i].custom = true;
    data[i].nama = "";
  } else {
    data[i].custom = false;
    data[i].nama = val;
    // set watt default sesuai barang
    if(defaultWatt[val]){
      data[i].watt = defaultWatt[val];
    }
  }
  render();
}

function upd(i,f,v){
  data[i][f] = (f==="nama") ? v : Number(v);
}

function hapus(i){
  data.splice(i,1);
  render();
}

function resetTabel(){
  data=[];
  render();
  document.getElementById("kwh").innerText="0";
  document.getElementById("tagihan").innerText="Rp 0";
  document.getElementById("boros").innerText="-";
  document.getElementById("hemat").innerText="Rp 0";
  document.getElementById("rek").innerHTML="";
  if(grafik){ grafik.destroy(); }
}

function hitung(){
  const tarif = Number(document.getElementById("tarif").value);
  const hari = Number(document.getElementById("hari").value);

  if(data.length===0){
    alert("Masukkan peralatan dulu!");
    return;
  }

  let hasil = data.map(x=>{
    let kwh = x.watt*x.jumlah*x.jam/1000*hari;
    let biaya = kwh * tarif;
    return {...x,kwh,biaya};
  });

  let totalKWH = hasil.reduce((a,b)=>a+b.kwh,0);
  let totalBiaya = hasil.reduce((a,b)=>a+b.biaya,0);
  document.getElementById("kwh").innerText = totalKWH.toFixed(1);
  document.getElementById("tagihan").innerText = "Rp "+totalBiaya.toLocaleString("id-ID");

  hasil.sort((a,b)=>b.biaya-a.biaya);
  let boros = hasil[0];
  document.getElementById("boros").innerText = boros.nama;

  let hemat = boros.watt*boros.jumlah/1000 * tarif * hari;
  document.getElementById("hemat").innerText = "Rp "+hemat.toLocaleString("id-ID");

  if(grafik) grafik.destroy();
  grafik = new Chart(document.getElementById("grafik"),{
    type:"bar",
    data:{
      labels:hasil.map(h=>h.nama),
      datasets:[{
        data:hasil.map(h=>h.kwh),
        backgroundColor:"rgba(15,98,254,0.8)"
      }]
    }
  });

  let ul = document.getElementById("rek");
  ul.innerHTML = `
    <li>Kurangi pemakaian <b>${boros.nama}</b></li>
    <li>Gunakan peralatan hemat energi.</li>
    <li>Matikan alat bila tidak dipakai.</li>
  `;
}

// --- Catatan Harian ---
let logHarian = JSON.parse(localStorage.getItem("logHarian")) || [];
renderLog();

function catatHari(){
  let tanggal = new Date().toISOString().slice(0,10);
  data.forEach(d=>{
    logHarian.push({
      tanggal,
      nama: d.nama,
      watt: d.watt,
      jumlah: d.jumlah,
      jam: d.jam
    });
  });
  localStorage.setItem("logHarian", JSON.stringify(logHarian));
  renderLog();
}

function catatHari(){
  let tanggal = new Date().toISOString().slice(0,10);
  data.forEach(d=>{
    logHarian.push({
      tanggal,
      nama: d.nama,
      watt: d.watt,
      jumlah: d.jumlah,
      jam: d.jam
    });
  });
  localStorage.setItem("logHarian", JSON.stringify(logHarian));
  renderLog();

  // setelah catat, reset tabel peralatan
  resetTabel();
}

function renderLog(){
  let tb = document.getElementById("logTabel");
  if(!tb) return;
  tb.innerHTML = "";
  logHarian.forEach(l=>{
    tb.innerHTML += `<tr>
      <td>${l.tanggal}</td>
      <td>${l.nama}</td>
      <td>${l.watt}</td>
      <td>${l.jumlah}</td>
      <td>${l.jam}</td>
    </tr>`;
  });
}

function resetLog(){
  logHarian = [];
  localStorage.removeItem("logHarian");
  renderLog();
}

function hitungLog(){
  const tarif = Number(document.getElementById("tarif").value);
  if(logHarian.length===0){ alert("Belum ada catatan harian!"); return; }

  // agregasi per alat
  let hasilMap = {};
  logHarian.forEach(l=>{
    if(!hasilMap[l.nama]) hasilMap[l.nama] = {watt:l.watt, jumlah:l.jumlah, jam:0};
    hasilMap[l.nama].jam += l.jam;
  });

  let hasil = Object.keys(hasilMap).map(nama=>{
    let h = hasilMap[nama];
    let kwh = h.watt*h.jumlah*h.jam/1000;
    let biaya = kwh * tarif;
    return {nama, watt:h.watt, jumlah:h.jumlah, jam:h.jam, kwh, biaya};
  });

  tampilkanHasil(hasil, tarif);
}

// fungsi umum untuk menampilkan hasil
function tampilkanHasil(hasil, tarif){
  let totalKWH = hasil.reduce((a,b)=>a+b.kwh,0);
  let totalBiaya = hasil.reduce((a,b)=>a+b.biaya,0);
  document.getElementById("kwh").innerText = totalKWH.toFixed(1);
  document.getElementById("tagihan").innerText = "Rp "+totalBiaya.toLocaleString("id-ID");

  hasil.sort((a,b)=>b.biaya-a.biaya);
  let boros = hasil[0];
  document.getElementById("boros").innerText = boros.nama;

  let hemat = boros.watt*boros.jumlah/1000 * tarif; // potensi hemat per hari
  document.getElementById("hemat").innerText = "Rp "+hemat.toLocaleString("id-ID");

  if(grafik) grafik.destroy();
  grafik = new Chart(document.getElementById("grafik"),{
    type:"bar",
    data:{
      labels:hasil.map(h=>h.nama),
      datasets:[{
        data:hasil.map(h=>h.kwh),
        backgroundColor:"rgba(15,98,254,0.8)"
      }]
    }
  });

  let ul = document.getElementById("rek");
  ul.innerHTML = `
    <li>Kurangi pemakaian <b>${boros.nama}</b></li>
    <li>Gunakan peralatan hemat energi.</li>
    <li>Matikan alat bila tidak dipakai.</li>
  `;
}

// ==== HELP BUTTON SCRIPT ====

const helpBtn = document.getElementById("helpBtn");
const helpPopup = document.getElementById("helpPopup");
const closeHelp = document.getElementById("closeHelp");

helpBtn.addEventListener("click", () => {
    helpPopup.style.display = "flex";
});

closeHelp.addEventListener("click", () => {
    helpPopup.style.display = "none";
});

helpPopup.addEventListener("click", (e) => {
    if (e.target === helpPopup) {
        helpPopup.style.display = "none";
    }
});
