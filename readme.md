<p align="center">
    <img src="https://naoufel.space/images/hoop/logo_white.png" width=300 />
</p>

# HoopDB

HoopDB is a NoSQL database model made in node with no dependencies

Complete documentation can be found [here](http://naoufel.space/hoop)

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
var path = require('path')
var hoopdb = require('hoopdb')

var db = new hoopdb(path.join(__dirname, 'db')) // path to your database

db.connect('token').then(() => { // This token will be used to encode a table when it's created and to decode one when it's loaded
    db.getTable('hello').then(table => { // Exemple get or create a table called 'hello'
        table.addLinePrimary({ // Adds a line once to your database, if this one exists, will do nothing
            name: "Naoufel Berrada",
            age: 18,
            mail: "contact@naoufel.space"
        })

        table.addLinePrimary({
            name: "Linus Torvalds",
            age: 49,
            mail: "linus@linux.org"
        })

        console.log('table data first time :\n', table.getData())

        table.updateLine({mail: "linus@naoufel.space"}, {name: "Linus Torvalds"}) // Updates mail at 'Linus Torvalds' line

        console.log('\ntable data second time :\n', table.getData()) // The data may have changed

        db.closeTable(table) // Save the table
    }, error => {
        console.error(error) // Print if there is an error when reading the table
    })
}, error => {
    console.log(error) // If you can't connect to the database
})
```

## Notes
This project has been made in 4 hours (if we take out launch time and writing this readme).<br>
It may be obvious but don't use that database model in production.<br>
If there is any issue, notice me on the issue section, by mail at `contact@naoufel.space` or by discord `Nowlow#4428`.<br>

## Licence
[MIT](LICENSE)

<img src="https://naoufel.space/images/hoop/logo_black_nt.svg" width=30 />
