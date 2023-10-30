#!/usr/bin/env bash

mkdir -p certs >/dev/null 2>&1

openssl req -nodes -new -x509 -keyout certs/server.key -out certs/server.cert
