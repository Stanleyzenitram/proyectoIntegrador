import { Outlet } from "react-router-dom";
import Header from "../components/Header";
export default function Layout() {
    return (
        <>
            <Header />
            {/*pt-30 */}
            <main className="container mx-auto pt-25 ">
                <Outlet />
            </main>
        </>
    );
}
