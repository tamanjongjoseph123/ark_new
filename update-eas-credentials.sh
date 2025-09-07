#!/bin/bash
# Script to update EAS credentials with the new keystore

echo "This script will help you update your EAS credentials with the new keystore."
echo "Make sure you have the EAS CLI installed and you're logged in."
echo ""

# Check if the keystore file exists
if [ ! -f "android/keystores/new-upload-key.jks" ]; then
  echo "Error: Keystore file not found at android/keystores/new-upload-key.jks"
  exit 1
fi

# Check if the certificate file exists
if [ ! -f "android/keystores/new-upload-certificate.pem" ]; then
  echo "Error: Certificate file not found at android/keystores/new-upload-certificate.pem"
  exit 1
fi

echo "Keystore information:"
echo "---------------------"
echo "Path: android/keystores/new-upload-key.jks"
echo "Alias: upload"
echo "Password: arkofgod"
echo "Key password: arkofgod"
echo ""

echo "Certificate information:"
echo "----------------------"
echo "SHA1: 42:90:3A:81:20:81:11:50:27:D8:66:4E:7B:A0:45:2E:7D:B2:37:5E"
echo ""

echo "Next steps:"
echo "1. Go to Google Play Console: https://play.google.com/console/"
echo "2. Select your app"
echo "3. Go to Setup > App integrity > App signing"
echo "4. Click 'Request upload key reset'"
echo "5. Upload the certificate file: android/keystores/new-upload-certificate.pem"
echo "6. Follow Google's instructions to complete the process"
echo ""
echo "After Google approves your request, run:"
echo "eas credentials"
echo ""
echo "And follow the prompts to update your Android credentials with the new keystore."
echo ""
echo "When building, use:"
echo "eas build --platform android --profile production"
echo ""

# Offer to open the Google Play Console
read -p "Would you like to open the Google Play Console now? (y/n): " open_console
if [[ $open_console == "y" || $open_console == "Y" ]]; then
  echo "Opening Google Play Console..."
  open "https://play.google.com/console/"
fi
