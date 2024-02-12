import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import AddProject from './components/AddProject';

const env = 'dev'
const url = (env==='prd') ? 'https://mintek.top' : 'http://localhost:3000';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
        <Route path="/customer/:id" element={<Projects />}></Route>
        <Route path="/customer/:id/create" element={<AddProject/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
export {url};