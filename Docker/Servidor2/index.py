from flask import Flask, request, jsonify, Response
from time import time
import hashlib
import boto3
from botocore.exceptions import ClientError
import base64
import tempfile
import uuid
import logging
import json
import datetime

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.route("/")
def prueba() :
    return "Hola desde el servidor 2 de Python SEMINARIO DE SISTEMAS 1"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)