const AWS = require('aws-sdk');
const MEDIA_CONVERT_ENDPOINT = process.env.MEDIA_CONVERT_ENDPOINT;
const MEDIA_CONVERT_ROLE_ARN = process.env.MEDIA_CONVERT_ROLE_ARN;
const JOB_TEMPLATE = process.env.JOB_TEMPLATE;
const OUTPUT_LOCATION = `s3://${process.env.OUTPUT_LOCATION}/`;
const mediaConvert = new AWS.MediaConvert({endpoint: MEDIA_CONVERT_ENDPOINT});

exports.handler = function(event, context, callback) {
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const fileInput = `s3://${srcBucket}/${srcKey}`;
  
  const params = {
    JobTemplate: JOB_TEMPLATE,
    Role: MEDIA_CONVERT_ROLE_ARN,
    Settings: {
      Inputs: [
        {
          FileInput: fileInput,
          "AudioSelectors": {
            "Audio Selector 1": {
              "Offset": 0,
              "DefaultSelection": "DEFAULT",
              "SelectorType": "LANGUAGE_CODE",
              "ProgramSelection": 1,
              "LanguageCode": "ENM"
            }
          },
        },
      ],
    },
  };
  if (OUTPUT_LOCATION) {
    params.Settings.OutputGroups = [
      {
        Outputs: [],
        OutputGroupSettings: {
          "Type": "CMAF_GROUP_SETTINGS",
          "CmafGroupSettings": {
            "SegmentLength": 10,
            "Destination": OUTPUT_LOCATION,
            "FragmentLength": 2,
          }
        },
      },
    ];
  }
  mediaConvert.createJob(params).promise()
  .then(() => {
    let message = 'Transcode job created.';
    console.log(message);
    callback(null, message);
  })
  .catch((err) => {
    let message = `Transcode failed for s3://${srcBucket}/${srcKey} Error: ${err}`;
    console.error(message);
    callback(null, message);
  });
};