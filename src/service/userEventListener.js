require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const sqs = require('./snsService')
var logger = require("../logger/systemLogger");
const UserRepository = require('../repositories/user-repository');
const userRepository = new UserRepository();

var queueURL = process.env.SQS_USER_QUEUE_URL;

var params = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: ["All"],
    QueueUrl: queueURL,
    VisibilityTimeout: 30,
    WaitTimeSeconds: 0
};

const userCrationListener = async () => {
    try {
        const sqsResponse = await sqs.receiveMessage(params).promise()
        if (sqsResponse && sqsResponse.Messages) {
            sqsResponse.Messages.forEach(async (messageGotten) => {
                            try {
                                if (messageGotten && messageGotten != undefined) {
                                    console.log("Message Gotten", messageGotten);
                                    let message = JSON.parse(messageGotten.Body);
                                    let userToCreate = JSON.parse(message.Message);
                                    await userRepository.createUser(userToCreate);
        
                                    try {
                                        var deleteParams = {
                                            QueueUrl: queueURL,
                                            ReceiptHandle: messageGotten.ReceiptHandle
                                        };
                                        await sqs.deleteMessage(deleteParams).promise();
                                    } catch (err) {
                                        logger.logError('Error Deleting Message from Company QUEUE', err)
                                    }
                                }
                            } catch (err) {
                                logger.logError("Error creating company In Provider Service", err);
                            }
                        });
        }
    } catch (err) {
        logger.logError('Error Receiving Company QUEUE', err);
    }
    userCrationListener();
}

module.exports = userCrationListener
