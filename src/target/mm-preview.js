const validateActionInput = require('../util/validateActionInput');
const validateNotOutsideWorkingDir = require('../util/validate/validateNotOutsideWorkingDir');
const validateNotEmpty = require('../util/validate/validateNotEmpty');
const { v4: uuidv4 } = require('uuid');
const open = require('open');
// const fs = require('fs-extra');
const path = require('path');
const fs = require('fs');
const globPromise = require('glob-promise');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const cliProgress = require('cli-progress');

const mime = require('mime-types');

const preview = {
  questions: [
    {
      type: 'input',
      name: 'bucket',
      message: 'Please fill in the name for the S3 Bucket:',
      default: process.env.preview_s3bucket,
      errorMessage: 'Missing bucket',
      validate: validateNotEmpty,
      required: true,
    },
    {
      type: 'input',
      name: 'accessKeyId',
      message: 'Please fill in the accessKeyId for the S3 Bucket:',
      default: process.env.preview_accessKeyId,
      errorMessage: 'Missing accessKeyId',
      validate: validateNotEmpty,
      required: true,
    },
    {
      type: 'input',
      name: 'secretAccessKey',
      message: 'Please fill in the secretAccessKey for the S3 Bucket:',
      default: process.env.preview_accessKeySecret,
      validate: validateNotEmpty,
      errorMessage: 'Missing secretAccessKey',
      required: true,
    },

    {
      type: 'input',
      name: 'outputDir',
      description: 'Please fill in the target directory:',
      default: () => `${uuidv4()}/`,
      validate: validateNotEmpty,
      errorMessage: 'Missing target ',
      required: true,
    },
  ],
  async action(data) {
    if (!data.outputDir) {
      data.outputDir = `${uuid()}/`;
    }

    validateActionInput(data, this.questions);

    const client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
      },
    });

    const allFiles = await globPromise(`${data.inputDir.replace(/\\/g, '/')}/**/*`);

    const filesArray = await Promise.all(
      (await Promise.all(
        allFiles.map(async file => {
          if ((await fs.promises.lstat(file)).isFile()) {
            return file
          }
        })
      ))
      .filter(file => file !== undefined)
      .map(async file => new PutObjectCommand({
        Bucket: data.bucket,
        Key: data.outputDir + path.relative(data.inputDir, file).replace(/\\/g, '/'),
        ContentType: mime.lookup(file),
        Body: await fs.promises.readFile(file),
      }))
    )

    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(filesArray.length, 0);

    await Promise.all(
      filesArray.map(async file => {
        try {
          await client.send(file);
        } catch (e) {
          console.log(e);
        }
        progressBar.increment();
      }),
    );

    progressBar.stop();
    console.log(`go to http://${data.bucket}.s3.amazonaws.com/${data.outputDir}index.html`);
    open(`http://${data.bucket}.s3.amazonaws.com/${data.outputDir}index.html`);
  },
};

module.exports = preview;
