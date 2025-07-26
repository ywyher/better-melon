import * as React from "react";

interface OTPTemplate {
  firstName: string;
  otp: string;
}

export const OTPTemplate = ({
  firstName,
  otp,
}: OTPTemplate) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
    <p>Your OTP is: {otp}</p>
  </div>
);