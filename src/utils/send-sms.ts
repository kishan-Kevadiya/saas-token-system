import axios from 'axios';
export const sendSms = async (
  mobileNo: string,
  otp: string
): Promise<{ success: boolean; error?: string }> => {
  const username = process.env.SMS_USERNAME ?? '';
  const password = process.env.SMS_PASSWORD ?? '';

  const apiUrl = `http://alerts2.netsolitsolution.com/http-api.php?username=${username}&password=${password}&senderid=NETSOL&route=1&number=${mobileNo}&message=${encodeURIComponent(
    otp
  )}`;

  return await axios
    .get(apiUrl)
    .then(() => ({ success: true }))
    .catch(() => ({ success: false, error: 'Failed to send SMS.' }));
};
