// import logo from "./logo.svg";
import "./App.css";

import { Port1, Users } from "./components";

function App() {
  return (
    <div>
      <Users />
      <Route exact path="/port1" component={Port1}></Route>
    </div>
  );
}

export default App;
