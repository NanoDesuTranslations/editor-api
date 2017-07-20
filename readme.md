<!--to use add db/auth.json

```
{
  "token1":{"view":[], "edit":[], "admin":true},
  "token2":{"view":[1,2], "edit":[1], "admin":false}
}
```

config/local.hjson

```
uri: mongodb://user:pass@host:port
static-path: ../generator/build //served at /test
build:{
  type:exec
  cmd: node
  cwd: ../generator
  args:[
    build.js
  ]
}
```

Gonna just comment this out for now
-->
# Dev setup

### Inital Requirements
```
mongodb
nodejs
```

Go install MongoDB here's instructions for [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/), [Mac](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/), [Linux](https://docs.mongodb.com/manual/administration/install-on-linux/)

**Remember to actually run the database**

After we install MongoDB you need to find the shell client for it, in the MongoDB CLI run this (Set your username to whatever you want (This can all be changed later so don't worry about it too much))


```js
db.users.insert({
   "perms" : {
       "view" : [],
       "edit" : [],
       "admin" : true
   },
   "username" : "",
   "password_hash" : "$2a$10$c8YDERjm7tbEdQNwxJyVc.G66DLnFBOXcaqrwtXr3mpYqE1WTQS9m",
   "notes" : "password is test"
})
```

After this we want to check that it's all in correctly, so we run this in the MongoDB CLI

`db.users.find()`

This should return something like

```js
{
    "_id": ObjectId("596eb00ccae79e4538e87ad6"),
    "perms": {
          "view" : [ ],
          "edit" : [ ],
          "admin" : true 
    },
    "username" : "Your username",
    "password_hash": "$2a$10$c8YDERjm7tbEdQNwxJyVc.G66DLnFBOXcaqrwtXr3mpYqE1WTQS9m",
    "notes" : "password is test"
}
```

Now we know all of this we can actually get into setting up our API

First off we need to copy our default.hjson so we actually have some settings to use

Run this in your terminal (assuming you're in /config)

`cp default.hjson local.hjson`

So open the file and change all the relevant data (make sure to change the secret!)

After changing all this go to /editor-api (the root of the project) and run this in your command line

`node main.js`

Simple right? Well, it is with docs anyways!