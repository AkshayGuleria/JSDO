
/* 
progress.auth.js    Version: 4.3.0-1

Copyright (c) 2016 Progress Software Corporation and/or its subsidiaries or affiliates.
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */

(function () {

    "use strict";

    /*global progress : true, btoa*/
    /*global $ : false*/

    /* define these if not defined yet - they may already be defined if
       progress.js was included first */
    if (typeof progress === "undefined") {
        progress = {};
    }
    if (typeof progress.data === "undefined") {
        progress.data = {};
    }
    
    progress.data.AuthenticationProvider = function (options) {
        var authenticationURI,
            tokenLocation,
            defaultHeaderName = "X-OE-CLIENT-CONTEXT-ID";
        
        // PROPERTIES
        Object.defineProperty(this, 'authenticationURI',
            {
                get: function () {
                    return authenticationURI;
                },
                enumerable: true
            });

        Object.defineProperty(this, 'tokenLocation',
            {
                get: function () {
                    return tokenLocation;
                },
                enumerable: true
            });
 
        Object.defineProperty(this, 'token',
            {
                set: function (val) {
                    sessionStorage.setItem(authenticationURI, val);
                },
                get: function () {
                    return sessionStorage.getItem(authenticationURI);
                },
                enumerable: false
            });
 
        
        if (typeof options === "undefined") {
            throw new Error(progress.data._getMsgText("jsdoMSG038", "1"));
        }
        
        if (options.authenticationURI) {
            authenticationURI = options.authenticationURI;
        } else {
            throw new Error(progress.data._getMsgText("jsdoMSG048", "AuthenticationProvider", "Constructor",
                                                      "options", "authenticationURI"));
        }
        
        if (options.tokenLocation) {
            tokenLocation = options.tokenLocation;
        } else {
            // Give it a default location
            tokenLocation = {
                headerName : defaultHeaderName
            };
        }
        
        // PRIVATE FUNCTIONS
        
        function openTokenRequest(xhr, authProvider, credentials) {
            xhr.open('POST', authProvider.authenticationURI, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Cache-Control", "max-age=0");
            xhr.withCredentials = true;
            xhr.setRequestHeader("Accept", "application/json");
        }
        
        function processAuthResult(xhr) {
            var token,
                errorObject,
                result;
            
            if (xhr._deferred) {
                if (xhr.status === 200) {
                    // get token and store it; if that goes well, resolve the promise, otherwise reject it
                    try {
                        token = xhr._authProvider.getTokenFromXHR({xhr: xhr});
                        xhr._authProvider.token = token;
                    } catch (e) {
                        errorObject = e;
                    }
                }
                
                if (result === progress.data.Session.AUTHENTICATION_SUCCESS) {
                    xhr._deferred.resolve(
                        xhr._authProvider,
                        result,
                        {
                            "xhr": xhr
                        }
                    );
                } else {
                    xhr._deferred.reject(
                        xhr._authProvider,
                        result,
                        {
                            errorObject : errorObject, // might be undefined, that's OK
                            xhr: xhr
                        }
                    );
                }
            } else {
                throw new Error("_deferred missing from xhr when processing authenticate");
            }
        }
        
        // METHODS
        this.authenticate = function (options) {
            var deferred = $.Deferred(),
                errorObject,
                xhr;
            
            xhr = new XMLHttpRequest();
            xhr._authProvider = this;
            
            openTokenRequest(xhr, this, options);
            
// DELETE THIS FOR REAL IMPLEMENTATION (ASSUMING THAT THE REAL IMPL DOESN'T REQUIRE 2 CALLS)
            xhr.onreadystatechange = function () {
                var errorObject;
            
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        xhr.open('GET', "http://localhost:8810/TokenServer/web/getcp", true);
                        xhr.setRequestHeader("Cache-Control", "no-cache");
                        xhr.setRequestHeader("Pragma", "no-cache");
                        xhr.withCredentials = true;
                        xhr.setRequestHeader("Accept", "application/json");
// END OF DELETION FOR REAL IMPLEMENTATION 
                        xhr.onreadystatechange = function () {
                            var errorObject;

                            if (xhr.readyState === 4) {
                                errorObject = null;
                // NOTE: if we keep this as a closure rather than implementing a separate generic
                // readystatechange handler, we can get rid of the xhr.onResponseFn property and just call
                // processAuthResult directly (remove its assignment just before the send at the end of authenticate() )
                                // process the response from the Web application
                                if ((typeof xhr.onResponseFn) === 'function') {
                                    try {
                                        xhr.onResponseFn(xhr);
                                    } catch (e) {
                                        errorObject = e;
                                    }
                                }
                            }
                        };

// DELETE THIS SEND() FOR REAL IMPLEMENTATION
                        xhr.send();
                    }
                }
                
            };
            
            xhr.onResponseFn = processAuthResult;
            xhr._deferred = deferred;
//            xhr.send();   if using Basic auth to get token, probably delete this when we get the real implementation
            xhr.send("j_username=" + options.userName + "&j_password=" + options.password + "&submit=Submit");
            return deferred;
            
        };

        // finds the token in a successful response from a token provider and returns it
        this.getTokenFromXHR = function (options) {
            var xhr = options.xhr,
                token,
                allHeaders,
                regExp,
                headerName;

            try {
                allHeaders = xhr.getAllResponseHeaders();
             
                if (allHeaders) {
                    headerName = this.tokenLocation.headerName;
                    regExp = new RegExp("^" + headerName + ":", "m");
                    if (allHeaders.match(regExp)) {
                        return xhr.getResponseHeader(headerName);
                    }
                }
            } catch (e) {
                throw new Error("Unexpected error authenticating:" + e.message); // add to JSDOMessages
            }
        };
                            

    
    };
    
    
}());

