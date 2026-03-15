#!/usr/bin/env python3

from http.server import SimpleHTTPRequestHandler, HTTPServer
import requests
import re
from datetime import datetime

HOST = "localhost"
PORT = 8000


class Server(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/buoys":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(bytes(buoy_locations, "utf-8"))
        elif self.path.startswith("/buoy/"):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(bytes(get_buoy_data(self.path[6:]), "utf-8"))
        elif self.path.startswith("/current/"):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()

            rounded_coords = self.path[9:].split(",")
            lat = round(float(rounded_coords[0])*4+.5)/4-.125
            lng = round(float(rounded_coords[1])*4+.5)/4-.125
            vector = currents[(lat, lng)]
            self.wfile.write(
                bytes(str(vector[0])+","+str(vector[1]), "utf-8"))
        else:
            super().do_GET()


def parse_coords(coords):
    groups = re.search(
        "([0-9\\.]+) (N|S) ([0-9\\.]+) (W|E)", coords).groups()
    return (float(groups[0])*(-1 if groups[1] == "S" else 1),
            float(groups[2])*(-1 if groups[3] == "W" else 1))


def get_buoy_data(id):
    return "\t".join(re.split(" +",
                              [line for line in requests
                               .get("https://www.ndbc.noaa.gov/data/realtime2/"
                                    + id+".txt").text.split("\n")
                               if not line.startswith("#")][0]))


print("Downloading ocean current data...")
currents = {}
date = datetime.today().strftime('%Y-%m-%d')
# TODO: dynamically fetch today's data
for line in (requests.get("https://coastwatch.noaa.gov/erddap/griddap/noaacwBLENDEDNRTcurrentsDaily.csv?u_current%5B(2026-03-13T00:00:00Z):1:(2026-03-13T00:00:00Z)%5D%5B(-89.875):1:(89.875)%5D%5B(-179.875):1:(179.875)%5D,v_current%5B(2026-03-13T00:00:00Z):1:(2026-03-13T00:00:00Z)%5D%5B(-89.875):1:(89.875)%5D%5B(-179.875):1:(179.875)%5D").text.split("\n")[2:-1]):
    vector = line.split(",")
    currents[(float(vector[1]), float(vector[2]))] = (
        float(vector[3]), float(vector[4]))

print("Downloading buoy data...")
buoy_locations = ""
html = requests.get("https://www.ndbc.noaa.gov/data/realtime2/").text
for buoy in [line.split("|") for line in requests
             .get("https://www.ndbc.noaa.gov/data/stations/station_table.txt")
             .text.split("\n") if
             (not line.startswith("#") and len(line) > 0)]:
    if buoy[0]+".txt" not in html:
        continue
    coords = parse_coords(buoy[6])
    buoy_locations += f"{'\n' if len(buoy_locations) >
                         0 else ''}{buoy[0]}\t{coords[0]}\t{coords[1]}"

server = HTTPServer((HOST, PORT), Server)
print(f"Started server on http://{HOST}:{PORT}")
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
server.server_close()
