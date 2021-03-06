const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
let {encode, decode} = require('./HoopCode')

class HoopTable extends EventEmitter {
    constructor(name, filepath, token) {
        super()

        this.name = name
        this.path = path.join(filepath, name + '.htable')
        while (name.length < token.length)
            name += name
        this.checkname = name
        this.data = null
        this.token = token

        let _this = this

        fs.readFile(this.path, function(err, data) {
            if (err) {
                data = encode(JSON.stringify({HoopTableName: _this.checkname, table:[]}), _this.token)
                fs.writeFile(_this.path, data, function(err) {
                    if (err) {
                        _this.emit('load-error', err)
                    }
                })
            }
            data = decode(data, _this.token)

            try {
                _this.data = JSON.parse(data)
                if (!_this.data.HoopTableName || _this.data.HoopTableName != _this.checkname)
                    _this.emit('load-error', '[htable:' + _this.filename + '] wrong token : no name')
                else
                    _this.emit('loaded')
            } catch(e) {
                _this.emit('load-error', '[htable:' + _this.filename + '] wrong token : can\'t parse')
            }
        })

        this.getData = function() {
            return this.data.table
        }

        this.addLinePrimary = function(contentObject, primaryKeys=null) {
            let criteria = {}

            if (primaryKeys === null)
                criteria = contentObject
            else {
                primaryKeys.forEach(key => {
                    criteria[key] = contentObject[key]
                })
            }

            if (this.selectOnce(criteria))
                return
            this.data.table.push(contentObject)
        }

        this.addLine = function (contentObject) {
            this.data.table.push(contentObject)
        }

        this.updateLines = function(contentObject, criteria) {
            let selected = this.select(criteria)

            selected.forEach(line => {
                Object.assign(line, contentObject)
            })
        }

        this.updateLineOnce = function(contentObject, criteria) {
            let selected = this.selectOnce(criteria)

            if (selected) {
                Object.assign(selected, contentObject)
            }
        }

        this.replaceLine = function(contentObject, criteria) {
            this.data.table = this.selectNot(criteria)
            this.addLine(contentObject)
        }

        this.delete = function(criteria) {
            this.data.table = this.selectNot(criteria)
        }

        this.select = function(criteria) {
            let selection = this.data.table

            let criteria_table = Object.keys(criteria)

            criteria_table.forEach(element => {
                selection = selection.filter(function(value) {
                    return value[element] === criteria[element]
                })
            })
            return selection
        }

        this.selectOnce = function(criteria) {
            let selection = this.data.table

            let criteria_table = Object.keys(criteria)

            criteria_table.forEach(element => {
                selection = selection.filter(function(value) {
                    return value[element] === criteria[element]
                })
            })
            return (selection[0]) ? selection[0] : null
        }

        this.selectNot = function(criteria) {
            let selection = this.data.table

            let criteria_table = Object.keys(criteria)

            criteria_table.forEach(element => {
                selection = selection.filter(function(value) {
                    return value[element] !== criteria[element]
                })
            })
            return selection
        }

        this.close = function(save=true) {
            if (save) {
                fs.writeFile(this.path, encode(JSON.stringify(this.data), this.token), function(err) {
                    if (err)
                        console.error(err)
                })
            }
        }

        this.truncate = function() {
            this.data.table = []
            let data = encode(this.data.toString(), this.token)

            fs.writeFile(_this.path, data, function(err) {
                if (err) {
                    _this.emit('load-error', err)
                }
            })
        }
    }
}

module.exports = HoopTable