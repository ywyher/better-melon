import * as React from "react";

interface OTPTemplate {
  url: string;
}

export const ChangeEmailTemplate = ({
  url,
}: OTPTemplate) => (
  <div>
    <p>Your link the change the email {url}</p>
  </div>
);