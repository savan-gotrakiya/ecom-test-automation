import React from "react";
import InputForm from "./components/InputForm/InputForm";

const App: React.FC = () => {
  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>Product Automation Tester</h1>
      <InputForm />
    </div>
  );
};

export default App;
