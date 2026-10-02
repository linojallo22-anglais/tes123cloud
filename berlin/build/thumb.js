// thumb.js — miniatures 9:16 dans le style "carte satellite + sujet néon + 2-3 mots" (réutilise le moteur de scene.js)
function thumbCompose(lon, lat, s, angDeg, tiltDeg, overlay) {
  P = d3.geoMercator().rotate([-lon, 0]).center([0, lat]).scale(s).translate([540 + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  cam_s = s; ANG = angDeg * Math.PI / 180; TILT = tiltDeg * Math.PI / 180; window.cam = () => ({ lon, lat, s });
  drawMap(m, 'sat', 0); overlay();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b3a4e'; ctx.fillRect(0, 0, W, H);
  rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, MW, MH); rc.translate(540 + OX, CY + OY); rc.rotate(ANG); rc.translate(-540 - OX, -CY - OY); rc.drawImage(mapC, 0, 0); rc.setTransform(1, 0, 0, 1, 0, 0);
  const sn = Math.sin(TILT), cs = Math.cos(TILT), band = 4;
  for (let y = 0; y < H; y += band) { const a = y - CY, b = y + band - CY; const v0 = a * FOC / (FOC * cs + a * sn), v1 = b * FOC / (FOC * cs + b * sn); const k = FOC / (FOC - ((v0 + v1) / 2) * sn); const sy = CY + OY + v0; if (sy < 0 || sy + v1 - v0 > MH) continue; ctx.drawImage(rotC, 0, sy, MW, Math.max(1, v1 - v0), 540 - k * (540 + OX), y, MW * k, band + 0.6); }
  const vg = ctx.createRadialGradient(W / 2, 760, 450, W / 2, 900, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}
function neon(g, col, w) { for (const [lw, a] of [[w * 5, .18], [w * 2.6, .35], [w, 1]]) { m.save(); m.globalAlpha = a; m.shadowColor = col; m.shadowBlur = w * 4; strokeGeo(g, lw, col); m.restore(); } strokeGeo(g, Math.max(2, w * 0.35), '#fff'); }
function fillGeo(g, col, a) { m.save(); pathM(g); m.globalAlpha = a; m.fillStyle = col; m.fill(); m.restore(); }
function bigWords(parts, y, size) { // parts: [[texte, couleur]]
  ctx.save(); ctx.font = `900 ${size}px Poppins`; const ws = parts.map(p => ctx.measureText(p[0]).width); let x = W / 2 - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach(([s, col], i) => { ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.17; ctx.strokeStyle = '#000'; ctx.shadowColor = col === '#fff' ? 'rgba(0,0,0,.7)' : col; ctx.shadowBlur = col === '#fff' ? 24 : 45; ctx.textBaseline = 'middle'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); x += ws[i]; }); ctx.restore();
}
function curvedArrow(x0, y0, x1, y1, bend) {
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 14;
  const cx = (x0 + x1) / 2 + bend, cy = (y0 + y1) / 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
  const an = Math.atan2(y1 - cy, x1 - cx); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 46 * Math.cos(an - 0.5), y1 - 46 * Math.sin(an - 0.5)); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 46 * Math.cos(an + 0.5), y1 - 46 * Math.sin(an + 0.5)); ctx.stroke(); ctx.restore();
}
const FRG = () => ({ type: 'GeometryCollection', geometries: ['uk', 'us', 'fr'].map(k => DATA.zones[k]) });

window.renderThumb = function (v) {
  const WB = DATA.west;
  if (v === 'A') { // Allemagne : RDA rouge néon, RFA bleue, île cerclée de jaune — "PIÉGÉS ICI ?!"
    thumbCompose(11.6, 53.25, 6800, -6, 16, () => {
      fillGeo(FRG(), '#2f6bff', 0.55); neon(FRG(), '#5b8cff', 4);
      fillGeo(DATA.zones.su, '#e3121f', 0.62); neon(DATA.zones.su, '#ff2a35', 5);
      fillGeo(WB, '#ff9a2e', 1); neon(WB, '#ffd25a', 3);
      mapLabel('RFA', 9.0, 50.6, 1, 0, 100); mapLabel('RDA', 12.2, 51.45, 1, 0, 100);
    });
    const p = S(13.27, 52.48); const r = 80 * p.k;
    ctx.save(); ctx.strokeStyle = '#FFE928'; ctx.lineWidth = 10; ctx.shadowColor = '#FFE928'; ctx.shadowBlur = 34; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 1.25, r, -0.2, 0, 7); ctx.stroke(); ctx.restore();
    tag(ctx, '2 MILLIONS', W / 2, 230, { size: 76, rot: -0.04 });
    bigWords([['PIÉGÉS ', '#fff'], ['ICI', '#FFE928'], [' ?!', '#fff']], 380, 138);
    curvedArrow(W / 2 + 90, 470, p.x - r * 0.2, p.y - r * 1.2, -120);
    return p;
  }
  if (v === 'B') { // zoom Berlin : île orange + mer turquoise impossible — "UNE ÎLE SANS MER ?!"
    thumbCompose(13.30, 52.545, 66000, 7, 16, () => {
      m.save(); pathMulti([DATA.sectors.su]); m.globalAlpha = 0.35; m.fillStyle = '#d0101c'; m.fill(); m.restore();
      strokeGeo(WB, kmPx(5.5), 'rgba(20,150,200,.95)'); strokeGeo(WB, kmPx(3.4), 'rgba(70,200,235,.95)'); strokeGeo(WB, 5, 'rgba(255,255,255,.9)', [22, 30]);
      fillGeo(WB, '#ff8c1a', 0.95); hatchFill(WB, '#ff8c1a', 0.3); neon(WB, '#ffe08a', 3);
    });
    bigWords([['UNE ÎLE', '#fff']], 270, 156);
    bigWords([['SANS ', '#fff'], ['MER', '#ff2a2a'], [' ?!', '#fff']], 430, 156);
    const p = S(13.25, 52.47);
    curvedArrow(W / 2 + 300, 520, p.x + 170, p.y - 250, 160);
    tag(ctx, 'BERLIN-OUEST', p.x, p.y + 20, { size: 60, bg: '#C00E1F', border: '#fff' });
    return p;
  }
  if (v === 'C') { // le mur : île bleue cerclée d'un mur néon — "155 KM DE MUR"
    thumbCompose(13.28, 52.60, 66000, -9, 16, () => {
      fillGeo(WB, '#1f5dff', 0.75); neon(WB, '#ff3b3b', 6);
      const pts = wbOutlinePts(); m.save(); m.setLineDash([2, 26]); m.lineCap = 'round'; partial(m, pts, 1); m.lineWidth = 16; m.strokeStyle = '#1b1b1b'; m.stroke(); m.restore();
    });
    const pts = DATA.west.coordinates[0];
    for (let i = 0; i < 5; i++) { const ll = pts[Math.floor((i + 0.1) / 5 * pts.length)]; const q = S(...ll); sprite(ctx, 'tower', q.x, q.y, 150 * q.k); }
    const p = S(13.27, 52.47);
    bigWords([['155 KM', '#FFE928']], 270, 170);
    bigWords([['DE ', '#fff'], ['MUR', '#ff2a2a'], [' ?!', '#fff']], 430, 140);
    tag(ctx, 'BERLIN-OUEST', p.x, p.y, { size: 58, bg: '#1f5dff', border: '#fff' });
    return p;
  }
};
