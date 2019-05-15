# Simple Video Sharing Platform

## Features
* Easy to integrate with any backend or CMS
* All-AWS setup
* Automatic transcoding to Adaptive Bitrate, triggered by video uploads to S3
* Notifies when a video is ready to be played (transcoding complete)
* CMAF support
* Original videos get archived to [Glacier](https://aws.amazon.com/glacier/)
* CDN delivery
* Fully scalable

Built as streaming backbone for a video sharing platform with loads of user contributed content (i.e. video uploads)

## Setup

### Deploying the architecture

1. Sign in to the [AWS Management Console](https://aws.amazon.com/console), then click the button below to launch the CloudFormation template. Alternatively you can [download](template.yaml) the template and adjust it to your needs.

[![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?stackName=simple-video-sharing-platform&templateURL=https://s3.amazonaws.com/lostshadow/simple-video-sharing-platform/template.yaml)

2. Be sure to fill in your email address under `NotificationEmail`. This will be used for testing transcoding notifications.
3. Check the `I acknowledge that AWS CloudFormation might create IAM resources` box. This confirms you agree to have some required IAM roles and policies created by *CloudFormation*.
4. Hit the `Create` button. 
5. Wait for the `Status` to become `CREATE_COMPLETE`. Note that this may take **10 minutes** or more.
6. Under `Outputs`, notice the key named `CloudFrontDistributionDNSName`; it should have a corresponding value like `xxxxxxxxxxxxxx.cloudfront.net`; write this down for using later

Notes:
* The template is launched in the *US East (N. Virginia)* Region by default. To launch this solution in a different AWS Region, use the region selector in the console navigation bar.
* The solution uses *AWS Elemental MediaConvert* which is available in specific AWS Regions only. Therefore, you must deploy it in a region that supports the service.

### Testing your setup

1. You will be sent 2 emails asking for *Subscription Confirmation* to their respective SNS topics. Click the included confirmation link for both. 
2. *CloudWatch* will have created 3 new buckets in your S3. Note the one that has `-sourcebucket-` in its name and upload a video file to it. 
3. Wait to receive a notification to your email. This may take a while, depending on the length of the video you just uploaded. If the subject contains `EncodeFailed`, there has been an error transcoding your video; the body of the email may provide details about what went wrong. If the subject contains `EncodeComplete` then your file is processed and ready for playback.
4. Note the paths to your processed video files in the email body under `playlistFilePaths`; the section will look like the  following:

		"playlistFilePaths":["s3://xxxxxx-destinationbucket-yyyyyyyyyyyy/{filename}.mpd","s3://xxxxxx-destinationbucket-yyyyyyyyyyyy/{filename}.m3u8"]

...and these are the S3 URLs of the HLS and MPEG-DASH manifests of the video
5. Compose your *CDN video URLs* by replacing the *S3* prefix in URLs above with `https://{CloudFrontDistributionDNSName}` (DNS name retrieved in step 6 above); they should look as following:

HLS URL:

		https://xxxxxxxxxxxxxx.cloudfront.net/{filename}.m3u8

MPEG-DASH URL:
	
		https://xxxxxxxxxxxxxx.cloudfront.net/{filename}.mpd

6. Test your video URL in your favorite player or player tester. 
You may use [this](https://video-dev.github.io/hls.js/demo/) tester for HLS and [this one](https://players.akamai.com/dash) for DASH.

### Integration

Of course, video uploads should not be manual and transcode notifications should not go to your inbox. 

At the minimum, you'll need the following done to automate the process:

* Create a mechanism that generates and distributes [presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html) for your users to upload videos directly to S3
* Adjust the SNS topics to [notify your API/backend](https://docs.aws.amazon.com/sns/latest/dg/sns-http-https-endpoint-as-subscriber.html) (rather than your email) when video items are ready for viewing
