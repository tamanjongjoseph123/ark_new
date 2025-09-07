#!/bin/bash
# Script to verify keystore fingerprints

# Check if a keystore file was provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <keystore-file> [alias]"
  echo "Example: $0 ./android/keystores/upload-key.jks upload"
  exit 1
fi

KEYSTORE_FILE=$1
ALIAS=${2:-""}

# If alias is not provided, list all aliases
if [ -z "$ALIAS" ]; then
  echo "Listing all aliases in keystore:"
  keytool -list -keystore "$KEYSTORE_FILE"
  echo ""
  echo "Please run the script again with an alias to see detailed information."
  echo "Example: $0 $KEYSTORE_FILE <alias-name>"
  exit 0
fi

# Display detailed information about the certificate
echo "Detailed certificate information for alias '$ALIAS':"
keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS"

# Extract and display fingerprints in a more readable format
echo ""
echo "Fingerprints for Google Play Console comparison:"
echo "----------------------------------------------"
MD5=$(keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" | grep "MD5" | awk '{print $2}')
SHA1=$(keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" | grep "SHA1" | awk '{print $2}')
SHA256=$(keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" | grep "SHA256" | awk '{print $2}')

echo "MD5:     $MD5"
echo "SHA-1:   $SHA1"
echo "SHA-256: $SHA256"
echo ""
echo "Expected Upload Key SHA-1: 0B:68:FB:86:74:85:C2:E9:4E:E1:1B:8E:70:4D:60:ED:AF:7F:04:F8"
echo ""

# Compare with expected SHA-1
if [ "$SHA1" = "0B:68:FB:86:74:85:C2:E9:4E:E1:1B:8E:70:4D:60:ED:AF:7F:04:F8" ]; then
  echo "✅ This keystore contains the correct upload key for Google Play!"
else
  echo "❌ This is NOT the expected upload key for Google Play."
  echo "   Please find the correct keystore or request an upload key reset."
fi
