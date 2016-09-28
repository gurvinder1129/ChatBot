import pickle
import json
#import pyorient
import ConfigParser
import requests
import os,sys
#from LoggingModule import *
import re, collections
import sys
reload(sys)
sys.setdefaultencoding("utf-8")



role = ""
def setrole(rol):
    role = rol



#Reading the values from the config file

try:
    print "here"
    configParser = ConfigParser.ConfigParser()
    print configParser
    configFilePath = (os.path.join(os.getcwd(),'config.ini'))
    print configFilePath
    configParser.read(configFilePath)
    print configParser.read(configFilePath)
    
    #ip_orientdb = configParser.get('orientdb', 'ip') 
    #orientdbport = int(configParser.get('orientdb', 'port')) 
    #username = configParser.get('orientdb', 'username') 
    #password = configParser.get('orientdb', 'password') 
    #dbname = configParser.get('orientdb', 'dbname') 

    ip_status = configParser.get('app_status', 'ip')
    #ip_app = configParser.get('ner', 'ip')
    contenttype = configParser.get('app_status', 'content-type')
    
    #ip_sim = configParser.get('similarity', 'ip')
    
    ip_aiml = configParser.get('aiml', 'ip')
    
    #logdir = configParser.get('server', 'logDir')
    #print "here again"
except:
       print "cannot read from config file"


       

def getAIMLresponse(val):
      try:
        print "val reach"
        userInput = val
       
        data = {'text':userInput}
        headers = {'content-type': 'application/json'}
        #response = requests.post(  ip_sim, data=json.dumps(data), headers=headers)       
               
        response = requests.post('10.70.214.239:8080/AIMLpro/rest/check/post', data=json.dumps(data), headers=headers)             
        val = response.json()
        res = val.items()
        #print res 
        val = response.json()
        #print val
        try:
             aiml_res = val['questions']
            
        except : 
            
             aiml_res = "0"
      except:
           print "Cannot connect to service"
    
   
      return(aiml_res)


def getElastic(val):
      try:
        print "val reach"
        userInput = val
       
        data = {'text':userInput}
        headers = {'content-type': 'application/json'}
        #response = requests.post(  ip_sim, data=json.dumps(data), headers=headers) 
        analytics="analytics"
        str = "http://localhost:9200/hack1/_search?source={from:0,size:10,\"query\":{\"bool\":{\"should\":[{\"match\":{\"role\":\""+role+"\"}},{\"match\":{\"data\":\""+analytics+"\"}}]}}}"
        #response = requests.post('http://localhost:8080/AImach/rest/check/post', data=json.dumps(data), headers=headers)
        response = requests.post('http://localhost:8080/AImach/rest/check/post')
        val = response.json()
        elastic = val['hits']['hits']['_source']['data']
        
        
        
      except:
           print "Cannot connect to service"
    
   
      return elastic
    
