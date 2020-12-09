Sporran
=======

Quick-starter for Flask-based servers well-suited for modular microservices.
Users copy or import the *serve.py* file to start a new web application that
includes:

* WSGI ("application") export support for transparent compatability with
  production hosts like Passenger

* Demonstrated static file integration and routing

* Procedural responses

* Modification-less test mode in static file launch or execution of *serve.py*

* Dockerfile for ready-to-use portability between hosts, including
  environmental variable configurations

Really nothing too unique. Mainly just a way to save some time and not have to
remember / look up how certain routes and settings have to be defined each time
a new microservice/application project starts.
