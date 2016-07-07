var sseClient = require('@jenkins-cd/sse-gateway/headless-client');
var jobChannel = undefined;
var jobEventListeners = [];

/**
 * Connect to the SSE Gateway.
 * <p>
 * DO NOT CALL: done automatically in the globals.
 */
exports.connect = function(browser, done) {
    sseClient.connect({
        clientId: 'blueocean-acceptance-tests',
        jenkinsUrl: browser.launchUrl,
        onConnect: function() {
            browser.sseClient = sseClient;
            
            // Subscribe to job channel so we have it ready to listen 
            // before any tests start running.
            jobChannel = sseClient.subscribe('job', function(event) {
                callJobEventListeners(event);                
            });
            
            console.log('Connected to the Jenkins SSE Gateway.');
            done();
        }
    });
    browser.sseClient = sseClient;
};

/**
 * Disconnect from the SSE Gateway.
 * <p>
 * DO NOT CALL: done automatically in the globals.
 */
exports.disconnect = function() {
    try {
        if (jobChannel) {
            sseClient.unsubscribe(jobChannel);
            jobChannel = undefined;
        }
    } finally {
        sseClient.disconnect();
    }
    console.log('Disconnected from the Jenkins SSE Gateway.');
};

exports.onJobEvent = function(eventName, jobName, callback) {
    jobEventListeners.push({
        jenkins_event: eventName,
        job_name: jobName,
        callback: callback
    });
};

exports.onJobRunStarted = function(jobName, callback) {
    exports.onJobEvent('job_run_started', jobName, callback);
};

exports.onJobRunEnded = function(jobName, callback) {
    exports.onJobEvent('job_run_ended', jobName, callback);
};

function callJobEventListeners(event) {
    var newListenerList = [];
    for (var i = 0; i < jobEventListeners.length; i++) {
        var jobEventListener = jobEventListeners[i];
        if (jobEventListener.jenkins_event === event.jenkins_event && jobEventListener.job_name === event.job_name) {
            try {
                jobEventListener.callback(event);
            } catch(e) {
                console.error(e);
            }
        } else {
            // Only add the handlers that were not called.
            newListenerList.push(jobEventListener);
        }
    }
    jobEventListeners = newListenerList;
}