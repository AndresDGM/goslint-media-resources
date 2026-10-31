"""Genera la HOJA DE CONCEPTO de una mascota (1920×1080, se guarda a 2x) con el mismo diseño de las
hojas de Vee y Marco.

Uso:
    python3 hoja/hacer_hoja.py <config.json> <carpeta_sprites> <salida.png>

  <config.json>      textos de la hoja (ver hoja/ejemplo_config.json)
  <carpeta_sprites>  la carpeta que genera la plantilla (p_<pose>.png, p_anim0..3.png, p_esp0..2.png)
  <salida.png>       imagen final

Requiere Playwright con Chromium (python3 -m pip install playwright && python3 -m playwright install chromium).
"""
import json, os, shutil, sys, tempfile, html

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)


def esc(s):
    return html.escape(str(s))


def main(cfg_path, sprites, out):
    c = json.load(open(cfg_path, encoding='utf-8'))
    acc = c.get('color_acento', '#00C063')
    work = tempfile.mkdtemp(prefix='hoja_')
    for f in os.listdir(os.path.join(HERE, 'fuentes')):
        shutil.copy(os.path.join(HERE, 'fuentes', f), work)
    shutil.copy(os.path.join(HERE, 'marca', 'wordmark.png'), work)
    for f in os.listdir(sprites):
        if f.endswith('.png'):
            shutil.copy(os.path.join(sprites, f), work)
    for n in ('lint_idle.png', 'vee_idle.png', 'marco_idle.png'):
        shutil.copy(os.path.join(KIT, 'referencias', 'sprites', n), work)

    rasgos = ''.join(f'<b>›</b> {r}<br>' for r in c['rasgos'])
    paleta = ''.join(f'<span class="sw" style="background:{p}"></span>' for p in c['paleta'])
    if c.get('paleta_codigos'):  # opcional: cada color con su código hexadecimal debajo
        paleta = '<div style="display:grid;grid-template-columns:repeat(6,74px);row-gap:10px">' + ''.join(
            f'<div><span class="sw" style="background:{p}"></span><div style="font-size:12px;color:#a4ada8;margin-top:4px">{esc(p.upper())}</div></div>'
            for p in c['paleta']) + '</div>'
    pal_top = c.get('paleta_top', 800)
    # opcional: detalles de identidad (recortes que exporta la mascota) en la columna izquierda
    det = c.get('detalles')
    det_html, det_js = '', '[]'
    if det:
        det_html = f'<div class="abs" style="left:70px;top:{det["top"]}px;font-size:15px;color:#a4ada8">{esc(det["titulo"])}</div>'
        det_js = json.dumps([[im, lab, sc, det['top']] for im, lab, sc in det['items']], ensure_ascii=False)
    pasos = json.dumps(c.get('especial_pasos', []), ensure_ascii=False)
    poses = json.dumps(c['poses'], ensure_ascii=False)
    ref = c.get('nota_referencia', '')
    ref_html = f'<div class="abs mut" style="left:70px;top:398px;font-size:15px;width:440px;line-height:1.5;border-left:3px solid {acc};padding-left:14px">{ref}</div>' if ref else ''
    page = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{esc(c['nombre'])}</title><style>
