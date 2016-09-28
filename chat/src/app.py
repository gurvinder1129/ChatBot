
import json
#from flask_cors import CORS, cross_origin
from flask_cors import CORS, cross_origin
from flask import Flask, jsonify, request,session
from classifier import *
import re
import uuid
import datetime



application = Flask(__name__)
CORS(application)



@application.route('/')
def index():
    return 'Happy to see this running!'



  

 
@application.route('/getresponse', methods=['POST','OPTIONS'])
@cross_origin() 
def getresponse():
       
    desc = request.get_json(force=True)
    
    val = desc['val']
    
    
   
    #print val,flag_s
    #print type(val),type(flag)
    try:
        ans = getAIMLresponse(val)
    except:
        ans = "no answer found"

    return json.dumps({'answer': ans})
     


if __name__ == '__main__':
    
    #application.debug=True
    application.run('0.0.0.0')
    #application.run(host = '0.0.0.0',port = 8099)
   


