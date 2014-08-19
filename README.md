# Feeback Presentation App 

# About

The purpose of this project is to visualize feedback data gathered from customers. The actual data is stored in google docs and queried via proxy server.

# Development

Requirements:

 * [Node and npm](http://nodejs.org/)
 * [Bower](http://bower.io)

## Setting up


```bash
$ git clone https://github.com/futurice-oss/feedback-presentation-app.git 
#...
$ npm install
$ bower install
```

To run the proxy server you need to type `node web.js`.
This will start the server at [localhost:8001](http://localhost:8001).

To store data we have used google sheets and a google script to access the data and serve it via JSON interface. An example sheet and script file are included in the repository. Run the app on your google drive with similiar sheet layout, correct sheet id and password configured in the web.js server script file.

# License

[BSD 3-Clause](LICENSE.txt)
