import crypto from "crypto";
export function generateNumericOTP(length: number = 6): string {
  if (length <= 0) throw new Error("OTP length must be greater than 0");

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return crypto.randomInt(min, max + 1).toString();
}