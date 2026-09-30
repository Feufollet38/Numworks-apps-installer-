import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'nwlink', 'package', 'dist');
let source = fs.readFileSync(path.join(dist, 'index.js'), 'utf8');
const replace = (from, to) => {
  if (!source.includes(from)) throw new Error(`nwlink ${from.slice(0, 60)} introuvable; version inattendue.`);
  source = source.replace(from, to);
};

// The npm build is also used by the PC app. Keep its linker and USB protocol,
// replacing only the Node-only CLI adapters with inert browser shims.
replace('const t=require("usb");', 'const t={webusb:navigator.usb};');
replace('382:(t,e,r)=>{if("undefined"!=typeof SHARED_CONFIG)r.p=SHARED_CONFIG.url_base.cdn+"/";else{var n=r(1017).resolve;r.p=n(__dirname)+"/"}}',
  '382:(t,e,r)=>{r.p=new URL("./",document.currentScript.src).href}');
replace('295:t=>{"use strict";t.exports=require("cli-progress")}',
  '295:t=>{"use strict";t.exports={SingleBar:class{start(){}update(){}stop(){}}}}');
replace('7304:t=>{"use strict";t.exports=require("commander")}',
  '7304:t=>{"use strict";class C{ name(){return this} description(){return this} version(){return this} command(){return this} argument(){return this} option(){return this} action(){return this} parseAsync(){return Promise.resolve()} }t.exports={Command:C}}');
replace('7147:t=>{"use strict";t.exports=require("fs")}',
  '7147:t=>{"use strict";t.exports={readFileSync(){throw Error("Node fs indisponible")},writeFileSync(){throw Error("Node fs indisponible")}}}');
replace('1017:t=>{"use strict";t.exports=require("path")}',
  '1017:t=>{"use strict";t.exports={dirname:()=>".",resolve:()=>"."}}');
replace('Object.defineProperty(global,"navigator",{get:function(){return{usb:t.webusb}}})', 'void 0');
replace('function Xr(t){var e=new Kr;',
  'window.NwlinkBrowserAPI={NWA:xr,Bundle:Ur,CalculatorBulk:Ge};function Xr(t){var e=new Kr;');
// Emscripten ships one Node filename fallback per WASM tool. Replace both
// before writing index-web.js so the hosted/PWA version works as well.
source = source.replaceAll('||__filename,function(t)', '||document.baseURI,function(t)');
if (source.includes('||__filename,function(t)')) {
  throw new Error('Référence Node __filename restante dans le bundle Web.');
}
// nwlink 0.0.19 starts the USB process but forgets to return/await its promise.
// This made callers finish early and hid device write failures from the UI.
// Report assembly progress after each app. The unmodified package did all
// six WebAssembly links silently, so the UI looked frozen for minutes.
replace('key:"flatBin",value:(o=cr(ar().mark((function t(e){return ar().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.t0=Ke,t.t1=["--output-target","binary"],t.next=4,this.flatElf(e);case 4:return t.t2=t.sent,t.t3={arguments:t.t1,input:t.t2},t.next=8,(0,t.t0)(t.t3);case 8:return t.abrupt("return",t.sent);case 9:case"end":return t.stop()}}),t,this)}))),function(t){return o.apply(this,arguments)})',
  'key:"flatBin",value:(o=cr(ar().mark((function t(e,p){return ar().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.t0=Ke,t.t1=["--output-target","binary"],t.next=4,this.flatElf(e);case 4:return t.t2=t.sent,p&&p(.5),t.t3={arguments:t.t1,input:t.t2},t.next=8,(0,t.t0)(t.t3);case 8:return p&&p(1),t.abrupt("return",t.sent);case 9:case"end":return t.stop()}}),t,this)}))),function(t,e){return o.apply(this,arguments)})');
replace('function t(e){var r,n,o,i,a,s,c,u,l,f,h;return Sr().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:r=new Uint8Array(0),n=e.flashStart+e.flashLength,o=e.flashStart,i=Or(this.apps),t.prev=4',
  'function t(e,p){var r,n,o,i,a,s,c,u,l,f,h,d;return Sr().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:r=new Uint8Array(0),n=e.flashStart+e.flashLength,o=e.flashStart,i=Or(this.apps),h=this.apps.length,d=0,t.prev=4');
replace('trampolineStart:e.trampolineStart});case 12:c=t.sent,r=this.concatenateU8A(r,c)',
  'trampolineStart:e.trampolineStart},(function(t){p&&p((d+t)/h)}));case 12:c=t.sent,r=this.concatenateU8A(r,c)');
replace('o+=l);case 17:t.next=6;break;',
  'o+=l),d++;case 17:t.next=6;break;');
