const $ = id => document.getElementById(id);

// Tabs
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab,.panel').forEach(e => e.classList.remove('active'));
  t.classList.add('active');
  $(t.dataset.tab).classList.add('active');
}));

function msg(id, text, err) {
  const el = $(id);
  el.textContent = text;
  el.classList.toggle('err', !!err);
  if (!err && text) setTimeout(() => { el.textContent = ''; }, 1500);
}
async function copy(text, id) {
  try { await navigator.clipboard.writeText(text); msg(id, 'Copied!'); }
  catch { msg(id, 'Copy failed', true); }
}

// JSON
function jsonRun(indent) {
  try {
    $('jsonIn').value = JSON.stringify(JSON.parse($('jsonIn').value), null, indent);
    msg('jsonMsg', 'Valid JSON');
  } catch (e) { msg('jsonMsg', e.message, true); }
}
$('jsonFormat').onclick = () => jsonRun(2);
$('jsonMinify').onclick = () => jsonRun(0);
$('jsonCopy').onclick = () => copy($('jsonIn').value, 'jsonMsg');

// Base64 (UTF-8 safe)
$('b64Enc').onclick = () => {
  try {
    const bytes = new TextEncoder().encode($('b64In').value);
    let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b));
    $('b64Out').value = btoa(bin); msg('b64Msg', 'Encoded');
  } catch (e) { msg('b64Msg', e.message, true); }
};
$('b64Dec').onclick = () => {
  try {
    const bin = atob($('b64In').value.trim());
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    $('b64Out').value = new TextDecoder().decode(bytes); msg('b64Msg', 'Decoded');
  } catch { msg('b64Msg', 'Invalid Base64', true); }
};
$('b64Copy').onclick = () => copy($('b64Out').value, 'b64Msg');

// Color
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
function setColor(hex) {
  hex = hex.toLowerCase();
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  $('colorInput').value = hex;
  $('swatch').style.background = hex;
  $('hex').textContent = hex;
  $('rgb').textContent = `rgb(${r}, ${g}, ${b})`;
  $('hsl').textContent = `hsl(${h}, ${s}%, ${l}%)`;
}
$('colorInput').addEventListener('input', e => setColor(e.target.value));
$('pick').onclick = async () => {
  if (!window.EyeDropper) return msg('colorMsg', 'EyeDropper not supported', true);
  try { setColor((await new EyeDropper().open()).sRGBHex); }
  catch { /* cancelled */ }
};
document.querySelectorAll('.copy').forEach(b =>
  b.addEventListener('click', () => copy($(b.dataset.src).textContent, 'colorMsg')));
setColor('#4f46e5');
