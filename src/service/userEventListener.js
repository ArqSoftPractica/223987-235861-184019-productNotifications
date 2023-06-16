require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const sqs = require('./sqsService')
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

var userQueueServiceIsActive = { isActive: false };

const userQueueListener = async () => {
    try {
        const sqsResponse = await sqs.receiveMessage(params).promise()
        userQueueServiceIsActive.isActive = true;
        if (sqsResponse && sqsResponse.Messages) {
            sqsResponse.Messages.forEach(async (messageGotten) => {
                            try {
                                if (messageGotten && messageGotten != undefined) {
                                    console.log("Message Gotten", messageGotten);
                                    let message = JSON.parse(messageGotten.Body);
                                    let userObject = JSON.parse(message.Message);
                                    await userRepository.upsertUser(userObject);
        
                                    try {
                                        var deleteParams = {
                                            QueueUrl: queueURL,
                                            ReceiptHandle: messageGotten.ReceiptHandle
                                        };
                                        await sqs.deleteMessage(deleteParams).promise();
                                    } catch (err) {
                                        logger.logError('Error Deleting Message from Company QUEUE', err)
                                        userQueueServiceIsActive.isActive = false
                                        await new Promise(resolve => setTimeout(resolve, 300000));
                                    }
                                }
                            } catch (err) {
                                logger.logError("Error creating company In Provider Service", err);
                                userQueueServiceIsActive.isActive = false
                                await new Promise(resolve => setTimeout(resolve, 300000));
                            }
                        });
        }
    } catch (err) {
        logger.logError('Error Receiving User QUEUE', err);
        userQueueServiceIsActive.isActive = false
        await new Promise(resolve => setTimeout(resolve, 300000));
    }
    userQueueListener();
}

module.exports = { userQueueListener,  userQueueServiceIsActive }
