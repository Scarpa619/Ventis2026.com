# Venti's Aperitivo Bar, website design brief

Prepared October 29, 2026. Read all of it before writing a line of code.

## What this is

A single page website for Venti's Aperitivo Bar, a new Italian restaurant and aperitivo bar in Poway, California, owned by Mark. Its job: on a phone, within seconds, let someone see the menu, call, get directions and know the hours. On a laptop, make Mark proud: it should look like a restaurant that has its act together, modern and alive, and still warm and traditional.

The final printed menu is the brand. It is in `docs/reference/menu-page1.png` and `docs/reference/menu-page2.png`. Look at both images with the Read tool before you design anything. The site must be recognizably the same restaurant: ivory paper, deep green and red, a heavy serif wordmark with an olive sprig, red italic section titles, dotted leaders to prices, red circle price badges, the green ribbon banner, the green white red tricolor rule, and the double rule frame with small red squares at the corners.

## The source of truth for every word on the menu

`data/menu.json`. Every item, description, price, hour, address, phone and email on the page must be rendered from this file by your build script. Never hand type a menu item, price or hour in a template. If something looks wrong in the file, do not change it; mention it in your report.

## Hard rules (a build that breaks one of these loses)

1. Legibility first. Dark text on a solid light background for everything a person needs to read. Body text 17px or larger on mobile and 18px or larger on desktop; menu item names 19px or larger; measure under 75 characters per line. WCAG AA contrast everywhere. Large display text in white or ivory on the brand green or red is fine at 28px and up. Menu items, descriptions, prices, hours, address and phone are never placed on green, red, a pattern or an illustration.
2. Script fonts only at display sizes (40px and up) and never for information: not for item names, prices, hours, address, phone, buttons or navigation.
3. No dashes anywhere in the copy: no em dashes, no en dashes, no hyphens used as connectors. Write "mobile first", "click to call", "two column". Hyphens inside code, CSS, URLs and file names are fine. Use commas, periods and colons instead.
4. The words on the site come from `data/menu.json` and the copy bank below. Do not invent dishes, awards, reviews, history, a chef story or claims about the restaurant. No fake testimonials, no fake photos, no "est. 1987".
5. No photographs. None exist yet, and stock food could pass for Mark's food. Illustrate with SVG you draw in code (olive sprig, tricolor rule, frame, price badges, ribbon, simple line art of a glass, a bowl, a plate). Design so the page is complete and beautiful without photos.
6. Static site. Plain HTML, CSS and vanilla JavaScript. Node is used only for `build.mjs`, with no npm packages. The folder must work when served from any static host, including GitHub Pages under a subpath, so every URL in the page is relative (`css/style.css`, `assets/og.png`), never `/css/style.css`.
7. Motion respects `prefers-reduced-motion` (reduce to simple fades or nothing). Animate only transform and opacity, plus SVG stroke-dashoffset and clip-path. No scroll handlers that read layout every frame; use IntersectionObserver, or CSS scroll driven animations with a working fallback. Text never moves while someone could be reading it.
8. Fonts from Google Fonts with `display=swap` and preconnect, at most three families.
9. Accessible: one h1, logical headings, landmarks (header, nav, main, footer), alt text on meaningful SVG and aria-hidden on decorative SVG, visible keyboard focus, a skip link, buttons and links with real labels, 44px tap targets on mobile, color never the only signal.
10. Fast: no raster image over 200 KB (the menu PDF is a download link, not an image), no libraries, page weight under 400 KB excluding fonts and the PDF.

## Business details (exact; they also live in data/menu.json)

Name: Venti's Aperitivo Bar. "Venti" is Italian for twenty, which is also the price of the signature platter.
Address: 12265 Scripps Poway Parkway #113, Poway, California 92064
Phone: 858.864.6868, linked as `tel:+18588646868`
Email: italiancaterings@aol.com
Hours: Monday through Saturday, 5 PM to 10 PM. Sunday, 9:30 AM to 8:30 PM (NFL Sunday Brunch, doors open at 9:30 AM).
Domain the site will live on: https://ventis2026.com/

## Colors (sampled from the final printed menu)

| Token | Hex | Use |
| --- | --- | --- |
| paper | #F5EFDD | page background, matches the menu paper |
| cream | #F1E5D2 | feature boxes, like the platter box on the menu |
| white | #FFFFFF | an alternate light surface |
| green | #16533A | wordmark, frame, ribbon; the brand green |
| green deep | #0F3A28 | hover states, a dark footer if you use one |
| red | #A21E28 | APERITIVO BAR, prices, italic section titles, badges, corner squares |
| ink | #0D2D1E | display text; the menu's ink is a very dark green, not black |
| body | #2A3A31 | body text |
| rule | #CDC3B0 | dotted leaders and hairlines |

