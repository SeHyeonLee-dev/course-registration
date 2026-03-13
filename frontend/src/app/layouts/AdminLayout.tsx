import { NavLink, Outlet } from "react-router-dom";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "app-nav__link app-nav__link--active" : "app-nav__link";

export function AdminLayout() {
  return (
    <div className="stack">
      <nav className="app-nav app-nav--sub">
        <NavLink className={navLinkClassName} end to="/admin">
          Overview
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/semesters/new">
          Semesters
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/courses/new">
          Courses
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/sections/new">
          Sections
        </NavLink>
        <NavLink className={navLinkClassName} to="/admin/sections/enrollments">
          Enrollment Status
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
