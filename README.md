# Venti's Aperitivo Bar, ventis2026.com

The website for Venti's Aperitivo Bar, an Italian restaurant and aperitivo bar at 12265 Scripps Poway Parkway #113, Poway, California. One page: the Venti Meal Platter, the menu, NFL Sunday Brunch, beer and wine, hours and directions.

Live at https://ventis2026.com (GitHub Pages serves the files in this repository from the main branch; the domain's DNS at GoDaddy points there). The printed menu the site is built from is `assets/Ventis_Menu.pdf`.

## How it is built

Plain HTML, CSS and JavaScript. No framework, no packages, no server. Every menu item, price, hour, address and phone number comes from one file, `data/menu.json`, and a small Node script, `build.mjs`, writes them into `index.html` from the templates in `src/`. The built `index.html` is committed, so the host serves plain files.

```
data/menu.json      every item, price, description, hour and contact detail (edit this)
build.mjs           renders index.html from the data (run this); it also renders og.html and icon.html,
                    the screenshot sources for the share image and the icons, which stay out of git
src/                the page templates the build reads
css/style.css       all styling
js/main.js          header behavior, the mobile menu, the motion
assets/             SVG art, favicons, the share image, the printed menu PDF
docs/BRIEF.md       the design brief, colors, fonts and copy rules
docs/reference/     the printed menu pages as images
tools/shot.py       takes screenshots for checking the page (needs Python Playwright)
DEPLOY.md           how the domain and hosting are set up
```

## Changing a price, an item or the hours

1. Open `data/menu.json` in any text editor (Notepad works) and change the value. Keep the quotes and commas as they are.
2. Rebuild the page. In a terminal in this folder:

```bash
node build.mjs
```

   Node.js must be installed (https://nodejs.org, the LTS version). The build stops with a message if it finds a dash in the copy, a root relative URL, a second main heading or a description over 160 characters, so it cannot publish a broken page quietly.
3. Open `index.html` in a browser and check the change.
4. Commit and push to main. GitHub Pages publishes it to ventis2026.com within a minute or two.

A change made on GitHub.com directly to `data/menu.json` does not rebuild the page by itself; `index.html` only changes when `node build.mjs` runs. Edit locally, build, then push.

## Checking the page with screenshots

`tools/shot.py` renders the page in a headless browser and saves a picture, which is how the site was reviewed.

```bash
python -I tools/shot.py index.html shots/desktop.png --full
python -I tools/shot.py index.html shots/phone.png --mobile --full
```

It needs Python 3 with Playwright (`pip install playwright` then `python -m playwright install chromium`). It reports console errors and any horizontal overflow.

## Design in one paragraph

The site is the printed menu brought to the screen: ivory paper, the brand green (#16533A) and red (#A21E28), the olive sprig wordmark in Playfair Display, red italic Italian section titles paired with English, dotted leaders to prices, the red 20 badge on the platter, the green ribbon for Sunday brunch, the tricolor rule, and the double rule frame with red corner squares. Body text is Libre Baskerville, dark on light everywhere, with script lettering only at display sizes. Motion is one orchestrated entrance on load and small scroll moments after that, all switched off for anyone who prefers reduced motion.

## What is not on the site yet

Photos (none exist; the page uses drawn SVG art and is complete without them), catering (not confirmed), social media links, reservations and online ordering. All can be added later.
