"""en/notes/ の記事のうち、/en/ の一覧に無いものを足す。"""
import re, glob, html
p = 'en/index.html'; s = open(p, encoding='utf8').read()
add = ''
for f in sorted(glob.glob('en/notes/*/index.html')):
    slug = f.split('/')[2]
    if f'/en/notes/{slug}/' in s: continue
    h1 = re.search(r'<h1>(.*?)</h1>', open(f, encoding='utf8').read(), re.S).group(1)
    add += f'    <li><a href="/en/notes/{slug}/" hreflang="en" lang="en">{h1}</a></li>\n'
if add:
    i = s.index('</ul>', s.index('en/notes/'))
    s = s[:i] + add + '  ' + s[i:]; open(p, 'w', encoding='utf8').write(s)
print(add.count('<li>'), 'added')
