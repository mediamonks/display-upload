// const validateActionInput = require('../util/validateActionInput');
// const validateRelativeUrls = require('../util/validate/validateRelativeUrls');
// const validateNotEmpty = require('../util/validate/validateNotEmpty');
// const Uploader = require('s3-batch-upload').default;
const open = require('open');

module.exports = {
  questions: [],
  async action(data) {
    console.log(`go to https://monet.netflix.com`);

    open(`https://monet.netflix.com`);
  },
};
