Planto — static website (HTML5 + CSS3 + Vanilla JS)

HOW TO RUN
1. Unzip the folder.
2. Double-click index.html  (works directly from the file system)
   or, for best results, run a tiny local server:
       python -m http.server 8000
   then open http://localhost:8000

Everything is self-contained: no internet, no npm, no build step.
All fonts (Poppins, DM Sans) and Font Awesome 6 icons are bundled in
assets/fonts/ and webfonts/. All paths are relative.

STRUCTURE
  *.html            29 pages
  components/       header/footer source (already inlined in each page)
  css/              variables, utilities, animations, style, responsive, fonts, fontawesome
  js/               products, main, animations, slider, cart, wishlist, search, checkout, auth, dashboard
  assets/images/    plant photography
  assets/fonts/     Poppins + DM Sans woff2
  webfonts/         Font Awesome woff2
