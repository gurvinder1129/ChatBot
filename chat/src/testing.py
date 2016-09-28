
# coding: utf-8

# In[5]:

import pandas as pd
import re, math
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

WORD = re.compile(r'\w+')
positive = ["yes","yeah","thank you","thanks"]
negative = ["no","not","not sure","more"]

dff = pd.DataFrame( columns=['match','setval'])

def setdff(mat,setv,ind):
    print "added "+mat
    dff.loc[ind] = [mat ,setv]

def getdff1(ind):
    return dff.iloc[ind]['match']
def getlendff():
    return len(dff)
def settoki(tok):
    toki=tok
def gettoki():
    return toki
def getdfftolist():
    return dff.setval.tolist()

def get_cosine(vec1, vec2):
     intersection = set(vec1.keys()) & set(vec2.keys())
     numerator = sum([vec1[x] * vec2[x] for x in intersection])

     sum1 = sum([vec1[x]**2 for x in vec1.keys()])
     sum2 = sum([vec2[x]**2 for x in vec2.keys()])
     denominator = math.sqrt(sum1) * math.sqrt(sum2)
     #print 'numerator',numerator
     #print 'dinominator',denominator
     if not denominator:
        return 0.0
     else:
        return float(numerator) / denominator

    
def text_to_vector(text):
     words = WORD.findall(text)
     return Counter(words)


def ispositive(val):
    flaggy = '0'
    for word1 in positive:
        if sensecosine(val,word1)>0.7:
            flaggy = 'pos';
            
    for word2 in negative:
        if sensecosine(val,word2)>0.7:
            flaggy = 'neg';
            
    return flaggy 


def sensecosine(word,word1):
    documents=(word,word1)

    tfidf_vectorizer=TfidfVectorizer(analyzer="char")
    tfidf_matrix=tfidf_vectorizer.fit_transform(documents)
    #print tfidf_matrix.shape

    cs=cosine_similarity(tfidf_matrix[0-1],tfidf_matrix)
    #print cs.min()
    return cs.min()
    


# In[6]:

def createnewstr1(val):    
    smalltok =["360","coaching","agile","payroll","policies","risk","evp","email","vendor","learning","charter","Webinar","juniper","templates","webinars","talent","hrbp","metrics","benefits","digital","kpi","sox","cloud","culture","Analytics","attrition","mentoring","PMO","change","video","ERP","budget","it","diversity","career","HRIS ","dashboard","SAP","retention","roadmap","values","feedback","mobility","turnover","reporting","m&a","interview","security","sourcing","ethics","maturity","HIPO","IDP","mobilizer","elearning","fraud","training","marketing","privacy","Cisco","HRIS","finance","goals","RFP","travel","ERM","IT ","merger","survey","quality","seagate","audit","tools","planning","Hiring","byod","process","INDUCTION","strategy","cargill","devops","Mergers","ignition","scorecard","CRM","playbook","tool","RACI","ITIL","trends","excel","influence","Mentor","cpe","wellness","sla","lean","promotion","SWOT","severance","intranet","research","template","shell","HR","policy","china","budgeting","checklist","a","9 box ","tax","mobile","Data","SAP ","pricing","GRC","policy ","treasury","9 box","loyalty","mentor ","Training ","brand","roi","lms","big data","benchmark","branding"]
    #print type(a)
    bigtok = ["conflict","interest","performance","management","competencies","onboarding","Interview","guide","cybersecurity","career","pathing","strategy","page","CEB","IGNITION","competency","business","continuity","Job","descriptions","leadership","development","Innovation","performance","improvement","plan","recruiting","chief","staff","innovation","capability","outsourcing","root","cause","analysis","recognition","customer","experience","vendor","management","integration","collaboration","technology","e-learning","millenials","exit","interview","recruitment","Data","Analytics","root","cause","customer","service","benchmarking","hr","business","partner","career","path","new","hire","survey","career","development","Learning","and","Development","span","control","employee","value","proposition","Data","Governance","disaster","recovery"]
    line = val
    tokens = line.split()
    present1 = []
    present2 = []
    #print present
    #print b
    df = pd.DataFrame( columns=['A','B'])
    for word in tokens:
        if filter(lambda x: word in x, smalltok):
            smalltokfound1= filter(lambda x: word in x, smalltok)
            #print "this"
            #print smalltokfound1
            st1 = smalltokfound1.pop()
            if word==st1:
                present1.insert(0,st1)
                break;
                #print present1
                #here we add the actual token with the score
        else:
            for word1 in bigtok:
                
                vector1 = text_to_vector(word)
                vector2 = text_to_vector(word1)
                cosine = sensecosine(word, word1)
                if cosine>0.8:
                    present2.append(word1)
                    
                
            #bigtokfound1 = filter(lambda x: word in x, bigtok)
            #st2 = bigtokfound1.pop()
            #if word==st2:
                #present2.append(st2)

                #print present2


            #print "not in small tok"
    newstr = ""
    for word in present2:
        newstr = newstr+" "+word

    for word in present1:
        newstr = newstr+" "+word
    #print newstr
    return newstr




def getsearchtokens(val):    
    j=0
    newstr = createnewstr1(val)
    df = pd.read_csv("data/classifyTokens.csv",
                sep=",", names=["search","matchword"],
                skiprows=1)
    df2 = pd.DataFrame( columns=['search','matchword'])
    try:    
        for i in range(0, len(df)):
            sdata = df.iloc[i]['search']

            smatch = df.iloc[i]['matchword']
            #sdata = 'performance management'
            vector1 = text_to_vector(newstr)
            vector2 = text_to_vector(sdata)
            #print 'vector1',vector1
            cosine = get_cosine(vector1, vector2)
            #print newstr
            #print type(cosine)
            cos = int(cosine)
            #print type(cos)
            #print cos
            if cosine>0.8:
                df2.loc[j] = [sdata ,smatch]
                j=j+1
        matchw = ""
        for i in range(0, len(df2)):
            #print df2.iloc[i]['search'],"    ", df2.iloc[i]['matchword']
            matchw= str(df2.iloc[i]['matchword'])
            matchw1 = matchw.split(",")
            print matchw1
            break;
        return matchw1
    except:
        return []








