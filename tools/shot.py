"""Screenshot a page with headless Chromium (Python Playwright).

Usage:
  python -I tools/shot.py <index.html | folder | http url> <out.png> [--full] [--mobile]
         [--width 1440] [--height 900] [--scroll-to 1200] [--reduced-motion] [--wait 1200]

A local .html file or folder is served over a throwaway local HTTP server so the page
behaves exactly as it will when hosted. --full scrolls through the page first so
scroll triggered animations have fired, then captures the whole page.
Prints page size, console errors and failed requests, and flags horizontal overflow.
"""
import argparse, functools, os, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("target"); ap.add_argument("out")
ap.add_argument("--width", type=int, default=1440); ap.add_argument("--height", type=int, default=900)
ap.add_argument("--mobile", action="store_true"); ap.add_argument("--full", action="store_true")
ap.add_argument("--reduced-motion", action="store_true"); ap.add_argument("--wait", type=int, default=1200)
ap.add_argument("--scroll-to", type=int, default=None)
a = ap.parse_args()

url = a.target
if not url.startswith("http"):
    p = os.path.abspath(url)
    d, name = (p, "index.html") if os.path.isdir(p) else (os.path.dirname(p), os.path.basename(p))
    class H(SimpleHTTPRequestHandler):
        def log_message(self, *args): pass
    srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(H, directory=d))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{srv.server_address[1]}/{name}"

with sync_playwright() as pw:
    try:
        b = pw.chromium.launch()
    except Exception:
        b = pw.chromium.launch(channel="msedge")  # fall back to the installed Microsoft Edge
    ctx = dict(viewport={"width": a.width, "height": a.height}, device_scale_factor=1)
    if a.mobile:
        ctx = dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                   user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
    ctx["reduced_motion"] = "reduce" if a.reduced_motion else "no-preference"
    c = b.new_context(**ctx); page = c.new_page()
    notes = []
    page.on("console", lambda m: notes.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: notes.append(f"pageerror: {e}"))
    page.on("requestfailed", lambda r: notes.append(f"requestfailed: {r.url} ({r.failure})"))
    page.goto(url, wait_until="networkidle", timeout=90000)
    page.evaluate("document.fonts.ready"); page.wait_for_timeout(a.wait)
    if a.full:
        y, h = 0, page.evaluate("document.documentElement.scrollHeight")
        while y < h:
            page.evaluate(f"window.scrollTo(0, {y})"); page.wait_for_timeout(120)
            y += 450; h = page.evaluate("document.documentElement.scrollHeight")
        page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)"); page.wait_for_timeout(700)
        page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(600)
        page.screenshot(path=a.out, full_page=True)
    else:
        if a.scroll_to is not None:
            page.evaluate(f"window.scrollTo(0, {a.scroll_to})"); page.wait_for_timeout(1000)
        page.screenshot(path=a.out)
    sw, sh, vw = (page.evaluate(x) for x in ("document.documentElement.scrollWidth", "document.documentElement.scrollHeight", "window.innerWidth"))
    print(f"saved {a.out}  viewport={ctx['viewport']['width']}x{ctx['viewport']['height']}  page={sw}x{sh}" + ("  HORIZONTAL OVERFLOW" if sw > vw else ""))
    for n in notes: print("  " + n)
    b.close()