@font-face{{font-family:Pix;src:url(silkscreen-latin-400-normal.woff2)}}
@font-face{{font-family:Pix;src:url(silkscreen-latin-700-normal.woff2);font-weight:700}}
@font-face{{font-family:JBM;src:url(jetbrains-mono-latin-400-normal.woff2)}}
@font-face{{font-family:JBM;src:url(jetbrains-mono-latin-700-normal.woff2);font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1920px;height:1080px;background:#070807;color:#fff;font-family:JBM,monospace;position:relative;overflow:hidden;
background-image:radial-gradient(rgba(255,255,255,.055) 1px,transparent 1.3px);background-size:24px 24px}}
.abs{{position:absolute}} img.px{{image-rendering:pixelated;position:absolute}}
.k{{font-size:24px;letter-spacing:5px;color:#00C063}} .h{{font-family:Pix;font-weight:700}} .mut{{color:#a4ada8}}
.panel{{position:absolute;border:2px solid #2a312d;background:rgba(13,18,16,.9)}}
.lab{{position:absolute;font-size:14px;color:#a4ada8;text-align:center;width:150px}}
.tr{{font-size:18px;line-height:1.5;color:#e9eeea}} .tr b{{color:{acc};font-weight:700}}
.sw{{display:inline-block;width:26px;height:26px;margin-right:6px;border:2px solid #2a312d;vertical-align:middle}}
</style></head><body>
<div class="abs k" style="left:70px;top:52px">{esc(c['encabezado'])}</div>
<img src="wordmark.png" class="abs" style="right:70px;top:46px;height:30px">
<div class="abs" style="left:70px;right:70px;top:100px;height:2px;background:#2a312d"></div>
<div class="abs k" style="left:70px;top:132px;font-size:18px">LA IDEA</div>
<div class="abs h" style="left:70px;top:162px;font-size:30px;line-height:1.3">{c['idea_titulo']}</div>
<div class="abs mut" style="left:70px;top:258px;font-size:16px;width:440px;line-height:1.5">{c['idea_texto']}</div>
{ref_html}
<div class="abs tr" style="left:70px;top:538px;width:460px">{rasgos}</div>
<div class="abs" style="left:70px;top:{pal_top}px;font-size:15px;color:#a4ada8">PALETA</div>
<div class="abs" style="left:70px;top:{pal_top + 24}px">{paleta}</div>
{det_html}
<div class="abs" style="left:560px;top:130px;width:540px;height:640px">
 <div class="abs" style="left:40px;top:60px;width:460px;height:560px;background:radial-gradient(ellipse at 50% 55%,{c.get('halo','rgba(0,192,99,.22)')},transparent 65%)"></div>
 <img class="px" id="hero" src="p_{c.get('pose_principal','idle')}.png">
 <div class="abs h" style="left:0;top:0;width:540px;text-align:center;font-size:64px;letter-spacing:6px">{esc(c['nombre']).upper()}</div>
 <div class="abs" style="left:0;top:80px;width:540px;text-align:center;font-size:17px;color:{acc};letter-spacing:3px">{esc(c['subtitulo'])}</div>
</div>
<div class="panel" style="left:600px;top:730px;width:460px;height:210px"></div>
<div class="abs" style="left:620px;top:744px;font-size:15px;color:#a4ada8">MISMA ESCALA QUE LINT, VEE Y MARCO</div>
<img class="px" id="c1" src="lint_idle.png"><img class="px" id="c2" src="vee_idle.png"><img class="px" id="c3" src="marco_idle.png"><img class="px" id="c4" src="p_idle.png">
<div class="panel" style="left:1130px;top:132px;width:720px;height:330px"></div>
<div class="abs k" style="left:1156px;top:150px;font-size:18px;color:{acc}">MOVIMIENTO ESPECIAL</div>
<div class="abs h" style="left:1156px;top:178px;font-size:38px">{esc(c['especial_titulo'])}</div>
<div class="abs mut" style="left:1156px;top:230px;font-size:15px;width:670px;line-height:1.45">{c['especial_texto']}</div>
<div class="abs" style="left:1660px;top:330px;font-size:14px;line-height:1.5;color:#a4ada8;width:170px">{c.get('especial_nota','')}</div>
<div class="abs k" style="left:1130px;top:492px;font-size:18px;color:{acc}">POSES</div>
<div class="abs k" style="left:1130px;top:812px;font-size:18px;color:{acc}">{esc(c.get('anim_titulo','ANIMACIÓN EN REPOSO · 4 TIEMPOS'))}</div>
<div class="abs" style="left:70px;right:70px;bottom:30px;display:flex;justify-content:space-between;font-size:16px;color:#a4ada8;border-top:2px solid #2a312d;padding-top:16px">
<span><b style="color:#00C063;font-weight:400">GOSLINT</b> · Semillero de Investigación · UCEVA</span><span>{esc(c.get('version', c['nombre'] + ' · bosquejo v0'))}</span></div>
<script>
let pending=0;
const place=(src,scale,cx,bot)=>{{const im=new Image();im.src=src;im.className='px';pending++;
 im.onload=()=>{{im.style.width=(im.naturalWidth*scale)+'px';im.style.left=(cx-im.naturalWidth*scale/2)+'px';im.style.top=(bot-im.naturalHeight*scale)+'px';pending--;}};
 im.onerror=()=>{{pending--;}};document.body.appendChild(im);}};
const fit=(id,scale,cx,bot)=>{{const e=document.getElementById(id);const f=()=>{{e.style.width=(e.naturalWidth*scale)+'px';e.style.left=(cx-e.naturalWidth*scale/2)+'px';e.style.top=(bot-e.naturalHeight*scale)+'px'}};e.onload=f;if(e.complete)f();}};
fit('hero',{c.get('escala_principal',10)},270,590);
fit('c1',3,672,919);fit('c2',3,762,919);fit('c3',3,852,919);fit('c4',3,950,919);
const P={poses};
P.forEach(([n,l],i)=>{{const cx=1200+(i%4)*175, bot=640+Math.floor(i/4)*150;place('p_'+n+'.png',2.5,cx,bot);
 const d=document.createElement('div');d.className='lab';d.textContent=l;d.style.left=(cx-75)+'px';d.style.top=(bot+4)+'px';document.body.appendChild(d);}});
[0,1,2,3].forEach(i=>place('p_anim'+i+'.png',3,1210+i*150,1000));
const S={pasos}, eb=S.length?428:450;
[0,1,2].forEach(i=>{{place('p_esp'+i+'.png',3,1230+i*150,eb);
 if(S[i]){{const d=document.createElement('div');d.className='lab';d.textContent=S[i];d.style.left=(1230+i*150-75)+'px';d.style.top=(eb+6)+'px';document.body.appendChild(d);}}}});
{det_js}.forEach(([src,l,sc,top],i)=>{{const cx=125+i*115, bot=top+92;place(src,sc,cx,bot);
 const d=document.createElement('div');d.className='lab';d.style.width='112px';d.style.fontSize='13px';d.style.lineHeight='1.3';d.textContent=l;d.style.left=(cx-56)+'px';d.style.top=(bot+6)+'px';document.body.appendChild(d);}});
</script></body></html>'''
    page_path = os.path.join(work, 'hoja.html')
    open(page_path, 'w', encoding='utf-8').write(page)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=2)
        pg.goto('file://' + page_path)
        pg.wait_for_timeout(1500)
        pg.screenshot(path=out)
        b.close()
    print('hoja:', out)


if __name__ == '__main__':
    main(*sys.argv[1:4])
