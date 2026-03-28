import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <>
      <style>{`
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 68px;
          background: rgba(7, 7, 15, 0.7);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer; }
        .lp-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; box-shadow: 0 0 20px rgba(124,58,237,0.4);
        }
        .lp-logo-text { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; color: #fff; }
        .lp-nav-links { display: flex; align-items: center; gap: 8px; }
        .lp-nav-link {
          padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
          color: #9ca3af; cursor: pointer; background: none; border: none;
          transition: color 0.2s, background 0.2s; font-family: 'Inter', sans-serif;
        }
        .lp-nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .lp-nav-btn {
          padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .lp-nav-btn-outline {
          background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #fff;
        }
        .lp-nav-btn-outline:hover { border-color: rgba(124,58,237,0.6); color: #c4b5fd; }
        .lp-nav-btn-solid {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none; color: #fff;
          box-shadow: 0 4px 15px rgba(124,58,237,0.35);
        }
        .lp-nav-btn-solid:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <nav className="lp-nav">
        <div className="lp-logo" onClick={() => navigate("/")}>
          <div className="lp-logo-icon">🏠</div>
          <span className="lp-logo-text">RentalChain</span>
        </div>
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => navigate("/properties")}>Browse Properties</button>
          {user ? (
            <>
              <button 
                className="lp-nav-link" 
                onClick={() => navigate("/transactions")}
              >
                Transactions
              </button>
              <button 
                className="lp-nav-btn lp-nav-btn-outline" 
                onClick={() => navigate(user.role === "admin" ? "/admin/dashboard" : `/dashboard/${user.role}`)}
              >
                Dashboard
              </button>
              <button className="lp-nav-btn lp-nav-btn-outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="lp-nav-btn lp-nav-btn-outline" onClick={() => navigate("/login")}>Login</button>
              <button className="lp-nav-btn lp-nav-btn-solid" onClick={() => navigate("/register")}>Get Started</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
