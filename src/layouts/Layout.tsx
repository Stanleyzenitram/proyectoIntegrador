import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { FloatingChatIcon } from "../components/FloatingChatIcon";

export default function Layout() {
    return (
        <>
            <Header />
            {/*pt-30 */}
            <main className="container mx-auto pt-15 ">
                <Outlet />
            </main>
            <FloatingChatIcon />
        </>
    );
}
