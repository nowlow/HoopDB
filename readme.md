<p align="center">
    <img src=".github/logo_white.png" width=300 />
</p>

# HoopDB

HoopDB is a NoSQL database model made in node with no dependencies

Full documentation can be found [here](http://naoufel.space/hoop)

## Getting started
```
$ mkdir my_awesome_project && cd my_awesome_project
$ mkdir db
$ npm install hoopdb
```

if you want to use it in other languages or maybe use an API: one is avaliable [here](http://github.com/nowlow/HoopDB-API)

Create a `.js` file for exemple `index.js`

###### index.js
```javascript
const Hoop = require('hoopdb')
const path = require('path')

let db = new Hoop(path.join(__dirname, "db"))

async function main()
{
    await db.connect("token")
    let table = await db.getTable('hello')

    table.createLinePrimary({ name: "naoufel", email: "contact@naoufel.space", age: 19 })
    
    console.log(table.getData())
    
    table.updateLines({ name: "naoufel"}, { age: 20 })
    
    console.log(table.getData())
}

main()
.catch(error => console.error(error))
.finally(() => { db.close() })
```

## Notes
This project has been made in 4 hours (if we take out launch time and writing this readme).<br>
It may be obvious but don't use that database model in production.<br>
If there is any issue, notice me on the issue section, by mail at `contact@naoufel.space` or by discord `Nowlow#4428`.<br>

## Licence
[MIT](LICENSE)

<img src=".github/logo_black_nt.svg" width=30 />
