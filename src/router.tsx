import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Layout from "./layouts/Layout";
import SobreNosotrosPage from "./pages/sobreNosotros";  




export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} index/>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/sobreNosotros" element={<SobreNosotrosPage/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
