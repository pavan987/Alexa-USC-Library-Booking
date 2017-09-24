import json
from bs4 import BeautifulSoup

def parseHTML(html_content):
    data = html_content
    soup = BeautifulSoup(data, "html.parser")
    rooms = list()
    for link in soup.find_all('a'):
        rooms.append(link.get('onclick'))
    result = list()
    for room in rooms:
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
        result.append(temp_result)

    # "pace": "7:00am - 8:00am, Wednesday, September 27, 2017", "name": "2nd Floor-201A"
    json_obj = {}
    json_obj['results'] = list()
    for r in result:
        re = r.split(';')
        floor = re[0].split('-')[0]
        room = re[0].split('-')[1]
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
        json_obj['results'].append({'room': room, 'floor': floor, 'intstart': intstart, 'intend': intend, 'start': start, 'end': end})
   
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
        json_obj['response'] = {'room' : result['room'], 'floor' : result['floor'], 'start': result['start'], 'end': result['end']}
        return json.dumps(json_obj)
    else:
        json_obj['status'] = False
        json_obj['response'] = {}
        return json.dumps(json_obj)


f = open('input.txt','r')
lines = f.readlines()
data = ""
for line in lines:
    data = data + line
time = raw_input("enter the time in 24hrs:\n")
print getResult(data,time)