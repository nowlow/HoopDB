const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')

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
                data = _this.encode(JSON.stringify({HoopTableName: _this.checkname, table:[]}), _this.token)
                fs.writeFile(_this.path, data, function(err) {
                    if (err) {
                        _this.emit('load-error', err)
                    }
                })
            }
            data = _this.decode(data, _this.token)

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

        this.updateLine = function(contentObject, criteria) {
            let selected = this.selectOnce(criteria)

            let source = {...selected}

            if (selected) {
                selected = Object.assign(selected, contentObject)
                this.replaceLine(selected, source)
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
                fs.writeFile(this.path, this.encode(JSON.stringify(this.data), this.token), function(err) {
                    if (err)
                        console.error(err)
                })
            }
        }

        this.truncate = function() {
            this.data.table = []
            let data = this.encode(this.data.toString(), this.token)

            fs.writeFile(_this.path, data, function(err) {
                if (err) {
                    _this.emit('load-error', err)
                }
            })
        }

        this.encode = function(str, token) {
            let output = Buffer.alloc(str.length)
        
            for (let i = 0; i < str.length; i ++) 
                output[i] = str.charCodeAt(i) + token.charCodeAt(i % token.length)
            return output
        }

        this.decode = function(buffer, token) {
            let output = ''
        
            for (let i = 0; i < buffer.length; i ++)
                output += String.fromCharCode(buffer[i] - token.charCodeAt(i % token.length))
            return output
        }
    }
}

module.exports = HoopTable