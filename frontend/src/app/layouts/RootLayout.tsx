import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogoutMutation, useMeQuery } from "../../features/auth/hooks";
import { Button } from "../../shared/ui/Button";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "app-nav__link app-nav__link--active" : "app-nav__link";

export function RootLayout() {
  const navigate = useNavigate();
  const meQuery = useMeQuery();
  const logoutMutation = useLogoutMutation(() => {
      navigate("/login", { replace: true });
  });

  const user = meQuery.data;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__eyebrow">Course Registration</div>
          <Link className="app-header__title" to="/">
            University registration client
          </Link>
        </div>

        <nav className="app-nav">
          <NavLink className={navLinkClassName} to="/semesters">
            Semesters
          </NavLink>
          <NavLink className={navLinkClassName} to="/sections">
            Sections
          </NavLink>
          <NavLink className={navLinkClassName} to="/my-enrollments">
            My Enrollments
          </NavLink>
          {user?.role === "ROLE_ADMIN" && (
            <NavLink className={navLinkClassName} to="/admin">
              Admin
            </NavLink>
          )}
        </nav>

        <div className="app-header__actions">
          {user ? (
            <>
              <span className="app-header__user">
                {user.name} ({user.role})
              </span>
              <Button
                isLoading={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                size="sm"
                type="button"
                variant="secondary"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
