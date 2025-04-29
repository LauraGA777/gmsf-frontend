import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"

// Crear future flags object para React Router
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Failed to find the root element")
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter future={routerFutureConfig}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

