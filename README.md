# Alexa-USC-Library-Booking

Almost, everyone in USC books a library room either for discussion or for a meeting. The problem with this is that every one has to go through the website and go through the time consuming process of finding one room and booking the room. It is very tiresome to go through all the steps to find just a room.

http://libcal.usc.edu/


Just say Alexa, 
    Ask USC library to find a room today at 2pm!, It tells you of the room is available or not
    Ask USC libarty to find room tomorrow between 2pm and 5pm, It tells you the available room in the given period.
    AsK USC library to find room on 27 Feb around 3pm, Yes it can find you on specific dates
    Ask USC library to book the room, It will do the booking and confirm the details

It is an interactive system which prompts you for specific details if you miss any. 

How we Built -
It interacts with USC library Booking System. But, USC library booking do not have API. So, we tweeked how the systems works, adjusted the HTTP headers and Send normal HTTP request which gives a Web Page. The webpage will be scraped using beautifulsoup to get the specific details and set to Alexa.

It is built in 24 hours at Trojan Hackathon and Won the Second Prize

https://devpost.com/software/usc-smart-room-booking


![alt text](https://scontent-lax3-1.xx.fbcdn.net/v/t31.0-8/21950015_1534377643289770_2733092695998851783_o.jpg?oh=295f0a5c73d384c9d8c4c51a51ac6eb6&oe=5A6808F8)