replace('case 0:return n=e.infos.firmware,o={flashStart:n.externalAppsFlashStart,flashLength:n.externalAppsFlashEnd-n.externalAppsFlashStart,ramStart:n.externalAppsRamStart,ramLength:n.externalAppsRamEnd-n.externalAppsRamStart,trampolineStart:n.trampolineAddress},t.next=4,this.flatBin(o);case 4:i=t.sent,e.process((function(t){return t.downloadFlash(o.flashStart,i,e.infos,(function(t){r(.2*t)}),(function(t){r(.2+.8*t)})).then((function(){return e.dfu.leave(o.flashStart)}))}));case 7:case"end":return t.stop()',
  'case 0:return n=e.infos.firmware,o={flashStart:n.externalAppsFlashStart,flashLength:n.externalAppsFlashEnd-n.externalAppsFlashStart,ramStart:n.externalAppsRamStart,ramLength:n.externalAppsRamEnd-n.externalAppsRamStart,trampolineStart:n.trampolineAddress},t.next=4,this.flatBin(o,(function(t){r(.2*t)}));case 4:i=t.sent;return t.abrupt("return",e.process((function(t){return t.downloadFlash(o.flashStart,i,e.infos,(function(t){r(.2+.2*t)}),(function(t){r(.4+.6*t)})).then((function(){return e.dfu.leave(o.flashStart)}))})));case 7:case"end":return t.stop()');

new vm.Script(source, { filename: 'nwlink-web.js' });
fs.writeFileSync(path.join(dist, 'index-web.js'), source);
const polyfillDir = path.join(here, 'nwlink', 'web-polyfills');
execFileSync(process.execPath, [
  path.join(polyfillDir, 'node_modules', 'esbuild', 'bin', 'esbuild'),
  path.join(polyfillDir, 'entry.js'), '--bundle', '--platform=browser', '--format=iife',
  `--alias:stream=${path.join(polyfillDir, 'node_modules', 'stream-browserify', 'index.js')}`,
  `--outfile=${path.join(dist, 'browser-compat.js')}`,
], { stdio: 'inherit' });
fs.mkdirSync(path.join(here, 'nwlink', 'package', 'dist', 'toolchain'), { recursive: true });
for (const name of ['ld.wasm', 'objcopy.wasm']) {
  fs.copyFileSync(path.join(dist, 'toolchain', name), path.join(here, 'nwlink', 'package', 'dist', 'toolchain', name));
}
let standaloneNwlink = source;
standaloneNwlink = standaloneNwlink.replaceAll('||__filename,function(t)', '||document.baseURI,function(t)');
if (standaloneNwlink.includes('||__filename,function(t)')) {
  throw new Error('Référence Node __filename restante dans le bundle autonome.');
}
standaloneNwlink = standaloneNwlink.replace(
  'new URL("./",document.currentScript.src).href',
  'new URL("./",document.currentScript.src||document.baseURI).href',
);
for (const [id, file] of [['7573', 'ld.wasm'], ['3835', 'objcopy.wasm']]) {
  const from = `${id}:(t,e,r)=>{"use strict";t.exports=r.p+"toolchain/${file}"}`;
  if (!standaloneNwlink.includes(from)) throw new Error(`Module WebAssembly ${file} introuvable.`);
  const encoded = fs.readFileSync(path.join(dist, 'toolchain', file)).toString('base64');
  standaloneNwlink = standaloneNwlink.replace(from,
    `${id}:(t,e,r)=>{"use strict";t.exports="data:application/wasm;base64,${encoded}"}`);
}
new vm.Script(standaloneNwlink, { filename: 'nwlink-standalone.js' });
let html = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
html = html.replace('  <link rel="manifest" href="manifest.webmanifest">\n', '');
html = html.replace('  <link rel="icon" href="icon.svg" type="image/svg+xml">\n', '');
html = html.replace('  <link rel="stylesheet" href="style.css">', `  <style>\n${fs.readFileSync(path.join(here, 'style.css'), 'utf8')}\n  </style>`);
for (const [url, file] of [
  ['nwlink/package/dist/process-shim.js', 'nwlink/package/dist/process-shim.js'],
  ['nwlink/package/dist/browser-compat.js', 'nwlink/package/dist/browser-compat.js'],
  ['nwlink/package/dist/index-web.js', null],
  ['app.js', 'app.js'],
]) {
  const script = `<script src="${url}"></script>`;
  let inlineBody = file ? fs.readFileSync(path.join(here, file), 'utf8') : standaloneNwlink;
  inlineBody = inlineBody.replace(/<\/script/gi, '<\\/script');
  const inline = `<script>\n${inlineBody}\n</script>`;
  if (!html.includes(script)) throw new Error(`Balise ${url} introuvable dans index.html.`);
  // Use a callback so `$&`, `$'`, and other replacement tokens in minified JS
  // are copied literally instead of being expanded by String.replace.
  html = html.replace(script, () => inline);
}
fs.writeFileSync(path.join(here, 'Installateur-NumWorks.html'), html);
console.log('Build nwlink WebUSB prête.');
