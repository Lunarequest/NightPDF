const { notarize } = require('electron-notarize');
require('dotenv').config()

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'io.elesoft.NightPDF',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID_EMAIL,
    appleIdPassword: process.env.APPLEID_PASSWORD,
    ascProvider: "FGUTKN9B4V"
  });
};