import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ICONS } from "../config";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [akunExpanded, setAkunExpanded] = useState(false);
  const [sumbangsihExpanded, setSumbangsihExpanded] = useState(false);
  const [urunDayaExpanded, setUrunDayaExpanded] = useState(false);

  const isLoggedIn = !!user;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get("theme");
    const savedTheme = localStorage.getItem("theme") || "light";

    if (themeParam) {
      document.documentElement.setAttribute("data-bs-theme", themeParam);
      localStorage.setItem("theme", themeParam);
    } else {
      document.documentElement.setAttribute("data-bs-theme", savedTheme);
    }
  }, []);

  const handleThemeToggle = (e) => {
    e.preventDefault();
    const currentTheme =
      document.documentElement.getAttribute("data-bs-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const itemsToCheck = [
    "/article/kronik",
    "/article/tilik",
    "/article/diskursus",
  ];

  const isListPage = itemsToCheck.some((item) => {
    const regex = new RegExp(`^${item}/?$`);
    return regex.test(location.pathname);
  });

  const params = new URLSearchParams(location.search);
  const currentCategory = params.get("category") || "semua";

  const handleCategoryClick = (categoryKey) => {
    const newParams = new URLSearchParams(location.search);

    if (categoryKey === "semua") {
      newParams.delete("category");
    } else {
      newParams.set("category", categoryKey);
    }

    newParams.delete("page");

    const queryString = newParams.toString();
    navigate(`${location.pathname}${queryString ? "?" + queryString : ""}`);
  };

  const categories = [
    { key: "agraria", label: "Agraria" },
    { key: "ekosospol", label: "Ekosospol" },
    { key: "sumber-daya-alam", label: "Sumber Daya Alam" },
    { key: "semua", label: "Semua" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    setShowOffcanvas(false);
  };

  const handleCategoryClickInOffcanvas = (categoryKey) => {
    handleCategoryClick(categoryKey);
    setShowOffcanvas(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-inherit border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center h-16 px-4 md:px-8 w-full">
          <div className="flex items-center flex-none">
            <Link className="inline-block mr-6 site-logo" to="/">
              <svg
                width="60"
                height="32"
                viewBox="0 0 60 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M37.2491 16.0817C37.7184 16.0817 38.2162 16.1101 38.7424 16.167C39.2829 16.2097 39.7878 16.2737 40.2572 16.359C40.6228 16.4128 40.9316 16.4747 41.1834 16.5447C41.3199 16.5827 41.4091 16.7099 41.4091 16.8515V17.1376C41.4091 17.874 40.8121 18.471 40.0758 18.471H36.6091C36.1967 18.471 35.8838 18.5421 35.6705 18.6844C35.4572 18.8124 35.3505 19.0612 35.3505 19.431V19.7723C35.3505 20.0283 35.4003 20.2203 35.4998 20.3483C35.5994 20.4621 35.7487 20.5475 35.9478 20.6044C36.1612 20.647 36.4243 20.6683 36.7371 20.6683H38.5718C39.738 20.6683 40.5842 20.9385 41.1104 21.479C41.6509 22.0052 41.9211 22.7376 41.9211 23.6763V24.7003C41.9211 25.4683 41.7362 26.0799 41.3665 26.535C41.0109 26.9759 40.4847 27.2959 39.7878 27.495C39.1052 27.6799 38.266 27.7723 37.2705 27.7723C36.915 27.7723 36.5309 27.7581 36.1185 27.7297C35.706 27.7155 35.2935 27.687 34.8811 27.6443C34.4687 27.6017 34.0847 27.5519 33.7292 27.495C33.4766 27.4445 33.2527 27.3904 33.0575 27.3327C32.922 27.2926 32.8332 27.1658 32.8332 27.0244V26.7377C32.8332 26.0013 33.4301 25.4043 34.1665 25.4043H37.9105C38.2091 25.4043 38.4509 25.383 38.6358 25.3404C38.8349 25.2835 38.9772 25.191 39.0625 25.063C39.162 24.9208 39.2118 24.7217 39.2118 24.4657V24.103C39.2118 23.8186 39.1194 23.5981 38.9345 23.4417C38.7496 23.2852 38.4083 23.207 37.9105 23.207H36.1185C35.4643 23.207 34.874 23.1074 34.3478 22.9083C33.8216 22.7092 33.402 22.3821 33.0891 21.927C32.7905 21.4718 32.6411 20.8603 32.6411 20.0923V19.431C32.6411 18.7057 32.7833 18.0941 33.0678 17.5963C33.3522 17.0985 33.8287 16.7217 34.4972 16.4657C35.1656 16.2097 36.0829 16.0817 37.2491 16.0817Z"
                  fill="#FC6736"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.0959 16.0177C15.2337 16.0177 16.144 16.1314 16.8267 16.359C17.5093 16.5866 18 16.9848 18.2987 17.5537C18.6115 18.1225 18.768 18.9261 18.768 19.9643C18.768 20.7323 18.6116 21.3439 18.2987 21.799C18 22.2399 17.5733 22.5599 17.0186 22.759C16.464 22.9439 15.8098 23.0363 15.056 23.0363H12.876C12.495 23.0363 12.1848 23.3564 12.2454 23.7325C12.2894 24.0061 12.3516 24.2434 12.432 24.4443C12.5884 24.7856 12.8658 25.0345 13.264 25.1909C13.6764 25.3332 14.2667 25.4043 15.0347 25.4043H17.0506C17.787 25.4043 18.3839 26.0013 18.3839 26.7377V26.9884C18.3839 27.1467 18.2727 27.2832 18.1174 27.3141C17.6351 27.4099 17.1124 27.5058 16.5493 27.6017C15.8951 27.7012 15.1129 27.751 14.2026 27.751C12.9369 27.751 11.9271 27.5874 11.1733 27.2603C10.4196 26.919 9.87201 26.3216 9.53068 25.4683C9.20357 24.615 9.03996 23.4345 9.03996 21.927C9.03996 20.3767 9.19639 19.175 9.50928 18.3216C9.82216 17.4683 10.3484 16.871 11.088 16.5297C11.8275 16.1883 12.8302 16.0177 14.0959 16.0177ZM14.0959 18.3003C13.6124 18.3003 13.2284 18.3857 12.944 18.5563C12.6596 18.7128 12.4533 18.9972 12.3253 19.4096C12.2168 19.7591 12.1543 20.2311 12.1378 20.8256C12.1326 21.0097 12.2825 21.159 12.4666 21.159H14.736C15.1627 21.159 15.4755 21.0736 15.6746 20.9029C15.8737 20.7323 15.9733 20.4265 15.9733 19.9856C15.9733 19.5732 15.9093 19.2461 15.7813 19.0043C15.6533 18.7484 15.4542 18.5705 15.184 18.471C14.9138 18.3572 14.5511 18.3003 14.0959 18.3003Z"
                  fill="#FC6736"
                />
                <path
                  d="M23.7725 12.9499C23.8814 12.9097 23.997 12.9902 23.997 13.1062V23.4843C23.997 23.911 24.0396 24.2523 24.1249 24.5083C24.2102 24.7501 24.3383 24.9278 24.5089 25.0416C24.6938 25.1554 24.9214 25.2337 25.1916 25.2763C25.6939 25.3498 26.0663 25.7806 26.0663 26.2883V27.3536C26.0663 27.5377 25.9171 27.6869 25.733 27.687H24.4236C23.6129 27.687 22.9374 27.559 22.397 27.303C21.8707 27.0328 21.4796 26.6274 21.2236 26.0869C20.9676 25.5323 20.8396 24.8212 20.8396 23.9536V14.2658C20.8396 14.1263 20.9266 14.0015 21.0575 13.9532L23.7725 12.9499Z"
                  fill="#FC6736"
                />
                <path
                  d="M4.45516 13.5434C4.67617 13.4401 4.92969 13.6014 4.92969 13.8454V15.855C4.9297 16.0391 5.07893 16.1883 5.26302 16.1883H7.28434C7.46843 16.1883 7.61767 16.3376 7.61767 16.5217V17.3937C7.61766 18.13 7.02071 18.727 6.28434 18.727H5.09635C5.0043 18.727 4.92969 18.8016 4.92969 18.8937V23.5483C4.92969 23.8612 4.95809 24.1172 5.01497 24.3163C5.07186 24.5154 5.15012 24.679 5.24967 24.807C5.36345 24.9208 5.49149 25.0061 5.63371 25.063C5.7759 25.1199 5.91811 25.1554 6.0603 25.1696L6.29484 25.1904C6.98312 25.2511 7.51098 25.8275 7.51098 26.5185V27.311C7.51098 27.4951 7.36174 27.6443 7.17765 27.6443H5.44165C4.55988 27.6443 3.84169 27.5163 3.28703 27.2603C2.74659 27.0043 2.35546 26.5777 2.11369 25.9803C1.87191 25.383 1.76525 24.5794 1.7937 23.5696L1.89656 18.8973C1.89862 18.8039 1.82345 18.727 1.72998 18.727H0.441648C0.257569 18.727 0.108326 18.5777 0.108315 18.3937V16.9557C0.108315 16.805 0.209422 16.673 0.354897 16.6338L1.62923 16.2902C1.86247 16.2272 2.0434 16.0431 2.10221 15.8088L2.3951 14.642C2.41951 14.5448 2.48638 14.4636 2.57723 14.4212L4.45516 13.5434Z"
                  fill="#FC6736"
                />
                <path
                  d="M30.2847 15.9487C30.3935 15.9037 30.5134 15.9827 30.5151 16.1004L30.6735 27.3063C30.6761 27.4922 30.5261 27.6443 30.3402 27.6443H27.8595C27.6734 27.6443 27.5234 27.4919 27.5263 27.3058L27.6842 17.2408C27.6862 17.1078 27.7673 16.9887 27.8902 16.9379L30.2847 15.9487Z"
                  fill="#FC6736"
                />
                <path
                  d="M52.3975 15.1046C52.5064 15.0644 52.622 15.1449 52.622 15.2609V20.4896C52.622 20.5817 52.6964 20.6563 52.7885 20.6563H53.3161C55.0067 20.6563 55.8721 17.4211 56.0925 16.4566C56.1282 16.3004 56.2659 16.1883 56.426 16.1883H59.1541C59.2567 16.1883 59.3343 16.2792 59.314 16.3799C59.2157 16.8682 58.9036 18.2018 58.2392 19.3527C57.0706 21.3766 56.3548 21.7294 56.349 21.7322L59.8663 27.3896C59.9353 27.5006 59.8555 27.6443 59.7248 27.6443H56.5182C56.3985 27.6443 56.288 27.5801 56.2287 27.4761L53.8777 23.353C53.6998 23.041 53.3682 22.8483 53.009 22.8483H52.7887C52.6966 22.8483 52.622 22.923 52.622 23.015V27.311C52.622 27.4951 52.4727 27.6443 52.2887 27.6443H49.7979C49.6139 27.6443 49.4646 27.4951 49.4646 27.311V16.4205C49.4646 16.281 49.5516 16.1562 49.6825 16.1079L52.3975 15.1046Z"
                  fill="#FC6736"
                />
                <path
                  d="M29.0996 11.1204C30.0661 11.1204 30.8496 11.9039 30.8496 12.8704C30.8496 13.8369 30.0661 14.6204 29.0996 14.6204C28.1331 14.6204 27.3496 13.8369 27.3496 12.8704C27.3496 11.9039 28.1331 11.1204 29.0996 11.1204Z"
                  fill="#FC6736"
                />
                <path
                  d="M45.457 6.0238C46.3934 6.02202 47.1551 6.781 47.1567 7.71733C47.1586 8.65368 46.3995 9.41543 45.4631 9.41703C44.5268 9.41881 43.7651 8.65978 43.7635 7.72343C43.7617 6.7871 44.5207 6.02542 45.457 6.0238Z"
                  fill="#686D76"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M45.46 5.00085C47.7452 5.00087 49.1042 6.49964 49.6528 7.27193C49.8401 7.54184 49.8403 7.8996 49.6535 8.16972C49.1062 8.94202 47.7497 10.44 45.46 10.4401C43.1705 10.44 41.8141 8.94202 41.2668 8.16972C41.0799 7.89958 41.0802 7.54185 41.2675 7.27193C41.8159 6.49964 43.175 5.00088 45.46 5.00085ZM45.46 5.67786C43.4727 5.67789 42.2967 6.99242 41.8238 7.65776C41.7974 7.69565 41.7974 7.74621 41.8193 7.77804C42.2952 8.4499 43.4691 9.76295 45.46 9.76298C47.4511 9.76296 48.625 8.45002 49.0967 7.78446C49.1229 7.74633 49.1229 7.69592 49.1008 7.6641C48.6237 6.99224 47.4475 5.67787 45.46 5.67786Z"
                  fill="#686D76"
                />
                <path
                  d="M39.8254 6.2179C40.6593 3.10602 43.8579 1.25931 46.9698 2.09314C47.0587 2.117 47.1115 2.20836 47.0877 2.29724C47.0638 2.38614 46.9724 2.43888 46.8835 2.41508C43.9494 1.62892 40.9336 3.37012 40.1474 6.30416C40.1236 6.39306 40.0322 6.4458 39.9433 6.422C39.8544 6.39817 39.8016 6.3068 39.8254 6.2179Z"
                  fill="#686D76"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M45.4601 0.227661C49.6022 0.227683 52.9601 3.58554 52.9601 7.72766C52.9601 11.537 50.12 14.6828 46.4419 15.1638C46.3577 15.1748 46.2934 15.246 46.2934 15.3309V16.2531C46.2934 16.3304 46.3465 16.3976 46.4217 16.4153L46.6212 16.4624C46.7689 16.4973 46.8744 16.6276 46.8779 16.7793L47.1143 27.3035C47.1186 27.4905 46.9681 27.6443 46.7811 27.6443H44.1389C43.9519 27.6443 43.8015 27.4905 43.8057 27.3035L44.0422 16.7793C44.0457 16.6276 44.1512 16.4973 44.2989 16.4624L44.4983 16.4153C44.5735 16.3976 44.6267 16.3304 44.6267 16.2531V15.3309C44.6267 15.246 44.5624 15.1748 44.4781 15.1638C40.8 14.6828 37.9601 11.537 37.9601 7.72766C37.9601 3.58553 41.3179 0.227661 45.4601 0.227661ZM45.4601 1.06099C41.7782 1.06099 38.7934 4.04576 38.7934 7.72766C38.7934 11.4096 41.7782 14.3943 45.4601 14.3943C49.1419 14.3943 52.1267 11.4095 52.1267 7.72766C52.1267 4.04578 49.1419 1.06102 45.4601 1.06099Z"
                  fill="#686D76"
                />
              </svg>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center">
            <div id="navbar-menu" className="w-full">
              <ul className="flex items-center justify-center gap-8">
                <li>
                  <Link
                    to="/"
                    onClick={handleLinkClick}
                    className={`inline-flex items-center text-sm uppercase tracking-wide nav-link ${isActive("/") ? "nav-link--active font-semibold" : "nav-link--inactive"}`}
                    style={{ color: isActive("/") ? "#FC6736" : "#555333" }}
                  >
                    Beranda
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/article/kronik"
                    onClick={handleLinkClick}
                    className={`inline-flex items-center text-sm nav-link ${isActive("/article/kronik") ? "nav-link--active font-semibold" : "nav-link--inactive"}`}
                    style={{
                      color: isActive("/article/kronik")
                        ? "#FC6736"
                        : "#555333",
                    }}
                  >
                    Kronik
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/article/tilik"
                    onClick={handleLinkClick}
                    className={`inline-flex items-center text-sm nav-link ${isActive("/article/tilik") ? "nav-link--active font-semibold" : "nav-link--inactive"}`}
                    style={{
                      color: isActive("/article/tilik") ? "#FC6736" : "#555333",
                    }}
                  >
                    Tilik
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/article/diskursus"
                    onClick={handleLinkClick}
                    className={`inline-flex items-center text-sm nav-link ${isActive("/article/diskursus") ? "nav-link--active font-semibold" : "nav-link--inactive"}`}
                    style={{
                      color: isActive("/article/diskursus")
                        ? "#FC6736"
                        : "#555333",
                    }}
                  >
                    Diskursus
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/profil"
                    onClick={handleLinkClick}
                    className={`inline-flex items-center text-sm nav-link ${isActive("/profil") ? "nav-link--active font-semibold" : "nav-link--inactive"}`}
                    style={{
                      color: isActive("/profil") ? "#FC6736" : "#555333",
                    }}
                  >
                    Profil
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="md:hidden flex-1 flex justify-end">
            <button
              className="ml-auto"
              type="button"
              onClick={() => setShowOffcanvas(true)}
              aria-label="Toggle navigation"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>

          <div className="col-3">
            <div className="d-flex align-items-center justify-content-end gap-2">
              <div className="urun-daya-container d-none d-md-block position-relative">
                <button
                  className="btn btn-telisik d-flex align-items-center"
                  onClick={() => setUrunDayaExpanded(!urunDayaExpanded)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="me-1"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 5l0 14" />
                    <path d="M5 12l14 0" />
                  </svg>
                  Urun Daya
                </button>

                <div
                  className={`urun-daya-dropdown ${urunDayaExpanded ? "show" : ""}`}
                >
                  <Link
                    to="/urun-daya/kronik"
                    className="urun-daya-item"
                    onClick={() => setUrunDayaExpanded(false)}
                  >
                    <span dangerouslySetInnerHTML={{ __html: ICONS.kronik }} />
                    &nbsp; Kronik
                  </Link>
                  <Link
                    to="/urun-daya/tilik"
                    className="urun-daya-item"
                    onClick={() => setUrunDayaExpanded(false)}
                  >
                    <span dangerouslySetInnerHTML={{ __html: ICONS.tilik }} />
                    &nbsp; Tilik
                  </Link>
                  <Link
                    to="/urun-daya/diskursus"
                    className="urun-daya-item"
                    onClick={() => setUrunDayaExpanded(false)}
                  >
                    <span
                      dangerouslySetInnerHTML={{ __html: ICONS.diskursus }}
                    />
                    &nbsp; Diskursus
                  </Link>
                </div>
              </div>

              <div className="d-none d-md-flex">
                <button
                  className="theme-toggle-switch"
                  onClick={handleThemeToggle}
                  aria-label="Toggle theme"
                >
                  <div className="theme-toggle-indicator" aria-hidden></div>
                  <span className="theme-toggle-icon icon-sun hide-theme-dark">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="M4.93 4.93l1.41 1.41" />
                      <path d="M17.66 17.66l1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="M4.93 19.07l1.41-1.41" />
                      <path d="M17.66 6.34l1.41-1.41" />
                    </svg>
                  </span>
                  <span className="theme-toggle-icon icon-moon hide-theme-light">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isListPage && (
        <nav className="sticky-top hidden md:block bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center gap-3 py-2 w-full">
              {categories.map((cat, index) => (
                <React.Fragment key={cat.key}>
                  <button
                    className={`text-sm p-0 category-pill ${currentCategory === cat.key ? "category-pill--active" : ""}`}
                    onClick={() => handleCategoryClick(cat.key)}
                    style={{ fontSize: "1rem" }}
                  >
                    {cat.label}
                  </button>
                  {index < categories.length - 1 && (
                    <span className="text-yellow-500 font-bold">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </nav>
      )}

      {showOffcanvas && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowOffcanvas(false)}
          ></div>
          <div className="fixed left-0 top-0 z-50 h-full w-80 bg-white dark:bg-gray-800 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold">Menu</h5>
              <button
                type="button"
                className="p-2"
                onClick={() => setShowOffcanvas(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div>
              {isLoggedIn ? (
                <div className="text-center mb-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Foto profil"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "10px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                      }}
                    >
                      <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                    </div>
                  )}
                  <div className="fw-semibold">
                    {user.display_name || "Display Name"}
                  </div>
                  <div className="text-muted small">
                    @{user.username || "username"}
                  </div>
                </div>
              ) : (
                <div
                  className="text-center mb-4"
                  onClick={() => {
                    navigate("/login");
                    handleLinkClick();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src="/login.svg"
                    alt="Login"
                    style={{
                      width: "80px",
                      height: "80px",
                      marginBottom: "10px",
                    }}
                  />
                  <div className="fw-semibold">Sila Masuk/Mendaftar</div>
                  <div className="text-muted small">Sumbangsihmu ditunggu</div>
                </div>
              )}

              <hr />

              <nav>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link
                      className="d-flex align-items-center text-decoration-none"
                      to="/"
                      onClick={handleLinkClick}
                    >
                      <img
                        src="/menus/beranda.png"
                        alt="Beranda"
                        className="me-2"
                        width="16"
                        height="16"
                      />
                      Beranda
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      className="d-flex align-items-center text-decoration-none"
                      to="/article/kronik"
                      onClick={handleLinkClick}
                    >
                      <img
                        src="/menus/kronik.png"
                        alt="Kronik"
                        className="me-2"
                        width="16"
                        height="16"
                      />
                      Kronik
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      className="d-flex align-items-center text-decoration-none"
                      to="/article/tilik"
                      onClick={handleLinkClick}
                    >
                      <img
                        src="/menus/tilik.png"
                        alt="Tilik"
                        className="me-2"
                        width="16"
                        height="16"
                      />
                      Tilik
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      className="d-flex align-items-center text-decoration-none"
                      to="/article/diskursus"
                      onClick={handleLinkClick}
                    >
                      <img
                        src="/menus/diskursus.png"
                        alt="Diskursus"
                        className="me-2"
                        width="16"
                        height="16"
                      />
                      Diskursus
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      className="d-flex align-items-center text-decoration-none"
                      to="/profile"
                      onClick={handleLinkClick}
                    >
                      <img
                        src="/menus/profil.png"
                        alt="Profil"
                        className="me-2"
                        width="16"
                        height="16"
                      />
                      Profil
                    </Link>
                  </li>
                </ul>
              </nav>

              <hr />

              {isListPage && (
                <>
                  <div className="mb-3">
                    <div className="text-muted small mb-2">
                      Filter Kategori:
                    </div>
                    {categories.map((cat, index) => (
                      <button
                        key={cat.key}
                        className={`btn btn-sm me-2 mb-2 ${
                          currentCategory === cat.key
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => handleCategoryClickInOffcanvas(cat.key)}
                        style={{ fontSize: "0.85rem", borderRadius: "20px" }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <hr />
                </>
              )}

              {isLoggedIn ? (
                <>
                  <div
                    className="d-flex justify-content-between align-items-center mb-2"
                    onClick={() => setAkunExpanded(!akunExpanded)}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                      &nbsp; Akunku
                    </span>
                    <span>{akunExpanded ? "⌄" : "›"}</span>
                  </div>

                  {akunExpanded && (
                    <div className="ms-4 mb-3">
                      <Link
                        to="/complete-profile"
                        className="d-block mb-2 text-decoration-none text-dark"
                        onClick={handleLinkClick}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: ICONS.user }}
                        />
                        &nbsp; Biodata
                      </Link>
                      <Link
                        to="/settings"
                        className="d-block mb-2 text-decoration-none text-dark"
                        onClick={handleLinkClick}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: ICONS.settings }}
                        />
                        &nbsp; Pengaturan & Privasi
                      </Link>
                    </div>
                  )}

                  <div
                    className="d-flex justify-content-between align-items-center mb-2"
                    onClick={() => setSumbangsihExpanded(!sumbangsihExpanded)}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      <span dangerouslySetInnerHTML={{ __html: ICONS.edit }} />
                      &nbsp; Sumbangsih
                    </span>
                    <span>{sumbangsihExpanded ? "⌄" : "›"}</span>
                  </div>

                  {sumbangsihExpanded && (
                    <div className="ms-4 mb-3">
                      <Link
                        to="/kronik"
                        className="d-block mb-2 text-decoration-none text-dark"
                        onClick={handleLinkClick}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: ICONS.kronik }}
                        />
                        &nbsp; Kronik
                      </Link>
                      <Link
                        to="/tilik"
                        className="d-block mb-2 text-decoration-none text-dark"
                        onClick={handleLinkClick}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: ICONS.tilik }}
                        />
                        &nbsp; Tilik
                      </Link>
                      <Link
                        to="/diskursus"
                        className="d-block mb-2 text-decoration-none text-dark"
                        onClick={handleLinkClick}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: ICONS.diskursus }}
                        />
                        &nbsp; Diskursus
                      </Link>
                      <Link
                        to="/tanggapan"
                        className="d-block mb-2 text-decoration-none text-dark"
                        onClick={handleLinkClick}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: ICONS.tanggapan }}
                        />
                        &nbsp; Tanggapan
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-2 text-muted">
                    <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                    &nbsp; Akunku
                  </div>
                  <div className="mb-2 text-muted">
                    <span dangerouslySetInnerHTML={{ __html: ICONS.edit }} />
                    &nbsp; Sumbangsih
                  </div>
                </>
              )}

              <Link
                to="/tentang"
                className="d-block mb-2 text-decoration-none text-dark"
                onClick={handleLinkClick}
              >
                <span dangerouslySetInnerHTML={{ __html: ICONS.info }} />
                &nbsp; Tentang Telisik
              </Link>

              <Link
                to="/bantuan"
                className="d-block mb-2 text-decoration-none text-dark"
                onClick={handleLinkClick}
              >
                <span dangerouslySetInnerHTML={{ __html: ICONS.help }} />
                &nbsp; Bantuan & Dukungan
              </Link>

              <hr />

              {isLoggedIn && (
                <Link
                  to="#"
                  className="d-block mb-2 text-decoration-none text-dark"
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: ICONS.logout }} />
                  &nbsp; Keluar Log
                </Link>
              )}

              <div className="mt-3">
                <button
                  className="btn btn-telisik w-100 d-flex align-items-center justify-content-center"
                  onClick={handleThemeToggle}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="me-2"
                  >
                    <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                  </svg>
                  Toggle Theme
                </button>
              </div>

              <div className="mt-3">
                <div className="urun-daya-container position-relative">
                  <button
                    className="btn btn-telisik d-flex align-items-center w-100"
                    onClick={() => setUrunDayaExpanded(!urunDayaExpanded)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="me-1"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 5l0 14" />
                      <path d="M5 12l14 0" />
                    </svg>
                    Urun Daya
                  </button>

                  <div
                    className={`urun-daya-dropdown ${urunDayaExpanded ? "show" : ""}`}
                  >
                    <Link
                      to="/urun-daya/kronik"
                      className="urun-daya-item"
                      onClick={() => handleLinkClick()}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: ICONS.kronik }}
                      />
                      &nbsp;Kronik
                    </Link>
                    <Link
                      to="/urun-daya/tilik"
                      className="urun-daya-item"
                      onClick={() => handleLinkClick()}
                    >
                      <span dangerouslySetInnerHTML={{ __html: ICONS.tilik }} />
                      &nbsp;Tilik
                    </Link>
                    <Link
                      to="/urun-daya/diskursus"
                      className="urun-daya-item"
                      onClick={() => handleLinkClick()}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: ICONS.diskursus }}
                      />
                      &nbsp;Diskursus
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
