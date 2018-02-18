'use strict';

exports.handler = (event, context, callback) => {
    const request = require('request');
    const slackUrl = process.env.slackUrl;
    const notifyConnects = process.env.notifyConnects === 'true';
    const notifyDisconnects = process.env.notifyDisconnects === 'true';
    const callbackFunction = function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log('Slack notification successful. Connection value: ' + event.connected);
            callback(null, 'Done');
        } else if (error) {
            console.error(error);
            callback(error);
        }
    };

    if (notifyConnects && event.connected) {
        request(
            {
                method: 'POST',
                uri: slackUrl,
                body: JSON.stringify({'text': 'The mine has connected to the VPN'})
            }, callbackFunction
        );

        return;
    }

    if (notifyDisconnects && !event.connected) {
        request(
            {
                method: 'POST',
                uri: slackUrl,
                body: JSON.stringify({'text': 'The mine has disconnected from the VPN'})
            }, callbackFunction
        );
    }
};
