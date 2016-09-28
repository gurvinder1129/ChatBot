
import json
#from flask_cors import CORS, cross_origin
from flask_cors import CORS, cross_origin
from flask import Flask, jsonify, request,session
from classifier import *
from testing import *
from random import randint
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
    
    val = desc['message']
    flag = desc['flag']
    feedback = desc['feedback']
    intro = desc['intro']
    
    if not intro =="intro over":
        toki = int(intro)
        ln = getlendff()-1
        if toki<ln:
            match1 = getdff1(toki)
            setdff(match1,val,toki)
            toki=toki+1
            print "toki ",toki
            #settoki(toki)
            match2 = getdff1(toki)
            lst = ["I want to know about ","please can you give me information regarding ","help me by giving me some info about ","hi dear, I want some info about "]
            i = randint(0,3)
            ans = str(lst[i])+str(match2)
            intro = str(toki)
            #if toki==len(dff):
               # match2 = dff.iloc[toki]['match']
               # ans = "would you like to give me more information on ",match2
               # intro = "introa"
            #else:
                #match2 = dff.iloc[toki]['match']
                #ans = "would you like to give me more information on ",match2
                #intro="introa"
                
        elif toki==ln:
            flag = '1'
            match1 = getdff1(toki)
            setdff(match1,val,toki)
            intro = "intro over"
            ans1 = getdfftolist()
            ans = elastic(ans1,'1')
            
        
    elif flag == '0':
        matchObj = re.match( r'name_(.*),role_(.*)', val, re.M|re.I)
        if matchObj:
            print "matchObj.group(1) : ", matchObj.group(1)
            name = matchObj.group(1)
            print "matchObj.group(2) : ", matchObj.group(2)
            role = matchObj.group(2)
            setrole(role)
            ans = "Hi "+matchObj.group(1)+", How may I help you?"
            #return json.dumps({'answer': ans})
        else:
            print "val  ",val
            main_tokens = getsearchtokens(val)
            print "main tokens",main_tokens
            print "val  ",val
            if len(main_tokens)!=0:
                
                toki= 0;
                dff = pd.DataFrame( columns=['match','setval'])
                
                initialset = ''
                j=0
                for word1 in main_tokens:
                    setdff(word1,word1,j)
                    j=j+1
                toki=1;
                match1 = getdff1(toki)
                #setdff(dff)
                intro = "1"
                lst = ["I want to know about ","please can you give me information regarding ","help me by giving me some info about ","hi dear, I want some info about "]
                i = randint(0,3)
                ans = str(lst[i])+str(match1)
                print "reached maintokens"
                #return json.dumps({'answer':ans,'flag':flag,'feedback':feedback,"intro":intro})
                     
            
                
                
                
                    
                #print "query here"
                #if intro=="intro over":
                 #   flag='1'
                #ans=main_tokens
            else:
                try:
                    ans = getAIMLresponse(val)
                except:
                    ans = "Sorry I am AI , I am not well today"
    
    elif flag == '1':
        if ispositive(val)=="pos":
            flag = '0'
            ans = " Can I help you with any other things.. "
        else:
            feedback = "interested"
            flag = '2'
            ans1 = getdfftolist()
            ans = elastic(ans1,'3')
            
    elif flag == '2':
        if ispositive(val)=="pos":
            flag = '0'
            ans = " I am here to help you .. How can I help you?"
        else:
            feedback = "interested"
            flag = '3'
            ans1 = getdfftolist()
            ans = elastic(ans1,'5')
            
    elif flag == '3':
        if ispositive(val)=="pos":
            flag = '0'
            ans = " Hi dear , Let me know what are you looking for"
        else:
            feedback = "not interested"
            flag = '0'
            
            
            ans = "Please do look into this link for more data.... https://www.cebglobal.com/member/it-midsized/search.html"            
            
    else:
        print "are you outta mind"
        ans = "exception"
        
    
    
    return json.dumps({'answer':ans,'flag':flag,'feedback':feedback,'intro':intro})
     


if __name__ == '__main__':
    
    #application.debug=True
    application.run('0.0.0.0')
    #application.run(host = '0.0.0.0',port = 8099)
   