Avoid: neon, black backgrounds, gradients as decoration, terracotta or orange accents, pastels, pure grey text.

## Type

Playfair Display (Google Fonts): the wordmark (weight 900), headings (700 and 900), and the italic 900 in red for the Italian section titles, Primi, Insalate, Dalla Cucina, Dolci, Birra, Vino, exactly as on the menu.
Italianno (Google Fonts): script accents at display sizes only, for La Specialità, Choose Your Sauce, Grazie, and we'll see you soon!, Salute!
Libre Baskerville (Google Fonts): body text, descriptions, hours, address. Lora or Crimson Pro are acceptable instead if you prefer them; no sans serif body text, this is a traditional Italian restaurant.

Tracked out capitals are part of the brand only in the APERITIVO BAR lockup and the English pairing next to the Italian section titles (PASTA PLATES, SALADS), and there they must be 15px or larger with modest tracking. Never set body text, items, prices or hours in all caps.

## Page structure (single page, anchored sections, in this order)

1. Header: sticky, condenses on scroll, links to Menu, Platter, Brunch, Drinks, Hours, plus a Call button. On mobile keep it simple and keep the Call button reachable.
2. Hero: the wordmark Venti's with the olive sprig and APERITIVO BAR, the tagline "Recipes from Northern Italy, Southern Italy and Sicily, dangerously blended." with "Our pesto is made fresh every day.", three big buttons: Call 858.864.6868 (tel link), Get Directions (maps link in a new tab), See the Menu (anchor). Show the hours summary in or right under the hero.
3. La Specialità: The Venti Meal Platter, $20, its description, and "Venti means twenty. Twenty dollars. Perfetto!"
4. Menu: Primi / Pasta Plates $16 (the note, the six pastas, Choose Your Sauce with the three sauces and their descriptions), then Insalate / Salads, Dalla Cucina / From the Kitchen, Dolci / Dessert. Italian title in red italic paired with the English, always visible. Dotted leaders to prices. A link to download the printed menu: `assets/Ventis_Menu.pdf` (copy the PDF from the repo's `assets/` into your candidate's `assets/` so the link works).
5. La Domenica: NFL Sunday Brunch, $12, "Italian omelettes, potatoes, sausage, French toast and fruit." and "Doors open Sundays at 9:30 AM, just in time for the early kickoff."
6. La Cantina: Birra / Beer (Bottles and Cans $6 with its five beers, On Draft $8 with its four) and Vino / Wine (House Wines $9, Premium Wines $12, the six varietals with their producers). Tagline: "Beer, wine and good company."
7. Aperitivo, short: aperitivo (ah peh ree TEE voh): The Italian ritual of a good glass and a little something to eat as the evening begins. Consider this your invitation.
8. Hours and Vieni a Trovarci: the hours, the address, phone, email, a Get Directions button and an embedded Google map (iframe with `loading="lazy"`, a `title`, `src` from `links.mapEmbed` in the data file).
9. Footer: small wordmark, address, phone, email, "Grazie, and we'll see you soon!", and "© 2026 Venti's Aperitivo Bar".

Do not add a catering section, reservations, online ordering, social links, a newsletter, reviews, a gallery, an about story or a blog. None of these exist yet.

## Copy bank (approved; use these words, do not paraphrase them)

Taglines: "Recipes from Northern Italy, Southern Italy and Sicily, dangerously blended." "Our pesto is made fresh every day." "Beer, wine and good company." "Mangia. Bevi. Ripeti." (Eat. Drink. Repeat.)
Platter: "Venti means twenty. Twenty dollars. Perfetto!" "Venti means twenty, and so does the price of our signature spread."
Brunch: "Italian omelettes, potatoes, sausage, French toast and fruit. Doors open Sundays at 9:30 AM, just in time for the early kickoff."
Aperitivo: "aperitivo (ah peh ree TEE voh): The Italian ritual of a good glass and a little something to eat as the evening begins. Consider this your invitation."
Italian touches: La Specialità della Casa (house specialty), La Cantina (the cellar), La Domenica (Sunday), Vieni a Trovarci (come see us), Salute! and Cin Cin! (cheers), A presto! (see you soon), "Grazie, and we'll see you soon!"
Section naming: Italian paired with English, Primi / Pasta Plates, Insalate / Salads, Dalla Cucina / From the Kitchen, Dolci / Dessert, Birra / Beer, Vino / Wine.

