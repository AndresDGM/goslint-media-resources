// Renderiza las miniaturas: node miniaturas/src/render.js (desde promo/)
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const [id,w,h,out] of [['yt',1280,720,'miniatura-youtube.jpg'],['reel',1080,1920,'miniatura-reel.jpg']]){
 const p=await b.newPage({viewport:{width:w,height:h}});
 await p.goto('file://'+path.join(__dirname,'thumb.html')+'#'+id);
 await p.addStyleTag({content:`body{--w:${w}px;--h:${h}px}`});
 await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.screenshot({path:path.join(__dirname,'..',out),type:'jpeg',quality:92});}
await b.close();})();
