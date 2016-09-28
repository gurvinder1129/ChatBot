import pickle
import json
#import pyorient
import ConfigParser
import requests
import os,sys
#from LoggingModule import *
import pandas as pd
import re, collections
import sys

from random import randint
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
               
        response = requests.post('127.0.0.1:8080/AIMLpro/rest/check/post', data=json.dumps(data), headers=headers)             
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


def elastic(val,size):
      try:
        print "val reach"
        userInput = str(val[0])
        
        strurl = "http://localhost:9200/hack1/_search?q=keyword:"+str(userInput)+" AND cat:1&fields=data&from="+str(size)+"&size=1"
               
        response = requests.get(strurl)   
        
        val = response.json()
        res = val.items()
        #print res 
        val = response.json()
        #print val
        try:
             elastic = val['hits']['hits']
             
             elastic1 = elastic[0]
             elastic2 = str(elastic1)
             elastic3 = json.dumps(elastic2)  
             elastic4 = json.loads(elastic3)
#              elastic5 = elastic4.json()
             #elastic6 = elastic5['_score']
             #elastic2 = elastic[1:len(elastic1)-2]
             #elastic = elastic2.json()
            
        except : 
            
             elastic = "0"
      except:
           print "Cannot connect to service"
      
      print elastic2
      matchObj = re.match( r'(.*)data\'\: \[u\'(.*)\'\]', elastic2, re.M|re.I)
      if matchObj:
            print "matchObj.group(1) : ", matchObj.group(1)
            name = matchObj.group(2)
      dff = pd.DataFrame( columns=['mat','setval'])  
      dff.loc[0] = ["I have found this document where topics of your interest might be there " ," Is this what you were looking for ?"]
      dff.loc[1] = ["With the search requirements you have given, I would like to prefer this document " ," Is this document of any use?"]
      dff.loc[2] = ["I think you are looking for this document " ," Aren't you?"]
      dff.loc[3] = ["This document is most viewed by many members " ," I thinks you got your document, didn't you?"]
      i = randint(0,3)
      matchi =  str(dff.iloc[i]['mat'])
      setvi = str(dff.iloc[i]['setval'])
      strlink = "http://cebglobal.com/gdkfgkdg/fhdjsgfkg"
      ans = matchi+"\n"+"\""+name+"\"\n"+setvi      
      print "-sss"
#       print elastic5
      
      print "-------" 
      return ans


    
