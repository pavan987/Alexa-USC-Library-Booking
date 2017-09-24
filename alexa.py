import json
from bs4 import BeautifulSoup

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
    print time
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
        json_obj['response'] = {'sid' : result['sid'], 'room' : result['room'], 'floor' : result['floor'], 'start': result['start'], 'end': result['end']}
        return json.dumps(json_obj)
    else:
        json_obj['status'] = False
        json_obj['response'] = {}
        return json.dumps(json_obj)

def getRangeResult(data, start, end):
    j = parseHTML(data)
    full_d = json.loads(j)
    flag = False
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
            print "From ",i," to ",i+1," in ",room_timings[i][0]
            flag = True
            break
        if flag:
            return
        else:
            print "No rooms"
            return
    for i in range(start, end-1):
        fin_result = list(set(room_timings[i]) & set(room_timings[i+1]))
        if len(fin_result) != 0:
            print "from ",i," to ",i+2," in room ", fin_result[0]
            return
        else:
            # no consecutive time slots in a room.
            r1 = None
            r2 = None
            for i in room_timings:
                if r1 == None and len(room_timings[i]) != 0:
                    r1 = "from ",i," to ",i+1," in room ", room_timings[i][0]
                elif r2 == None and len(room_timings[i]) != 0:
                    r2 = "from ",i," to ",i+1," in room ", room_timings[i][0]
                if r1 != None and r2 != None:
                    print r1, " ", r2
                    return
    print "No room for you"
    return    
    
    

f = open('input.txt','r')
lines = f.readlines()
data = ""
for line in lines:
    data = data + line
start = raw_input("enter the start time in 24hrs:\n")
end = raw_input("Enter the end time:\n")
getRangeResult(data, start, end)
# print getResult(data,time)