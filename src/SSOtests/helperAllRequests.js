/*global sso, QUnit, session, $, progress*/
(function () {
    "use strict";
    
    var testFramework = QUnit,
        jsdoSession,
        authProvider,
        resource = "Customer",
        authenticationSettings = {
            uri: "http://nbbedwhenshaw3:8810/TokenServer/",
            authenticationModel:  progress.data.Session.AUTH_TYPE_SSO
        },
        jsdoSettings = {serviceURI: "http://nbbedwhenshaw3:8810/TokenConsumer",
                    authenticationModel:  progress.data.Session.AUTH_TYPE_SSO,
                    catalogURIs: "http://nbbedwhenshaw3:8810/TokenConsumer/static/TokenConsumerService.json"
            },
        jsdo,
        custNameCUD = "CUDTest",
        custNameSubmitCreate = "SubmitCreateTest",
        custNameSubmitUpdate = "SubmitUpdateTest",
        custNameSubmitDelete = "SubmitDeleteTest";


    function startTest(assert) {
        var lastOperationTried,
            errorObject,
            done = assert.async(1);

        function handleThrownError(e, msg) {
            var deferred = $.Deferred();

            errorObject = e;
            deferred.reject(jsdoSession);
            return deferred.promise();
        }


        assert.expect(1);


        try {
            authProvider = new progress.data.AuthenticationProvider(
                authenticationSettings.uri,
                authenticationSettings.authenticationModel
            );
            lastOperationTried = "AuthenticationProvider.login";
            authProvider.login("restuser", "password")
                .then(function (ap, result, info) {
        //            msgs.push(lastOperationTried + " succeeded");
                    lastOperationTried = "JSDOSession constructor";
                    jsdoSession = new progress.data.JSDOSession(jsdoSettings);
                    try {
                        lastOperationTried = "JSDOSession.connect";
                        return jsdoSession.connect(authProvider);
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdosession, result, info) {
        //            msgs.push(lastOperationTried + " succeeded");
                    try {
                        lastOperationTried = "JSDOSession.addCatalog";
                        return jsdosession.addCatalog(jsdoSettings.catalogURIs);
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdosession, result, info) {
        //            msgs.push(lastOperationTried + " result:" + result);
                    try {
                        lastOperationTried = "JSDOSession.ping";
                        return jsdosession.ping();
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdosession, result, info) {
        //            msgs.push(lastOperationTried + " result:" + result);
                    try {
                        lastOperationTried = "JSDO constructor";
                        jsdo = new progress.data.JSDO(resource);
                        lastOperationTried = "JSDO fill";
                        return jsdo.fill();
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdo, success, request) {
        //            msgs.push(lastOperationTried + " result:" + success);
                    try {
                        jsdo.ttCustomer.add({Name: custNameCUD});
                        lastOperationTried = "JSDO saveChanges (with create)";
                        return jsdo.saveChanges(false);
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdo, success, request) {
                    var row;

        //            msgs.push(lastOperationTried + " result:" + success);
                    try {
                        row = jsdo.ttCustomer.find(function (row) {
                            return (row.data.Name === custNameCUD);
                        });

                        if (row) {
                            lastOperationTried = "JSDO saveChanges";
                            row.assign({Name: "Updated " + row.data.Name});
                        }
                        lastOperationTried = "JSDO saveChanges (with update)";
                        return jsdo.saveChanges(false);
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdo, success, request) {
                    var row;

        //            msgs.push(lastOperationTried + " result:" + success);
                    try {
                        row = jsdo.ttCustomer.find(function (row) {
                            return (row.data.Name === "Updated " + custNameCUD);
                        });

                        if (row) {
                            row.remove();
                        }
                        lastOperationTried = "JSDO saveChanges (with a delete)";
                        return jsdo.saveChanges(false);
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdo, success, request) {

        //            msgs.push(lastOperationTried + " result:" + success);

                    try {
                        // set up for Submit test
                        jsdo.ttCustomer.add({Name: custNameSubmitUpdate});
                        jsdo.ttCustomer.add({Name: custNameSubmitDelete});

                        lastOperationTried = "JSDO saveChanges (setting up for Submit test)";
                        return jsdo.saveChanges(false);
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdo, success, request) {
                    var row;

        //            msgs.push(lastOperationTried + " result:" + success);
                    try {
                        // test Submit
                            // add a customer
                        jsdo.ttCustomer.add({Name: custNameSubmitCreate});
                            // update a customer    
                        row = jsdo.ttCustomer.find(function (row) {
                            return (row.data.Name === custNameSubmitUpdate);
                        });
                        if (row) {
                            row.assign({Name: "Updated " + row.data.Name});
                        }
                            // delete a customer    
                        row = jsdo.ttCustomer.find(function (row) {
                            return (row.data.Name === custNameSubmitDelete);
                        });
                        if (row) {
                            row.remove();
                        }

                        // now actually do Submit    
                        lastOperationTried = "JSDO saveChanges (Submit with create, update, delete)";
                        return jsdo.saveChanges(true);  // saveChanges with useSubmit = true
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (jsdo, success, request) {
        //            msgs.push(lastOperationTried + " result:" + success);
                    try {
                        lastOperationTried = "JSDOSession disconnect)";
                        return jsdoSession.disconnect();
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (session, result, info) {
        //            msgs.push(lastOperationTried + " result:" + result);

                    try {
                        lastOperationTried = "AuthenticationProvider logout)";
                        return authProvider.logout();
                    } catch (e) {
                        return handleThrownError(e);
                    }
                })
                .then(function (provider, result, info) {
        //            msgs.push(lastOperationTried + " result:" + result);
                    assert.ok(true, "Test made all requests to server successfully.");
                }, function (jsdosession, result, info) {
                    var errMsg;

                    if (errorObject) {
                        errMsg = "Error thrown calling " + lastOperationTried + ": " + errorObject;
                    } else {
                        errMsg = "Error calling " + lastOperationTried;
                    }
                    assert.ok(false, "Test failed. " + errMsg);

                })
                .always(function () {
                    done();
                });
        } catch (f) {
    //        msgs.push("BUG: Error thrown calling AuthenticationProvider.login(): " + f);

        }
    }
    
    

    testFramework.test(
        "all JSDOSession and JSDO requests except invoke",
        startTest
    );
    
    
}());
