Bootstrap Components
--------------------

A proxy for serving [Twitter Bootstrap](http://twitter.github.com/bootstrap) files as components.

It serves a `component.json` file and the related files using a Github style end-point as per the [Components Spec](https://github.com/component/component/wiki/Spec).

**Note** The server is currently set-up to serve files from the `3.0.0-wip` branch.

Usage
-----

Install dependencies

```
$ npm install
```

Start server

```
$ node index
```

Add remote server and dependencies to your `component.json` file

```json
{
    "name": "my-component",
    "remote": [
        "http://bootstrap-components.herokuapp.com"
    ],
    "dependencies": {
        "bootstrap-components/dropdowns": "*"
    }
}

```

Authors
-------

**Jeremy Worboys** https://github.com/jeremyworboys

License
-------

Copyright 2013 Jeremy Worboys

Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
