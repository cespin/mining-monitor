'use strict';

exports.handler = (event, context, callback) => {
    const AWS = require('aws-sdk');

    console.info('Mine \'' + event.mine + '\' is ' +
        (event.updateValue ? 'connected' : 'disconnected'));

    const params = {
        ExpressionAttributeNames: {
            '#VN': 'vpn'
        },
        ExpressionAttributeValues: {
            ':vn': {
                M: {
                    'connected': {
                        BOOL: event.updateValue
                    }
                }
            }
        },
        TableName: 'everything',
        UpdateExpression: 'SET #VN = :vn',
        Key: {
            'name': {
                S: event.mine
            }
        },
    };

    // Create the DynamoDB service object
    const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    // Call DynamoDB to add the item to the table
    dynamodb.updateItem(params, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        console.info('Update successful for ' + event.mine);
    });

    const sns = new AWS.SNS();
    const accountId = context.invokedFunctionArn.split(':')[4];
    const topicArn = 'arn:aws:sns:' + AWS.config.region + ':' + accountId + ':vcc-' + event.mine;

    console.info('The ARN: ' + topicArn);

    sns.publish({
        Message: JSON.stringify({
            'default': event.updateValue
        }),
        TopicArn: topicArn,
        MessageStructure: 'json'
    }, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        console.info('SNS notification sent for ' + event.mine);
    });

    //callback(null, 'Done');
};
