import logo from './logo.svg';
import './App.css';
import axios from "axios";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    axios.get("/api/test")
      .then(res => console.log(res.data))
      .catch(err => console.log("ERROR:", err));
  }, []);

  return <div>React App1</div>;
}

export default App;
