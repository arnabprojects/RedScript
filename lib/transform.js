/**
 * RedScript compiler
 * Copyright(c) 2013 Adam Brodzinski <adambrodzinski@gmail.com>
 * MIT Licensed
 */

/* Checks to see if keyword is used inside a string
 * @param  {string} match - keyword to match
 * @param  {string} ln    - line to match against
 * @return {bool}         - true if match is found
 */
function insideString(match, ln) {
    var regex = "['\"][\\w\\s]*[^\\w]" + match + "[^\\w][\\w\\s]*['\"]";
    var insideStr = new RegExp(regex, "g");
    return insideStr.test(ln);
}

Array.prototype.contains = function(str) {
    var i = this.length;
    while (i--) {
        if (this[i] === str) {
            return true;
        }
    }
    return false;
}

module.exports = {

    /* Transforms a `parent*` property to `__proto__`
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    parentProperty: function(line) {
        var regex = /\bparent\b\*/;
        return line.replace(regex, function() {
            return '__proto__';
        });
    },


    /* Transforms a RedScript object liters to a JS one.
     * Optionally an inherits keyword can be used to inherit from
     * another object.
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    objLiteral: function(line) {
        // $0 `object foo inherits bar`
        // $1 `foo`
        // $2 `bar`
        var regex = /object ([\$\w]+)(?: inherits ([\$\w]+))?/;
        return line.replace(regex, function($0, $1, $2) {
            if (insideString("object", line)) return $0;
            if ($1 && $2) {
                return 'var ' + $1 + ' = { __proto__: ' + $2 + ',';
            } else {
                return 'var ' + $1 + ' = {';
            }
        });
    },


    /* Inserts `var` keyword if it's not already there
     *
     * @param  {string} - accepts line as a string
     * @param  {array}  - an array to store declared vars
     * @return {string} - transformed line
     * @api public
     */
    insertVars: function(line, declared) {
        //  $0 - var foo = bar
        //  $1 - `var` or `.` or `@`
        //  $2 - `foo``
        var regexGlobal = /(\bvar\b\s*|\.|@)?([\w\$]+)\s*=(?!=)/g,
            regexSingle = /(\bvar\b\s*|\.|@)?([\w\$]+)\s*=(?!=)/,
            hasMultAssign = /(=\s*[\w\.]+\s*=)/;
        // if line has a mult assignment, only insert the first var
        var regex = (hasMultAssign.test(line)) ? regexSingle : regexGlobal;

        return line.replace(regex, function($0, $1, $2) {
            if ($1 || declared.contains($2)) {
                return $0;
            } else if ($2){
                declared.push($2);
                return 'var ' + $2 + ' =';
            } else {
                throw "can't find assignment";
            }
        });
    },


    /* Method_Description
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    classes: function(line) {
        // $0 - `class Bar < Foo`
        // $1 - `Bar`
        // $2 - `<`
        // $3 - `Foo`
        var regex = /\bclass\b\s+([\w\$]+)(?:\s*(<)\s*([\w\$]+))?/;
        return line.replace(regex, function($0, $1, $2, $3) {
            if ($1 && $2 && $3) {
                return 'var ' + $1 + ' = ' + $3 + '.extend({';
            } else if ($1) {
                return 'var '+ $1 +' = Class.extend({';
            }
        });
    },


    /* Method_Description
     *
     * @param  {string} - accepts line as a string
     * @return {string} - transformed line
     * @api public
     */
    boilerplate: function(line) {
        var regex = /foobar/;
        return line.replace(regex, function($0, $1) {

        });
    }
};
