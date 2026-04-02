import { useState } from "react";
import { predictEmail } from "../api/emailApi";

const EmailChecker = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    const data = await predictEmail(email);
    setResult(data);
  };

  return (
    <div>
      <textarea
        placeholder="Paste email content here..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleCheck}>Check Email</button>

      {result && (
        <div>
          <p>Result: {result.label}</p>
          <p>Confidence: {result.confidence}</p>
        </div>
      )}
    </div>
  );
};

export default EmailChecker;
