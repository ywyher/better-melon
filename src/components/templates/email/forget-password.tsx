import * as React from "react";

interface TForgetPassowrdEmailTemplate {
  firstname: string;
  url: string;
}

export const ForgetPassowrdEmailTemplate: React.FC<
  Readonly<TForgetPassowrdEmailTemplate>
> = ({ firstname, url }) => (
  <div>
    <h1>Welcome, {firstname}!</h1>
    <a href={url}>Click Here To Reset</a>
    <p>{url}</p>
  </div>
);
