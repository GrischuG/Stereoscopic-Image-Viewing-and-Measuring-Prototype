# Stereoscopic Image Viewing and Measuring Prototype

This program allows to view stereoscopic 360° footage in a Three.js VR environment running on a simple webserver. The user then has the ability to measure objects in the perceived 3D space by placing two cubes and moving them around according to her or his intuition of the 3D space. Our proposed measuring method is not based on mathematical calulations.

# Prerequisites

For this prototype to run as intended, the user must have the following:
* A VR capable headset with the possibility to access a browser (We have used the Meta Quest Pro).
* Node.js to run the webserver.
* Ngrok is recommended to use the prototype without the need for a direct link to the machine running the webserver.

Ngrok provides an easy to use solution to forward a port to a web-accessible link. It is required to have an Ngrok account to use this feature. For further information visit ![Setup & Installation on ngrok.com](https://dashboard.ngrok.com/get-started/setup).

The image directory is `./static/testImages`, however, this can be specified in the code in `initiator.ts` on line 99 & 100. The stereoscopic format used for this program is 'Right Eye on Top'. We have only tested the .jpg image coding format. One test image is included with people and other potentially sensitive information blurred.

Other dependencies are automatically installed upon running the installation procedure.

# Installation

1. `npm install` -> if you get errors in the next step run npm install again
2. `npm run start` -> this will start the webpack server on localhost port 8080
3. run a server with https. For example, ngrok: https://ngrok.com/ -> after registration locate your ngrok exe file and run `./ngrok http 8080 --host-header="localhost:8080" `. A link will be provided in the terminal with which the website can be accessed from the web.

# Use

When connected to the website via a VR headset, the user should be able to see a 'Enter VR' button on the bottom. Pressing this button starts a VR session with the specified image. The user should now see the image in 3D.

## Controls
Is is recommended to use regular controllers to interact with the VR environment. Altough hand tracking is supported (tested with the Meta Quest Pro), this use case does not suited itself well for this type of control.

To start measuring in the 3D space, two boxes have to be created by pressing any button on the controllers (if not otherwise reserved by the system). The two boxes should be visible at each controller's loaction at creation. 

In order to move a box, the user must point towards it with the controller and press any button. The boxes change color according to whether the user is pointing at them or whether a box is picked up. To move a box, the user must keep the button pressed. To place a box at its current location, the user has to release the pressed button.

The distance between the boxes is shown above one of the two. This distance displayed is already in meters.
