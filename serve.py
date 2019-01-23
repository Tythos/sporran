"""
"""

import os
import random
import flask

PACK_PATH, _ = os.path.split(os.path.abspath(__file__))
application = flask.Flask("sporran")

@application.route("/")
def index():
    """Root-level response routed to index
    """
    with open(PACK_PATH + "/static/index.html", 'r') as f:
        return f.read()

@application.route("/getRandomBytes")
def getRandomBytes(length=64):
    """Procedural response
    """
    if "length" in flask.request.args:
        length = int(flask.request.args.get("length"))
    return b"%x" % random.getrandbits(length)

@application.route("/js/<path:path>")
def static_js(path):
    """Static file router for JavaScript resources
    """
    return flask.send_from_directory(PACK_PATH + "/static/js", path)

@application.route("/sty/<path:path>")
def static_sty(path):
    """Static file router for styling resources
    """
    return flask.send_from_directory(PACK_PATH + "/static/sty", path)

if __name__ == "__main__":
    application.config["ENV"] = "development"
    application.config["DEBUG"] = True
    application.run()
