import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import SectionPage from "./pages/SectionPage.jsx";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<SectionPage title="About Us" />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="media" element={<SectionPage title="Media" />} />
        <Route path="contact" element={<SectionPage title="Contact" />} />
        <Route path="donate" element={<SectionPage title="Donate Now" />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
