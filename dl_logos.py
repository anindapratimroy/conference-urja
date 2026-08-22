import urllib.request
import json

domains = {
    "iiti_logo.png": "iiti.ac.in",
    "tifr_logo.png": "tifr.res.in",
    "iucaa_logo.png": "iucaa.in",
    "iist_logo.png": "iist.ac.in"
}

req_headers = {'User-Agent': 'Mozilla/5.0'}

for name, domain in domains.items():
    try:
        url = f"https://www.google.com/s2/favicons?domain={domain}&sz=256"
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req) as response:
            with open("images/" + name, 'wb') as out_file:
                out_file.write(response.read())
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Error for {name}: {e}")

