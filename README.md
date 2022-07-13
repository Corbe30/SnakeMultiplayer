# SnakeMultiplayer
Traditional snake game with following features:
1. Choose color of your snake.
2. Score counter.
3. Multiplayer - Create and share room code to play with friend.
4. Replay button after game ends.

## Technologies used
socket.io, Canvas, hosted using Netlify for Frontend and Heroku for backend. <br>
https://monumental-moonbeam-9fe109.netlify.app/

Note: game may be slow because of slow response time by Heroku servers in EU. I do have the same server hosted in AWS EC2 (Mumbai, ap-south-1) but due to lack of SSL, I faced Mixed Content error. Locally, the game ran smoothly with the AWS server.
