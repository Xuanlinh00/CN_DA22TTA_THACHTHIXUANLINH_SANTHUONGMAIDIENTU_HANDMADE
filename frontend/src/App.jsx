import { useRoutes } from "react-router-dom";
import routes from "./routes";
import './index.css';

function App() {
  const content = useRoutes(routes);
  return <div className="App">{content}</div>;
}

export default App;
