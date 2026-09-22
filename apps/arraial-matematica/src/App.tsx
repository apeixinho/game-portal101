import { Route, Routes } from "react-router-dom";
import { ArraialRoute } from "./routes/ArraialRoute";

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<ArraialRoute />} />
      <Route path="*" element={<ArraialRoute />} />
    </Routes>
  );
}

export default App;
