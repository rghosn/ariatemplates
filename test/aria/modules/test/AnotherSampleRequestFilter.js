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

/**
 * Simple RequestFilter class used for unit tests
 */
Aria.classDefinition({
    $classpath : "test.aria.modules.test.AnotherSampleRequestFilter",
    $extends : "aria.core.IOFilter",
    $prototype : {

        /**
         * Method called before a request is sent to get a chance to change its arguments
         * @param {aria.modules.RequestMgr.FilterRequest} req
         */
        onRequest : function (req) {
            // For test purpose only
            req.url = Aria.rootFolderPath + "test/aria/modules/test/SampleResponse.xml";
            req.method = "POST";
            this.__jsonData = req.postData;
        },

        /**
         * Method called when a response is received to change the result values before the RequestMgr callback is
         * called
         * @param {aria.modules.RequestMgr.FilterResponse} res
         */
        onResponse : function (request) {
            request.res.responseText = this.__jsonData;
        }

    }
});