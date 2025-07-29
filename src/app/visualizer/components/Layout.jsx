import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar'; // Import Sidebar component

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isRaceModePage = location.pathname === '/race-mode';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {!isHomePage && !isRaceModePage && (
          <aside className="visualizer-sidebar hidden xl:block xl:w-64 flex-shrink-0">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
