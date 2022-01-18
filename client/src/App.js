// import logo from "./logo.svg";
import "./App.css";
import { Route } from "react-router-dom";

import { Users, Port1 } from "../src/components";

function App() {
  return (
    <div>
      <Users />
      <Route exact path="/port1" component={Port1}></Route>
    </div>
  );
}

export default App;
