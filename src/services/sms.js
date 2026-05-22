/**
 * SMS Service for bulksmsbd.net
 */

const BASE_URL = "https://bulksmsbd.net/api";

/**
 * Send SMS to one or more recipients
 * @param {string} apiKey - API Key from bulksmsbd.net
 * @param {string} senderId - Approved Sender ID
 * @param {string} numbers - Comma separated numbers (e.g. 88017...,88018...)
 * @param {string} message - The message body
 */
export async function sendSMS(apiKey, senderId, numbers, message) {
  try {
    const url = `${BASE_URL}/smsapi?api_key=${apiKey}&type=text&number=${numbers}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("SMS Sending failed:", error);
    throw error;
  }
}

/**
 * Get current balance from bulksmsbd.net
 * @param {string} apiKey - API Key from bulksmsbd.net
 */
export async function getSMSBalance(apiKey) {
  try {
    const url = `${BASE_URL}/getBalanceApi?api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get SMS balance:", error);
    throw error;
  }
}

/**
 * Error codes mapping for bulksmsbd.net
 */
export const SMSErrorCodes = {
  "202": "SMS Submitted Successfully",
  "1001": "Invalid Number",
  "1002": "Sender ID not correct/Sender ID is disabled",
  "1003": "Please Required all fields",
  "1005": "Internal Error",
  "1006": "Balance Validity Not Available",
  "1007": "Balance Insufficient",
  "1011": "User ID not found",
  "1012": "Masking SMS must be sent in Bengali",
  "1013": "Sender ID has not found Gateway by api key",
  "1014": "Sender Type Name not found using this sender by api key",
  "1015": "Sender ID has not found Any Valid Gateway by api key",
  "1016": "Sender Type Name Active Price Info not found by this sender id",
  "1017": "Sender Type Name Price Info not found by this sender id",
  "1018": "The Owner of this Account is disabled",
  "1019": "The Price of this Account is disabled",
  "1020": "The parent of this account is not found",
  "1021": "The parent active price of this account is not found",
  "1031": "Your Account Not Verified",
  "1032": "IP Not whitelisted"
};
