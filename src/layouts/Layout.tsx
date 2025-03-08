import { Outlet } from "react-router-dom";
import Header from "../components/Header";
export default function Layout() {
    return (
        <>
            <Header />
            {/*pt-30 */}
            <main className="container mx-auto pt-40 bg-gray-100  h-screen">
                <Outlet />
            </main>
        </>
    );
}
