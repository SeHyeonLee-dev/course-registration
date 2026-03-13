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
          <div className="app-header__eyebrow">수강신청 시스템</div>
          <Link className="app-header__title" to="/">
            대학교 수강신청
          </Link>
        </div>

        <nav className="app-nav">
          <NavLink className={navLinkClassName} to="/sections">
            수강신청
          </NavLink>
          <NavLink className={navLinkClassName} to="/my-enrollments">
            내 신청내역
          </NavLink>
          {user?.role === "ROLE_ADMIN" && (
            <NavLink className={navLinkClassName} to="/admin">
              관리자
            </NavLink>
          )}
        </nav>

        <div className="app-header__actions">
          {user ? (
            <>
              <span className="app-header__user">{user.name}님</span>
              <Button
                isLoading={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                size="sm"
                type="button"
                variant="secondary"
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link to="/login">로그인</Link>
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
