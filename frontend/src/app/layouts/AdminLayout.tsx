import { NavLink, Outlet } from "react-router-dom";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "app-nav__link app-nav__link--active" : "app-nav__link";

export function AdminLayout() {
  return (
    <div className="stack">
      <nav className="app-nav app-nav--sub">
        <NavLink className={navLinkClassName} end to="/admin">
          개요
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/semesters/new">
          학기
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/courses/new">
          과목
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/sections/new">
          분반
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/sections/enrollments">
          신청 현황
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
