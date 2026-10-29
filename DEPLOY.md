# Putting ventis2026.com live

The site is plain files (HTML, CSS, JavaScript, a PDF and a few images). Any web host can serve it. The two sensible routes for Mark's GoDaddy domain are below. Route A costs nothing beyond the domain and is the one to use unless Mark already pays for GoDaddy web hosting.

The repository is https://github.com/Scarpa619/Ventis2026.com and the preview copy is served by GitHub Pages at https://scarpa619.github.io/Ventis2026.com/ once Pages is turned on (see the end of this file).

## Route A (recommended): host on GitHub Pages, point the GoDaddy domain at it

GitHub Pages is free hosting for static sites built into GitHub. The domain stays registered at GoDaddy; only its Domain Name System (DNS) records change, which tell browsers where ventis2026.com lives.

### Step 1. Add the records at GoDaddy

1. Sign in at https://www.godaddy.com with Mark's account.
2. Open My Products, find the domain ventis2026.com, and choose DNS (it may be labeled Manage DNS or DNS Management).
3. GoDaddy usually parks a new domain with an A record whose Name is @ and whose Value is Parked, and sometimes a CNAME for www pointing at the parked page. Delete the parked A record for @ and any existing CNAME for www. Leave every other record alone (anything for mail, for example).
4. Add four A records. For each one: Type A, Name @, TTL 1 hour (or 600 seconds), Value one of these:

        185.199.108.153
        185.199.109.153
        185.199.110.153
        185.199.111.153

5. Add one CNAME record: Type CNAME, Name www, Value scarpa619.github.io (no repository name on the end), TTL 1 hour.
6. Optional, for IPv6: four AAAA records, Name @, with these values:

        2606:50c0:8000::153
        2606:50c0:8001::153
        2606:50c0:8002::153
        2606:50c0:8003::153

7. Save. The records normally take minutes to spread, occasionally up to a day.

### Step 2. Tell GitHub Pages about the domain

1. Open https://github.com/Scarpa619/Ventis2026.com/settings/pages (signed in as Scarpa619).
2. Under Build and deployment, Source should be Deploy from a branch, Branch main, folder / (root).
3. Under Custom domain, type ventis2026.com and click Save. GitHub adds a file named CNAME to the repository on its own; that is expected.
4. Wait for the DNS check next to the domain to show a green tick. Then tick Enforce HTTPS. If the box is greyed out, come back in an hour; GitHub needs the records to be visible first before it can issue the certificate.
5. Open https://ventis2026.com and https://www.ventis2026.com. Both should show the site, with the padlock.

### Checking from a Windows PC

In PowerShell, this shows what the world currently sees for the domain:

    Resolve-DnsName ventis2026.com -Type A
    Resolve-DnsName www.ventis2026.com -Type CNAME

The A results should be the four 185.199.x.153 addresses and the CNAME should be scarpa619.github.io.

## Route B: upload the files to GoDaddy web hosting

Only if Mark has (or wants to pay for) a GoDaddy Web Hosting or Website Builder plan. Mark's hosting control panel (cPanel on most GoDaddy plans) has a File Manager. Upload these, keeping the folder structure, into the web root (public_html):

    index.html
    css/
    js/
    assets/

Nothing else from the repository is needed on the server. Repeat the upload whenever the site changes.

## Turning the GitHub Pages preview on (done once, by Joe)

Repository Settings, then Pages, then under Build and deployment choose Source: Deploy from a branch, Branch: main, folder: / (root), Save. A minute later the preview is at https://scarpa619.github.io/Ventis2026.com/. Every push to main updates it automatically.

## Updating the site after it is live

Edit `data/menu.json` (prices, items, hours), run `node build.mjs` in the project folder, check the page, then commit and push. With Route A, GitHub Pages picks the change up within a minute or two. With Route B, upload the changed files again. See README.md for the editing steps in detail.
