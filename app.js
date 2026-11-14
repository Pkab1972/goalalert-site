(function(){
var API=(window.GA_API||"").replace(/\/$/,"");
function pct(a){return a[1]?Math.round(a[0]/a[1]*100)+"%":"—"}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
function row(l,a){if(!a[1])return"<tr><td>"+esc(l)+"</td><td colspan='3' class='note'>δεν υπάρχουν ακόμα δεδομένα</td></tr>";return"<tr><td>"+esc(l)+"</td><td>"+a[0]+" / "+a[1]+"</td><td>"+pct(a)+"</td><td style='width:30%'><div class='bar'><i style='width:"+(a[1]?a[0]/a[1]*100:0)+"%'></i></div></td></tr>"}
function load(cb){
  fetch((API?API+"/":"")+"results.json?t="+Date.now()).then(function(r){return r.json()}).then(cb).catch(function(){cb(null)});
}
window.GA_load=load;
// home summary
var h=document.getElementById("live-summary");
if(h)load(function(d){
  if(!d||d.error){h.innerHTML="<div class='proof'><p class='note' style='margin:0'>Τα αποτελέσματα φορτώνουν σε λίγο. Δες τη σελίδα <a href='apotelesmata.html'>Αποτελέσματα</a>.</p></div>";return}
  var v=d.live_by_verdict||{},days=(d.live_by_day||[]).slice(-14),mx=1;
  days.forEach(function(x){if(x.n>mx)mx=x.n});
  var cols=days.map(function(x){var H=Math.max(14,Math.round(x.n/mx*118)),hp=x.n?x.hits/x.n*100:0;
    var dd=x.day.slice(8,10)+"/"+x.day.slice(5,7);
    return "<div class='col' title='"+dd+": "+x.hits+" από "+x.n+" ("+Math.round(hp)+"%)'><div class='stack' style='height:"+H+"px'><i class='m' style='height:"+(100-hp)+"%'></i><i class='h' style='height:"+hp+"%'></i></div><span>"+x.day.slice(8,10)+"</span></div>"}).join("");
  function mini(l,a){return "<div class='mini'>"+l+"<b>"+(a[1]?pct(a):"—")+"</b>"+(a[1]?a[0]+" από "+a[1]:"δεν υπάρχουν ακόμα δεδομένα")+"</div>"}
  h.innerHTML="<div class='proof'><div class='proof-top'><div><div class='bignum'>"+pct(d.live_total)+"</div><div class='cap'>βγήκαν από τα τελευταία "+d.live_total[1]+" live σήματα</div></div>"+
   ((v.star&&v.star[1])||(v.mid&&v.mid[1])?"<div class='minis'>"+mini("⭐ Πιο σίγουρο",v.star||[0,0])+mini("🟡 Μέτριο",v.mid||[0,0])+"</div>":"")+"</div>"+
   "<div class='days'>"+cols+"</div>"+
   "<div class='legend'><span><b style='background:var(--pitch)'></b>βγήκαν</span><span><b style='background:var(--miss)'></b>δεν βγήκαν</span><span>Αριθμός ημέρας του μήνα, τελευταίες "+days.length+" μέρες. Ενημερώθηκε "+esc(d.updated)+"</span></div></div>";
});
// full results page
var f=document.getElementById("live-full");
if(f)load(function(d){
  if(!d||d.error){f.innerHTML="<p class='note'>Δεν μπορώ να φορτώσω τα αποτελέσματα αυτή τη στιγμή. Δοκίμασε ξανά σε λίγο.</p>";return}
  var o="<p class='note'>Ενημερώθηκε: "+esc(d.updated)+" · βάσει των τελευταίων "+d.live_total[1]+" live σημάτων με γνωστό αποτέλεσμα</p>";
  o+="<h2>Live σήματα</h2><div class='tbl'><table><tr><th>Κατηγορία</th><th>Βγήκαν</th><th>%</th><th></th></tr>";
  o+=row("Όλα τα live σήματα",d.live_total);
  var v=d.live_by_verdict||{};
  o+=row("⭐ Πιο σίγουρο",v.star||[0,0])+row("🟡 Μέτριο",v.mid||[0,0])+row("⛔ Μην παίξεις (μετράται)",v.stop||[0,0]);
  o+="</table></div>";
  o+="<h3>Ανά στρατηγική</h3><div class='tbl'><table><tr><th>Στρατηγική</th><th>Βγήκαν</th><th>%</th><th></th></tr>";
  (d.live_by_strategy||[]).forEach(function(s){o+=row(s.name,[s.hits,s.n])});
  o+="</table></div>";
  var pt=d.pre_total||{},ks=Object.keys(pt);
  o+="<h2 style='margin-top:26px'>Λίστες pre-game</h2>";
  if(ks.length){o+="<div class='tbl'><table><tr><th>Λίστα</th><th>Βγήκαν</th><th>%</th><th></th></tr>";ks.forEach(function(k){o+=row(k.replace("Pre-game: ",""),pt[k])});o+="</table></div>"}
  else o+="<p class='note'>Η καταγραφή των pre-game λιστών ξεκίνησε στις 14/11. Τα νούμερα εμφανίζονται μόλις κλείσει η πρώτη μέρα.</p>";
  o+="<h2 style='margin-top:26px'>Ανά μέρα (live)</h2><div class='tbl'><table><tr><th>Μέρα</th><th>Βγήκαν</th><th>%</th><th></th></tr>";
  (d.live_by_day||[]).slice().reverse().forEach(function(x){o+=row(x.day,[x.hits,x.n])});
  o+="</table></div><p class='note'>"+esc(d.note||"")+"</p>";
  f.innerHTML=o;
});
// calculators
function $(i){return document.getElementById(i)}
var c1=$("be-odds");
if(c1){function be(){var o=parseFloat(c1.value.replace(",","."));var r=$("be-out");if(!(o>1)){r.innerHTML="Γράψε απόδοση μεγαλύτερη από 1.";return}
  var p=100/o;r.innerHTML="Για να βγεις στα ίσα με απόδοση <b>"+o+"</b> πρέπει να κερδίζεις <span class='big'>"+p.toFixed(1)+"%</span> των στοιχημάτων.<br><span class='note'>Αν κερδίζεις λιγότερα, χάνεις μακροπρόθεσμα, όσο ψηλό κι αν φαίνεται το ποσοστό σου.</span>"}
  c1.addEventListener("input",be);be()}
var s1=$("st-p");
if(s1){function st(){var p=parseFloat(s1.value.replace(",","."))/100,n=parseInt($("st-n").value,10),r=$("st-out");if(!(p>0&&p<=1&&n>0)){r.innerHTML="Συμπλήρωσε ποσοστό (1-100) και αριθμό στοιχημάτων.";return}
  var q=Math.pow(p,n)*100;r.innerHTML="Πιθανότητα να βγουν <b>και τα "+n+"</b> στη σειρά: <span class='big'>"+(q<0.1?q.toFixed(3):q.toFixed(1))+"%</span><br><span class='note'>Όσα περισσότερα στη σειρά, τόσο πιο πιθανό να χάσεις κάπου. Γι' αυτό δεν υπάρχει «σίγουρο».</span>"}
  s1.addEventListener("input",st);$("st-n").addEventListener("input",st);st()}
var t=$("be-table");
if(t){var h="<table><tr><th>Απόδοση</th><th>Ποσοστό για να βγεις στα ίσα</th></tr>";[1.03,1.05,1.07,1.10,1.15,1.20,1.30,1.50,1.80,2.00,2.50,3.00].forEach(function(o){h+="<tr><td>"+o.toFixed(2)+"</td><td>"+(100/o).toFixed(1)+"%</td></tr>"});t.innerHTML=h+"</table>"}
})();
