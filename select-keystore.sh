#!/bin/bash
# Script to help select a keystore from your Expo account

echo "This script will help you select a keystore from your Expo account for building your project."
echo "Make sure you have the EAS CLI installed and you're logged in."
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
  echo "Error: EAS CLI is not installed or not in your PATH."
  echo "Please install it with: npm install -g eas-cli"
  exit 1
fi

# Check if user is logged in
echo "Checking if you're logged in to EAS..."
eas whoami &> /dev/null
if [ $? -ne 0 ]; then
  echo "You're not logged in to EAS. Please log in first with: eas login"
  exit 1
fi

echo "You're logged in to EAS."
echo ""

# Get project info
echo "Getting project information..."
PROJECT_INFO=$(eas project:info --json 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "Error: Failed to get project information. Make sure you're in a valid Expo project directory."
  exit 1
fi

PROJECT_ID=$(echo $PROJECT_INFO | grep -o '"ID":"[^"]*"' | cut -d'"' -f4)
PROJECT_NAME=$(echo $PROJECT_INFO | grep -o '"fullName":"[^"]*"' | cut -d'"' -f4)

echo "Project: $PROJECT_NAME (ID: $PROJECT_ID)"
echo ""

# List Android credentials
echo "Listing Android credentials..."
echo "Please note the ID of the keystore you want to use."
echo ""

eas credentials --platform android

echo ""
echo "To use a specific keystore for your builds, you have two options:"
echo ""
echo "Option 1: Update your eas.json file"
echo "Add the keystoreId to your production profile in eas.json:"
echo ""
echo '    "production": {'
echo '      "autoIncrement": true,'
echo '      "android": {'
echo '        "buildType": "app-bundle",'
echo '        "image": "latest",'
echo '        "credentialsSource": "remote",'
echo '        "keystoreId": "YOUR_KEYSTORE_ID"'
echo '      }'
echo '    }'
echo ""
echo "Replace YOUR_KEYSTORE_ID with the ID of the keystore you want to use."
echo ""
echo "Option 2: Specify the keystore when building"
echo "Run the build command with the --android-keystore-id parameter:"
echo ""
echo "eas build --platform android --profile production --android-keystore-id YOUR_KEYSTORE_ID"
echo ""
echo "Replace YOUR_KEYSTORE_ID with the ID of the keystore you want to use."
echo ""

# Ask if user wants to update eas.json
read -p "Would you like to update your eas.json file now? (y/n): " update_eas_json
if [[ $update_eas_json == "y" || $update_eas_json == "Y" ]]; then
  read -p "Enter the keystore ID you want to use: " keystore_id
  
  # Update eas.json
  echo "Updating eas.json..."
  
  # Check if jq is installed
  if command -v jq &> /dev/null; then
    # Use jq to update the file
    jq --arg id "$keystore_id" '.build.production.android.keystoreId = $id' eas.json > eas.json.tmp && mv eas.json.tmp eas.json
    echo "eas.json updated successfully!"
  else
    echo "jq is not installed. Please manually update your eas.json file to include:"
    echo '"keystoreId": "'$keystore_id'"'
    echo "in the android section of your production profile."
  fi
fi

echo ""
echo "You can now build your app with:"
echo "eas build --platform android --profile production"
echo ""
echo "EAS will use the keystore you specified."
