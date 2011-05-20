# node-boilerplate
      
  Structure for your [node.js](http://nodejs.org) project.

## Installation (contributor)

    mkdir mynewproject
    cd mynewproject
    git clone git@github.com:Skookum/node-boilerplate.git .
    git checkout -b mynewproject
    ./setup
    sudo node server.js
  
## Installation (user)

    mkdir mynewproject
    cd mynewproject
    git clone https://github.com/skookum/node-boilerplate.git .
    git checkout -b mynewproject
    ./setup
    sudo node server.js

## Adding libraries

  Add to 'dependencies' in /package.json, then:
  
    sudo npm bundle
    
## Included modules:

  - Express
  - Jade
  - Stylus
  - Connect-Timeout
  - Cluster
  - Express-Messages
  