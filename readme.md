to use add db/auth.json

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
