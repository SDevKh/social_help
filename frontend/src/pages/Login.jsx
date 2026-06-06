import React from "react";
import { AuthUI } from "../components/AuthUI";

export default function Login() {
  return (
    <AuthUI
      signInContent={{
        image: {
          src: "https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png",
          alt: "A beautiful interior design for sign-in",
        },
        quote: {
          text: "Welcome Back! The journey continues.",
          author: "EaseMize UI",
        },
      }}
    />
  );
}

