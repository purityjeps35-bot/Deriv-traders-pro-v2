
"use client";

import { useEffect, useState } from "react";

export default function CallbackPage() {
  const [message, setMessage] = useState("Checking Deriv login response...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
      setMessage("Deriv login was cancelled or failed. Please try again.");
    } else if (params.has("code") && params.has("state")) {
      setMessage(
        "Deriv returned an authorization code. Secure verification is still required."
      );
    } else {
      setMessage("This is the Deriv callback page. Please log in through the website.");
    }
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Deriv Login</h1>
      <p>{message}</p>
    </main>
  );
}
