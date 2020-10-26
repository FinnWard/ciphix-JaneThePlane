# Ciphix' Conversational Automation Air Case

Welcome to the CA Air-case!

This boilerplate project will help you out with the basic configurations of your fulfillment server. But before we're able to use it, we'll have to make sure we have the rights environments and dependencies installed on our machine.

Clone this repository by running '`$ git clone https://github.com/kaspardohrin/ciphix-ca-case.git`' in a terminal of choice.


## Installation

It's adviced to use Visual Studio Code to create the CA Air-case as it's the default IDE used at Ciphix. You can download VSC here: https://code.visualstudio.com/download

I'd also highly recommend using Ubuntu or Git Bash as your default terminal. To change the default build-in terminal used by VSC, hit '`Ctrl + P`' or '`⌘ + P`' and type '`> Select Default Shell`' and choose '`Git Bash`'. To open a new terminal in VSC simply go to '`Terminal`' in the top left and select '`New Terminal`'.

This project is build with Node.js and Typescript, so let's go ahead and install the following:

- Node.js: https://nodejs.org/en/download/ or update to the latest version by running:\
    `$ npm install -g npm@latest`
- Add Yarn or upgrade to latest to NPM by running:\
    `$ npm i -g yarn@latest`
- Add or upgrade to latest version of TypeScript to NPM by running:\
    `$ npm i -g typescript@latest`

To check if the installations were successful you can run the following commands:
```bash
$ node -v  # v13.13.3
$ npm -v   # 6.14.4
$ yarn -v  # 1.22.10
$ tsc -v   # Version 4.0.3
```

Now that you can access node, npm, yarn and tsc in your terminal we're ready to navigate to the root-folder of this project (`./ciphix-ca-case/`) and start installing our environment.

- Add node_modules to your project by installing the dependencies in package.json by running:\
    `$ yarn install`

- Open the package.json file, and note the lines under the scripts -tag. These are some handy shortcuts to make starting up our server less of a hassle:
```conf
"scripts": {
    "build": "tsc -b",                   # command to compile our typescript to javascript
    "watch": "tsc -w",                   # same as build, but recompiles after any changes in our code base
    "start": "node ./dist/app.js",       # command to start and forward our app.js -file to localhost 
    "nodemon": "nodemon ./dist/app.js",  # same as start but restarts the node-server after any changes in our code base
    "tunnel": "ngrok http 8080"          # command to forward our localhost to an url to temporarily access our app.js via the web
},
```

We'll need three of these commands each in their seperate terminal to access our app.ts file via dialogflow.
- Go ahead and open three terminals in the root directory of this project (`./ciphix-ca-case/`) and enter each of the following three in their own terminal:\
    `$ yarn watch`\
    `$ yarn nodemon`\
    `$ yarn tunnel`

## Development
If you've successfully setup your project as descibed above, you're ready to start creating your project. To test if all you've done so far has been successful you'll have to try and get a response from your code-base within the Dialogflow Console:
- Make sure you copy the **https** -URL from the terminal forwarding your localhost connection to the web (`$ yarn tunnel`) and paste this URL under Fulfillment > Webhook > URL* (Make sure to enable the toggle next to Webhook) in your own Dialogflow project at: https://dialogflow.cloud.google.com/
- Make sure you have this option enabled in your Dialogflow Project at the bottom of each intent: *Enable Webhook call for this intent* under *Fulfillment*

To debug your application you can use the three terminals in the following ways:
- The terminal which is compiling our TypeScript to JavaScript (`$ yarn watch`) will output debugging info about syntax errors in our code-base
- The terminal which is forwarding our app.js -file to localhost (`$ yarn nodemon`) will output debugging info like '`console.log()`' we define in our code-base
- The terminal which is forwarding our localhost to the web (`$ yarn tunnel`) will output debugging info about incomming requests, i.e., `200 OK` or `500 ERROR` when attempting to communicate with Dialogflow

### Tips & Tricks
- Dialogflow has default entities, called system entities. These entities cover a wide variety of entities like: Countries, Cities, Airports and Date-time.
- You can enable/disable the toggle: '`required`' for each entity to have Dialogflow force the user to provide a missing parameter before continuing.
- You can handle the way required parameters are extracted/verified via your code-base by enabling: *Enable Webhook call for slot filling* under *Fulfillment*
- The '`conv`' parameter incomming through your app's request and passed through with your app's response holds all the info about the current user and the context of the conversation. The method, as used in the default welcome and default fallback intents in your code-base, '`conv.add()`', literally modifies and adds a string to your '`conv`' object. Which is later intepreted by your Dialogflow Agent. This '`conv`' object also contains other information about the conversation, like: contexts, parameters extraced, current intent matched by your Dialogflow Agent, and so forth.
- Parameters of the current intent can be read or used in your fulfillment by calling the '`conv.parameters.<entity-name>`' -method.