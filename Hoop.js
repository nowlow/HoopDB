let fs = require('fs')
let HoopTable = require('./HoopTable')
let path = require('path')
let {encode, decode} = require('./HoopCode')

class Hoop {
    constructor(hoopDBPath) {
        this.openTables = []
        this.hoopDBPath = hoopDBPath
        this.token = null
        this.connected = false
        
        let _this = this

        this.connect = function(token) {
            return new Promise(function(resolve, reject) {
                if (_this.connected) reject('You are already logged-in')

                let name = _this.hoopDBPath.split('/')[_this.hoopDBPath.split('/').length - 1]
                let config = path.join(_this.hoopDBPath, '.' + name + '.hconfig')

                if (!fs.existsSync(_this.hoopDBPath))
                    reject("Database folder do not exists")
                while (name.length < token.length)
                    name += name
                fs.readFile(config, function(error, data) {
                    if (error) {
                        let file = JSON.stringify({"hoopDBName" : name})
                        fs.writeFile(config, encode(file, token), function(error) {
                            if (error) reject("Can't create config file")
                            else {
                                _this.connected = true
                                _this.token = token
                                resolve(true)
                            }
                        })
                    } else {
                        try {
                            if (JSON.parse(decode(data, token)).hoopDBName === name) {
                                _this.connected = true
                                _this.token = token
                                resolve(true)
                            } else reject("Can't connect to database")
                        } catch (e) {
                            reject("Can't connect to database")
                        }
                    }
                })
            })
        }

        this.closeTable = function(table) {
            table.close(true)
            this.openTables = this.openTables.filter(function(value) {
                return value != table
            })
        }

        this.close = function() {
            this.openTables.forEach(table => { table.close(true) })
        }

        this.listTables = function() {
            
            return new Promise(function(resolve, reject) {
                if (!_this.connected) reject('You are not logged-in')

                fs.readdir(_this.hoopDBPath, function(err, files) {
                    if (err) reject(err)
                    else {
                        let names = []
                        files.forEach(file => {
                            let sp = file.split('.')

                            if (sp.length >= 2 && sp[sp.length - 1] === 'htable') {
                                sp.pop()
                                names.push(sp.join('.'))
                            }
                        })
                        resolve(names)
                    }
                })
            })
        }

        this.getTable = function(name) {
            return new Promise(function(resolve, reject) {
                if (!_this.token || !_this.connected) reject('You are not logged-in')

                let usertable = null

                _this.openTables.forEach(table => {
                    if (table.name === name) resolve(table)
                })

                usertable = new HoopTable(name, hoopDBPath, _this.token)

                usertable.on('loaded', function() {
                    _this.openTables.push(usertable)
                    resolve(usertable)
                })

                usertable.on('load-error', function(err) {
                    reject(err)
                })
            })
        }

        this.deleteTable = function(name) {
            if (!this.connected) return false

            try {
                fs.unlinkSync(path.join(_this.hoopDBPath, name) + '.htable')
                this.openTables.filter(function(table) {
                    return table.checkname !== name
                })
                return true
            } catch(e) {
                return false
            }
        }
    }
}

module.exports = Hoop