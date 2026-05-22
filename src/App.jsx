import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import SectionPage from "./pages/SectionPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import MediaPage from "./pages/MediaPage.jsx";
import JoinListPage from "./pages/JoinListPage.jsx";
import JoinFormPage from "./pages/JoinFormPage.jsx";
import DonationPage from "./pages/DonationPage.jsx";
import DonationsListPage from "./pages/DonationsListPage.jsx";
import UpdateListPage from "./pages/UpdateListPage.jsx";
import ExecutiveMemberDetail from "./pages/ExecutiveMemberDetail.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<SectionPage title="About Us" />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="funds" element={<DonationsListPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="donation" element={<DonationPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="executive-body/:id" element={<ExecutiveMemberDetail />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="notices" element={<UpdateListPage category="notice" />} />
        <Route path="posts" element={<UpdateListPage category="posts" />} />
        <Route path="join/list/:category" element={<JoinListPage />} />
        <Route path="join/form/:category" element={<JoinFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
