import { Routes, Route } from "react-router-dom";
import { ResumeProvider } from "./context";
import Landing from "./pages/Landing";
import Main from "./pages/Main";
import Chat from "./pages/Chat";

function App() {
  return (
    <ResumeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Main />} />
        <Route path="/chat" element={<Chat />} />

      </Routes>
    </ResumeProvider>
  );
}

export default App;
