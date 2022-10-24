import { useEffect, useState } from "react"
import Home from "./pages/home/Home"
import Mint from "./pages/mint/Mint"
import Sell from "./pages/sell/Sell"
import Navbar from "./common/navbar/Navbar"
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import ToastContainer from "./common/toast/ToastContainer"

function App() {
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "dark")
    } else {
      setTheme(localStorage.getItem("theme"))
    }
  }, [])

  return (
    <div className={theme}>
      <div className="min-h-screen bg-neutral-200 dark:bg-gray-800">
        <Navbar props={{ theme: theme, setTheme: setTheme }} />
        <div className="px-10">
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/sell" element={<Sell />} />
            </Routes>
          </Router>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default App