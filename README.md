# Stereoscopic Image Viewing and Measuring Prototype

This program allows to view stereoscopic footage in a VR environment running on a simple webserver. The user then has the ability to measure objects in the perceived 3D space by placing two cubes and moving them around according to her or his the intuition of the 3D space. Our proposed measuring method is not based on mathematical calulations.

# Prerequisites

For this prototype to run as intended, the user must have the following:
* A VR capable headset with the possibility to access a browser.
* Node.js to run the webserver.
* Ngrok is recommended to use the prototype without the need for a direct link to the machine running the webserver.

Ngrok provides an easy to use solution to forward a port to a web-accessible link. It is required to have an Ngrok account to use this feature. For further information visit ![Setup & Installation on ngrok.com](https://dashboard.ngrok.com/get-started/setup).

Other dependencies are automatically installed upon running the installation procedure.

# Installation

In the main project directory:
1. `npm install` -> if you get errors in the next step run npm install again
2. `npm run start` -> this will start the webpack server on localhost port 8080

Then:
3. run a server with https. For example, ngrok: https://ngrok.com/ -> after registration locate your ngrok exe file and run `./ngrok http 8080 --host-header="localhost:8080" `. A link will be provided in the terminal with which the website can be accessed from the web.

# Use
