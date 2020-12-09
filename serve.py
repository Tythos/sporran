"""
"""

import os
import random
import flask
from gevent import pywsgi

MOD_ROOT, _ = os.path.split(os.path.abspath(__file__))
_, MOD_NAME = os.path.split(MOD_ROOT)
APP = flask.Flask(MOD_NAME)

@APP.route("/")
def index():
    """Root-level response routed to index
    """
    with open(MOD_ROOT + "/static/index.html", 'r') as f:
        return f.read()

@APP.route("/getRandomBytes")
def getRandomBytes(length=64):
    """Procedural response
    """
    if "length" in flask.request.args:
        length = int(flask.request.args.get("length"))
    return b"%x" % random.getrandbits(length)

@APP.route("/<path:path>")
def static_js(path):
    """Static file router
    """
    return flask.send_from_directory(MOD_ROOT + "/static", path)

def main():
    """Hosts service (Flask WSGI application) using gevent
    """
    host = os.getenv("SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("SERVICE_PORT", "8421"))
    print("Starting %s service at %s:%u..." % (MOD_NAME, host, port))
    pywsgi.WSGIServer((host, port), APP).serve_forever()

if __name__ == "__main__":
    main()
