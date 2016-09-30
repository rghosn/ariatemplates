/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Aria = require("../Aria");
var ariaUtilsType = require("./Type");
var ariaUtilsArray = require("./Array");


/**
 * Utilities for String manipulation
 */
module.exports = Aria.classDefinition({
    $classpath : "aria.utils.String",
    $singleton : true,
    $prototype : {
        /**
         * Substitute %n parameters in a string
         * @param {String} string The source string to substitute %n occurrences in
         * @param {Array|String} ...params All the remaining parameters, that can form from one simple string to deeply nested arrays of strings, will be resolved to a single list of strings. These strings will be used for the substitutions. Index 0 will replace %1, index 1, %2 and so on.
         * @return {String} The final string, with %n occurrences replaced with their equivalent
         */
        substitute : function (string) {
            var params = Array.prototype.slice.call(arguments, 1);
            params = ariaUtilsArray.flattenDeep(params);

            string = string.replace(/%[0-9]+/g, function (token) {
                var replacement = params[parseInt(token.substring(1), 10) - 1];
                return typeof replacement !== "undefined" ? replacement : token;
            });

            return string;
        },

        /**
         * Trim a String (remove trailing and leading white spaces)
         * @param {String} string If this argument is not a string, it is returned unmodified.
         * @return {String}
         */
        trim : function (string) {
            return typeof string === 'string' ? string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') : string;
        },

        /**
         * Return true if the character at index in str is escaped with backslashes.
         * @param {String} str
         * @param {Integer} index
         * @return {Boolean} true if the character is escaped, false otherwise
         */
        isEscaped : function (str, index) {
            var res = false;
            for (var i = index - 1; i >= 0; i--) {
                if (str.charAt(i) == "\\") {
                    res = !res;
                } else {
                    return res;
                }
            }
            return res;
        },

        /**
         * Find the next not escaped character findChar, after start in str.
         * @param {String} str
         * @param {String} findChar character to find in str
         * @param {Integer} start position in str (default value: 0)
         */
        indexOfNotEscaped : function (str, findChar, start) {
            var index = str.indexOf(findChar, start);
            while (index != -1) {
                if (!this.isEscaped(str, index)) {
                    return index;
                }
                // continue search after escaped character
                index = str.indexOf(findChar, index + 1);
            }
            return -1;
        },

        /**
         * Escape < and > and & in the given string
         * @param {String} str
         * @return {String}
         */
        escapeHTML : function (str) {
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },

        /**
         * Escape " and ' the given string.
         * @param {String} str
         * @return {String} the escaped string
         */
        escapeHTMLAttr : function (str) {
            return str.replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
        },

        /**
         * Escape the given string depending on the options. When no options is passed, the escaping is applied for all contexts.
         *
         * The string can be escaped for different contexts:
         * <ul>
         * <li>safe insertion inside an HTML text node</li>
         * <li>safe insertion inside an attribute value</li>
         * </ul>
         *
         *
         *
         * @param {String} str Input string
         *
         * @param options In its more comprehensive form, it is an object in which each property correspond to a context that can be set to a truthy value to activate escaping (a falsy value, thus including null and undefined, will disable it).
         * <pre>
         * {
         *     attr: true, // will escape the string for safe insertion inside the value of an attribute
         *     text: false // will NOT escape the string for safe insertion inside an HTML text node
         * }
         * </pre>
         *
         * There are however two shortcuts that can be used:
         * <ul>
         * <li>if nothing is passed, it is equivalent to passing true for all contexts</li>
         * <li>if something is passed but it's not an object, the value is converted to a boolean (with standard JavaScript coercion), and this boolean value will be used for all contexts.</li>
         * </ul>
         *
         * @param {Object} infos An optional object for additional infos on what has been done. For now, tells if it has actually been escaped or not, and for which contexts.
         *
         * @return {String} processed string
         */
        escapeForHTML : function (str, options, infos) {
            // -------------------------------------- input arguments processing

            // options ---------------------------------------------------------

            if (options == null) {
                options = true;
            }

            if (!ariaUtilsType.isObject(options)) {
                options = !!options;
                options = {
                    text: options,
                    attr: options
                };
            }

            var escapeForHTMLText = !!(options.text);
            var escapeForHTMLAttr = !!(options.attr);

            // ------------------------------------------------------ processing

            var escaped = false;
            var textEscaped = false;
            var attrEscaped = false;

            if (escapeForHTMLText) {
                escaped = true;
                textEscaped = true;
                str = this.escapeHTML(str).replace(/\//g, "&#x2F;");
            }

            if (escapeForHTMLAttr) {
                escaped = true;
                attrEscaped = true;
                str = this.escapeHTMLAttr(str);
            }

            // ---------------------------------------------------------- return

            if (infos != null) {
                infos.escaped = escaped;
                infos.text = textEscaped;
                infos.attr = attrEscaped;
            }

            return str;
        },

        /**
         * Remove accents from a string
         * @param {String} stringToStrip the string from which you want to remove accentuation
         * @return {String} The string, stripped from any accent
         */
        stripAccents : function (stringToStrip) {
            var s = stringToStrip;
            s = s.replace(/[\u00E0\u00E2\u00E4]/gi, "a");
            s = s.replace(/[\u00E9\u00E8\u00EA\u00EB]/gi, "e");
            s = s.replace(/[\u00EE\u00EF]/gi, "i");
            s = s.replace(/[\u00F4\u00F6]/gi, "o");
            s = s.replace(/[\u00F9\u00FB\u00FC]/gi, "u");
            return s;
        },

        /**
         * Find next white space in the given string after start position and before end position
         * @param {String} str The string into which we search
         * @param {Integer} start The position in str at which we should begin the search (included)
         * @param {Integer} end The position in str at which we should end the search (excluded)
         * @param {RegExp} regexp The regular expression used to recognize a white space. If not provided, /\s/ is used.
         * @return {Integer} the position of the whitespace in str (between start and end), or -1 if it was not found
         */
        nextWhiteSpace : function (str, start, end, regexp) {
            var currentCharPos = start, whiteRegexp = regexp || /\s/, currentChar;
            while (currentCharPos < end) {
                currentChar = str.charAt(currentCharPos);
                if (whiteRegexp.test(currentChar)) {
                    return currentCharPos;
                }
                currentCharPos++;
            }
            return -1;
        },

        /**
         * Transform a string into a string that will evaluate to its original value
         * @param {String} param
         * @return {String}
         */
        stringify : function (param) {
            return '"' + param.replace(/([\\\"])/g, "\\$1").replace(/(\r)?\n/g, "\\n") + '"';
        },

        /**
         * Tell if a string ends exactly with a certain token
         * @param {String} str Where to search
         * @param {String} suffix Ending part
         * @return {Boolean}
         */
        endsWith : function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        /**
         * Encode untrusted data for attribute values like value, name, class... This shouldn't be used for complex
         * attributes like style, href... It assumes that the attribute is inside double quotes
         * @param {String} str String to encode
         * @return {String} Encoded string
         */
        encodeForQuotedHTMLAttribute : function (str) {
            return (str) ? str.replace(/"/g, "&quot;") : "";
        },

        /**
         * Puts the first character of each word in uppercase, other characters are unaffected.
         * @param {String} str
         * @return {String}
         */
        capitalize : function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        /**
         * Add some padding to a string in order to have a minimu length. If the minimum length is smaller than the
         * string length, nothing is done.
         * @param {String} string The string that requires padding
         * @param {Number} size Minimum length
         * @param {String} character Character to add.
         * @param {Boolean} begin Add character at the beginning or at the end of the string. If true at the beginning.
         * Default false.
         * @return {String} Padded string
         */
        pad : function (string, size, character, begin) {
            string = "" + string;
            var length = string.length;
            if (length < size) {
                var padding = [];
                for (var difference = size - length; difference > 0; difference -= 1) {
                    padding.push(character);
                }

                if (begin === true) {
                    string = padding.join("") + string;
                } else {
                    string = string + padding.join("");
                }
            }
            return string;
        },

        /**
         * Remove all consecutive occurrences of a character from the beginning or end of a string. It's like trim but
         * instead of removing white spaces removes the specified character. Unlike trim it works on one direction only.
         * @param {String} string String to be cropped
         * @param {Number} size Minimum size of the resulting string
         * @param {String} character Character to be removed
         * @param {Boolean} begin Crop from the beginning or the end of the string. If true crops from the beginning.
         * Default false.
         */
        crop : function (string, size, character, begin) {
            var start, length;
            if (begin === true) {
                for (start = 0, length = string.length - size; start < length; start += 1) {
                    if (string.charAt(start) !== character) {
                        break;
                    }
                }

                return string.substring(start);
            } else {
                for (start = string.length - 1; start >= size; start -= 1) {
                    if (string.charAt(start) !== character) {
                        break;
                    }
                }

                return string.substring(0, start + 1);
            }
        },

        /**
         * Split a string into an array of chunks. The length of the chunks is given by size that can be either
         * <ul>
         * <li> a number, all chunks will have the same size, except the last one if shorter than size</li>
         * <li> an array of numbers, chunks will respectively have same length as the number in the array. If the string
         * is longer than the sum of array numbers, the last chunk will contain the remaining part of the string.</li>
         * </ul>
         * @param {String} string String to splitted
         * @param {Number|Array} size Length of chunks. If an array, the element at position 0 is the length of the
         * first chunk.
         * @param {Boolean} begin If true chunks are created from right to left. Default false
         * @return {Array} List of chunks. Calling join('') on this array always returns the initial string.
         * @example
         *
         * <pre>
         * chunk('abcdefg', 3, true);
         * ['abc', 'def', 'g']
         *
         * chunk('abcdefg', 3, false);
         * ['a', 'bcd', 'efg']
         *
         * chunk('abcdefg', [1, 2], true);
         * ['ab', 'c', 'defg']
         *
         * chunk('abcdefg', [1, 2], false);
         * ['abcd', 'e', 'fg']
         * </pre>
         */
        chunk : function (string, size, begin) {
            if (!ariaUtilsType.isString(string)) {
                return null;
            } else if (!string) {
                return [string];
            }

            if (ariaUtilsType.isArray(size)) {
                return this._chunkArray(string, size, begin);
            } else {
                return this._chunkNumber(string, size, begin);
            }
        },

        /**
         * Internal method to chunk on numbers
         * @param {String} string Original string
         * @param {Number} size Chunk's length
         * @param {Boolean} begin True to chunk from the beginning
         * @return {Array} List of chunks
         * @private
         */
        _chunkNumber : function (string, size, begin) {
            var result = [], start, strLen = string.length;

            if (size < 1 || size >= strLen) {
                return [string];
            } else if (size === 1) {
                // split is faster than what I want to do
                return string.split('');
            }

            if (begin === true) {
                start = 0;
                while (start < strLen) {
                    result.push(string.substr(start, size));
                    start += size;
                }

                return result;
            } else {
                start = strLen;
                while (start > 0) {
                    result.push(string.substring(Math.max(0, start - size), start));
                    start -= size;
                }

                return result.reverse();
            }
        },

        /**
         * Internal method to chunk on numbers
         * @param {String} string Original string
         * @param {Array} size List of chunk's length
         * @param {Boolean} begin True to chunk from the beginning
         * @return {Array} List of chunks
         * @private
         */
        _chunkArray : function (string, size, begin) {
            var result = [], start, strLen = string.length, i, len;

            if (begin === true) {
                start = 0;

                for (i = 0, len = size.length; i < len; i += 1) {
                    result.push(string.substr(start, size[i]));
                    start += size[i];

                    if (start >= strLen) {
                        break;
                    }
                }

                if (start < strLen) {
                    // string was not consumed completely
                    result.push(string.substring(start));
                }

                return result;
            } else {
                start = strLen;

                for (i = 0, len = size.length; i < len; i += 1) {
                    result.push(string.substring(Math.max(0, start - size[i]), start));
                    start -= size[i];

                    if (start <= 0) {
                        break;
                    }
                }

                if (start > 0) {
                    // string was not consumed completely
                    result.push(string.substring(0, start));
                }

                return result.reverse();
            }
        },

        /**
         * Convert from camel case to hyphenated version.
         * @param {String} str camel cased string e.g. "fooBarABC"
         * @return {String} hyphenated string e.g. "foo-bar-a-b-c"
         */
        camelToDashed : function (str) {
            return str.replace(/[A-Z]/g, function (letter) {
                return "-" + letter.toLowerCase();
            }).replace(/^-/, ""); // strip leading dash if first char was uppercase
        },

        /**
         * Convert from hyphenated string to camel case.
         * @param {String} str hyphenated string e.g. "foo-bar-a-b-c"
         * @return {String} camel cased equivalent e.g. "fooBarABC"
         */
        dashedToCamel : function (str) {
            return str.replace(/-([a-z])/ig, function (match, letter) {
                return letter.toUpperCase();
            });
        },

        /**
         * Wraps the given string with the given wrapper. This concretely means that the wrapper is put before and after the given string.
         *
         * @param {String} The string to wrap with the given wrapper
         * @param {String} The wrapper string
         *
         * @return {String} The wrapped string
         */
        wrap : function (string, wrapper) {
            return wrapper + string + wrapper;
        }
    }
});
