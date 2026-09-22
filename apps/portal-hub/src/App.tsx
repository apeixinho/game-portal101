import { Route, Routes } from "react-router-dom";
import { HubRoute } from "./routes/HubRoute";
import { PlanetsRoute } from "./routes/PlanetsRoute";

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HubRoute />} />
      <Route path="/planets" element={<PlanetsRoute />} />
      <Route path="*" element={<HubRoute />} />
    </Routes>
  );
}

export default App;
