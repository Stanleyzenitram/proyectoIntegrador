import { Outlet } from "react-router-dom";
import Header from "../components/Header";
export default function Layout() {
    return (
        <>
            <Header />
            <main className="container mx-auto pt-30 ">
                <Outlet />
            </main>
        </>
    );
}
