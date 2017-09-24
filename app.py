from flask import Flask
from flask import request
from flask import jsonify
import json
import datetime
import os
from bs4 import BeautifulSoup


app = Flask(__name__)

@app.route('/', methods=['GET'])
def index1():
    print "<html><body><h1>Dude please use post</h1></body></html>"


@app.route('/', methods=['POST'])
def index():
    print "Got a request"
    data = request.json['html']
    time = request.json['time']
    print "html"
    return getResult(data, time)


@app.route('/test',methods=['POST'])
def intent():
    data = request.json['html']
    start_time = request.json['start_time']
    end_time = request.json['end_time']
    print "Got a request", datetime.datetime.now().time()
    print "start:", request.json['start_time'], "end: ", request.json["end_time"]
    if end_time is None or end_time == "":
        return getResult(data, start_time)
    else:
        return getRangeResult(data, start_time, end_time)


    
def parseHTML(html_content):
    data = html_content
    soup = BeautifulSoup(data, "html.parser")
    rooms = list()
    for link in soup.find_all('a'):
        rooms.append((link.get('onclick'), link.get('id')))
    result = list()
    for roomie in rooms:
        room = roomie[0]
        flag = False
        temp_result = ""
        i = 0
        j = 0
        count = 0
        for i in xrange(len(room)):
            character = room[i]
            if character == "'":
                if flag:
                    if temp_result == "":
                        temp_result = room[j+1:i]
                    else:    
                        temp_result = temp_result +";"+ room[j+1:i]
                    count += 1
                    flag = False
                else:
                    j = i
                    flag = True
            if count == 2:
                break
        result.append((temp_result, roomie[1]))

    # "pace": "7:00am - 8:00am, Wednesday, September 27, 2017", "name": "2nd Floor-201A"
    json_obj = {}
    json_obj['results'] = list()
    for rr in result:
        r = rr[0]
        re = r.split(';')
        room = re[0]
        time = re[1][:re[1].index(',')]
        time = ''.join(time.split())
        start = time.split('-')[0]
        end = time.split('-')[1]
        flagstart = start[len(start)-2:]
        offset = 0
        # intstart = 0
        if flagstart == "pm":
            offset = 12
        
        intstart = int(start.split(":")[0])+offset
        if offset == 12 and intstart == 24:
            intstart = 12
        elif intstart == 12 and offset == 0:
            intstart = 0
        flagend = end[len(end)-2:]
        offset = 0
        # intstart = 0
        if flagend == "pm":
            offset = 12
        intend = int(end.split(":")[0])+offset
        if offset == 12 and intend == 24:
            intend = 12
        elif intend == 12 and offset == 0:
            intend = 0
        json_obj['results'].append({'room': room, "sid": rr[1], 'intstart': intstart, 'intend': intend, 'start': start, 'end': end})
   
    return json.dumps(json_obj)


def getResult(data, time):
    j = parseHTML(data)
    time = int(time.split(':')[0])
    full_d = json.loads(j)
    flag = False
    json_obj = {}
    # print full_d
    for d in full_d['results']:
        if d['intstart'] == time:
            result = d
            flag = True
            break
    if flag:
        # record found
        json_obj['status'] = True
        json_obj['slot1'] = {'sid' : result['sid'], 'room' : result['room'], 'start': result['start'], 'end': result['end']}
        json_obj['slot2'] = {}
        print json_obj
        return jsonify(json_obj)
    else:
        json_obj['status'] = False
        json_obj['slot1'] = {}
        json_obj['slot2'] = {}
        print json_obj
        return jsonify(json_obj)
        # return json.dumps(json_obj)

def getTime(t):
    if t is None:
        return ""
    if t < 12:
        return str(t)+":00am"
    elif t == 12:
        return "12:00pm"
    else:
        return str(t-12)+":00pm"

def getRangeResult(data, start, end):
    j = parseHTML(data)
    full_d = json.loads(j)
    flag = False
    json_obj = {}
    start = int(start.split(':')[0])
    end = int(end.split(':')[0])
    room_timings = dict()
    for i in range(start, end):
        room_timings[i] = list()
    json_obj = {}
    results = {}
    for d in full_d['results']:
        if d["intstart"] >= start and d["intend"] <=end:
            room_timings[d['intstart']].append(d['room'])
    if len(room_timings) == 1:
        flag = False
        for i in room_timings:
            if len(room_timings[i]) == 0:
                continue
            json_obj["status"] = True
            json_obj["slot1"] = {'intstart': i, "intend": (i+1), 'room':room_timings[i][0], 'start': getTime(i), 'end': getTime(i+1)}
            json_obj["slot2"] = {}
            flag = True
            break
        if flag:
            print json_obj
            return jsonify(json_obj)
        else:
            json_obj["status"] = False
            json_obj["slot1"] = {}
            json_obj["slot2"] = {}
            print json_obj
            return jsonify(json_obj)            
    for i in range(start, end-1):
        fin_result = list(set(room_timings[i]) & set(room_timings[i+1]))
        if len(fin_result) != 0:
            json_obj["status"] = True
            json_obj["slot1"] = {'intstart': i, "intend": (i+1), 'room':fin_result[0], 'start': getTime(i), 'end': getTime(i+1)}
            json_obj["slot2"] = {'intstart': (i+1), "intend": (i+2), 'room':fin_result[0], 'start': getTime(i+1), 'end': getTime(i+2)}
            print json_obj
            return jsonify(json_obj)
        else:
            # no consecutive time slots in a room.
            r1 = None
            r2 = None
            for i in room_timings:
                if r1 == None and len(room_timings[i]) != 0:
                    r1 = (i, i+1, room_timings[i][0])
                elif r2 == None and len(room_timings[i]) != 0:
                    r2 = (i, i+1, room_timings[i][0])
                    
                if r1 != None and r2 != None:
                    json_obj["status"] = True
                    json_obj["slot1"] = {'intstart': r1[0], "intend": r1[1], 'room':  r1[2], 'start': getTime(r1[0]), 'end': getTime(r1[1])}
                    json_obj["slot2"] = {'intstart': r2[0], "intend": r2[1], 'room':  r2[2], 'start': getTime(r2[0]), 'end': getTime(r2[1])}
                    print json_obj
                    return jsonify(json_obj)
    json_obj["status"] = False
    json_obj["slot1"] = {}
    json_obj["slot2"] = {}
    print json_obj
    return jsonify(json_obj)    
    
    


if __name__ == '__main__':
    app.run(host=os.getenv('IP', '0.0.0.0'),port=int(os.getenv('PORT', 8080)))
