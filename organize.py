import os, re, shutil, glob

for d in ("html", "js", "css"):
    os.makedirs(d, exist_ok=True)

for f in glob.glob("*.html"):
    shutil.move(f, os.path.join("html", f))
for f in glob.glob("*.js"):
    shutil.move(f, os.path.join("js", f))
for f in glob.glob("*.css"):
    shutil.move(f, os.path.join("css", f))

for f in glob.glob("html/*.html"):
    s = open(f, encoding="utf-8").read()
    s = re.sub(r'src="(\w+\.js)"', r'src="../js/\1"', s)
    s = re.sub(r'href="(\w+\.css)"', r'href="../css/\1"', s)
    open(f, "w", encoding="utf-8").write(s)

u = open("js/ui.js", encoding="utf-8").read()
u = u.replace('href="extra.css?v=3"', 'href="../css/extra.css?v=3"')
open("js/ui.js", "w", encoding="utf-8").write(u)

open("index.html", "w", encoding="utf-8").write(
    '<!doctype html><meta charset="utf-8"><title>Zippy</title>'
    '<meta http-equiv="refresh" content="0; url=html/index.html">'
    '<a href="html/index.html">Open Zippy</a>')
print("done")