require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const sqs = require('./sqsService')
var logger = require("../logger/systemLogger");
const ProductRepository = require('../repositories/product-repository');
const productRepository = new ProductRepository();

var queueURL = process.env.SQS_PRODUCT_QUEUE_URL;

var params = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: ["All"],
    QueueUrl: queueURL,
    VisibilityTimeout: 30,
    WaitTimeSeconds: 0
};

const productEventListener = async () => {
    try {
        const sqsResponse = await sqs.receiveMessage(params).promise()
        if (sqsResponse && sqsResponse.Messages) {
            sqsResponse.Messages.forEach(async (messageGotten) => {
                            try {
                                if (messageGotten && messageGotten != undefined) {
                                    console.log("Message Gotten", messageGotten);
                                    let message = JSON.parse(messageGotten.Body);
                                    let product = JSON.parse(message.Message);
                                    await productRepository.upsertProduct(product);
        
                                    try {
                                        var deleteParams = {
                                            QueueUrl: queueURL,
                                            ReceiptHandle: messageGotten.ReceiptHandle
                                        };
                                        await sqs.deleteMessage(deleteParams).promise();
                                    } catch (err) {
                                        logger.logError('Error Deleting Message from Product QUEUE', err)
                                    }
                                }
                            } catch (err) {
                                logger.logError("Error creating Product In productNotification Service", err);
                            }
                        });
        }
    } catch (err) {
        logger.logError('Error Receiving Product QUEUE', err);
        await new Promise(resolve => setTimeout(resolve, 300000));
    }
    productEventListener();
}

module.exports = productEventListener
