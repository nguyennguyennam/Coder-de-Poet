import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navigation_PC() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className={`bg-[#EFE9E3] shadow-lg rounded-3xl border-gray-200 h-[96vh] flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? "w-[20vw]" : "w-[8vw]"}`}
    >
      {/* TOP SECTION */}
      <div className="flex flex-col py-6 space-y-6 w-full">
        {/* LOGO - CỐ ĐỊNH TRONG CỘT 80px */}
        <div className={`flex items-center justify-center ${isOpen ? "w-full" : ""}`}>
          <img
            src="https://res.cloudinary.com/drjlezbo7/image/upload/v1763281600/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_p2izym.png"
            alt="logo"
            className="object-contain rounded-lg h-[calc(12vh)]"
          />
        </div>

        {/* TOGGLE BUTTON - CĂN GIỮA TRONG CỘT 80px */}
        <div className="flex items-center w-full justify-start">
          <div className="w-[8vw] flex items-center justify-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center text-[#000] hover:text-indigo-600 bg-white
                         rounded-2xl border border-gray-300  hover:border-[#ccc]
                         transition-all duration-200"
            >
              <i className="bx bx-menu text-[calc(16px_+_2vw)] p-1"></i>
            </button>
          </div>
        </div>

        {/* MENU ITEMS */}
        <ul className="flex flex-col space-y-1 text-gray-700 font-medium flex-1 gap-[calc(1vh_+_2px)]">
          <NavItem to="/" label="Dashboard" icon="home-alt-2" isOpen={isOpen} />
          <NavItem to="/courses" label="Courses" icon="book" isOpen={isOpen} />
          <NavItem to="/book" label="Library" icon="book-open" isOpen={isOpen} />
          <NavItem to="/calendar" label="Calendar" icon="calendar-alt" isOpen={isOpen} />
          <NavItem to="/setting" label="Settings" icon="cog" isOpen={isOpen} />
        </ul>
      </div>

      <div className="flex items-center w-full justify-start mt-[2vh]">
        <div className="w-[8vw] flex items-center justify-center">
          <div className="w-[calc(16px_+_3vw)] h-[calc(16px_+_3vw)] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold 
                          flex items-center justify-center text-sm transition-colors">
            <img
            src="https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/537187856_1444879253437802_3963755224737322732_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_ohc=h5x2ZoWUPDgQ7kNvwFjlLWm&_nc_oc=AdlIokzGZDGz20b0LR4Xr8BzbBHKkDgtRvlEkJAWGYFRElnaZs0y_E-UQXgBxqOsm_w&_nc_zt=24&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=V61kKF67TVY76pnDq_ppyQ&oh=00_AfjeqQhAAnrdM3ddp4W9eIVkTFAcS0XSpZKJFyYrh_EwpQ&oe=692765CC"
            alt="logo"
            className="object-contain rounded-lg"
          />
          </div>
        </div>
        {isOpen && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 flex-1">
            <span className="text-sm font-medium text-gray-800">Ngô Hải Bằng</span>
            <span className="text-xs text-gray-500">haibang@example.com</span>
          </div>
        )}
      </div>
    </nav>
  );
}

// NavItem riêng - icon cố định, label mượt
function NavItem({ to, label, icon, isOpen }) {
  return (
    <li>
      <NavLink to={to} end>
        {({ isActive }) => (
          <div className={`flex items-center justify-start h-12 rounded-md text-sm font-medium transition-all duration-200 hover:bg-[#D9CFC7]`}>
            {/* CỘT ICON - CỐ ĐỊNH */}
            <div className="w-[8vw] h-full flex items-center justify-center px-1">
              <i
                className={`bx bx-${icon} text-[calc(16px_+_2vw)] rounded-2xl border border-gray-300 p-1 ${isActive ? 'bg-[#000] text-[#fff]' : 'text-[#000] bg-white'}`}
              ></i>
            </div>

            {/* CỘT LABEL - ẨN HIỆN MƯỢT */}
            <span
              className={`flex-1 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-[#000] ${isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}
              style={{ transitionProperty: 'opacity, max-width' }}
            >
              {label}
            </span>
          </div>
        )}
      </NavLink>
    </li>
  );
}