## Motion (Joe asked for motion; make it exceptional and tasteful)

- One orchestrated hero entrance on load: the olive sprig draws or settles in, the wordmark arrives, the tricolor rule draws across, the tagline and buttons follow in a stagger. Under 1.6 seconds total, never blocking reading.
- Scroll driven moments that mean something: dotted leaders draw toward their price, a price badge pops, the ribbon unfurls, the frame rules draw, a section title slides in once. Not the generic "every block fades up".
- Gentle ambient life: the olive sprig sways very slightly, a hover lifts a button, the header condenses as you scroll. Nothing loops in a way that distracts from reading.
- Reduced motion: everything still appears, immediately, without movement.
- Judge your motion with screenshots and by reasoning about it; it must run at 60 fps on a mid range phone, so only transform, opacity, stroke-dashoffset and clip-path are animated.

## Search, sharing and icons

- `<title>`: Venti's Aperitivo Bar | Italian Restaurant and Aperitivo Bar in Poway, California
- Meta description that says Italian restaurant and aperitivo bar in Poway, mentions the Venti Meal Platter, pasta, salads, beer and wine, and NFL Sunday Brunch, in under 160 characters.
- Canonical `https://ventis2026.com/`. Open Graph and Twitter card tags; `og:image` absolute `https://ventis2026.com/assets/og.png`, a 1200 by 630 image you generate by writing `og.html` and screenshotting it with the shot tool at `--width 1200 --height 630`.
- JSON-LD `Restaurant` with name, address (PostalAddress), telephone, email, url, servesCuisine Italian, priceRange, openingHoursSpecification built from the hours in the data file, and hasMenu with the sections and items, generated by `build.mjs` from the same data.
- Favicon: an SVG favicon (the olive sprig over a red V, or a red V on ivory), plus `favicon-32.png` and `apple-touch-icon.png` (180 by 180) generated with the shot tool from a small HTML file. `theme-color` the brand green.

## Technical deliverables (inside your candidate folder only)

- `build.mjs`: Node, no dependencies. Reads `data/menu.json` from next to itself if present, otherwise from `../../data/menu.json`. Renders the menu, hours, contact details and the JSON-LD into `index.html` from `src/template.html` (or a structure of your choosing under `src/`). Run with `node build.mjs`. Escape HTML entities in data (the apostrophe in Venti's, the ù in ragù, the à in Specialità).
- `index.html` (built, committed), `css/style.css`, `js/main.js`, `assets/` (your SVGs, `og.png`, favicon files, a copy of `Ventis_Menu.pdf`).
- The page must have zero console errors and no horizontal overflow at 390px and at 1440px.

## Your process (required)

1. Read this brief, both menu images, `data/menu.json`, and `tools/shot.py`.
2. If a Skill tool is available to you, invoke `frontend-design:frontend-design` and follow it. Its core advice, in case it is not: ground every choice in this subject (an Italian aperitivo bar in Poway with this printed menu), spend your boldness in one memorable place and keep everything else quiet, make typography carry the personality, avoid the generic tells (an all caps eyebrow over every heading, numbered 01 02 03 markers, identical rounded cards with the same soft shadow, gradient washes, arrows appended to links, meta strings joined with middle dots), and critique your own work from screenshots.
3. Write a short design plan first (tokens, type scale, layout sketch, the one bold moment, the motion plan) and check it against the brief and against the generic default before building.
4. Build. Run `node build.mjs`. Screenshot with the shot tool from inside your candidate folder:
   `python -I ../../tools/shot.py index.html shots/desktop-hero.png`
   `python -I ../../tools/shot.py index.html shots/desktop-full.png --full`
   `python -I ../../tools/shot.py index.html shots/mobile-hero.png --mobile`
   `python -I ../../tools/shot.py index.html shots/mobile-full.png --mobile --full`
   Look at every screenshot with the Read tool. Critique honestly: legibility, hierarchy, spacing, whether it looks like this restaurant, whether it looks like a template. Fix and repeat at least twice. The tool prints console errors, failed requests and a HORIZONTAL OVERFLOW flag; all three must be clean.
5. Report what you built, the one bold moment, the motion plan, any data concerns and any known weaknesses, honestly.

## How the candidates will be judged

Three judges score each candidate from 1 to 10 on: first impression and distinctiveness, fidelity to the printed menu's identity and to this brief, legibility and readability, motion quality (taste, smoothness, purpose), the mobile experience, and craft (code quality, accessibility, performance, data driven rendering). The winner becomes the site; the best ideas from the others get grafted in.
