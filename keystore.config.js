// This file is used to configure the keystore for Android builds
// It's used by the EAS build process

module.exports = {
  // The keystore file path - you'll need to provide the actual keystore file
  keystorePath: process.env.KEYSTORE_PATH || './android/app/keystore.jks',
  
  // Keystore credentials
  keystorePassword: process.env.KEYSTORE_PASSWORD,
  keyAlias: process.env.KEY_ALIAS,
  keyPassword: process.env.KEY_PASSWORD,
  
  // Instructions for use:
  // 1. Place your keystore file at the path specified above
  // 2. Set the environment variables before building:
  //    - KEYSTORE_PASSWORD: Your keystore password
  //    - KEY_ALIAS: Your key alias
  //    - KEY_PASSWORD: Your key password
  //
  // For local development, you can create a .env file with these variables
  // For CI/CD, set these as secure environment variables in your build system
};
