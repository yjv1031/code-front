import { Route, Routes, Link } from "react-router-dom";
import { commonStateStore } from './store/commonStore';
import LoginMain from "./pages/login/LoginMain";
import DashBoard from "./pages/dash_board/DashBoard";
import ImageMain from "./pages/image/ImageMain";
import { useEffect, useState } from "react";
import router from "./module/router"; 

function CommonLayout() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const { currentMenuKey } = commonStateStore();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');

    if(adminToken) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, []);

  const tryLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = `${process.env.REACT_APP_CONTEXT_PATH}/`;
    //상태 갱신용 리로드
    window.location.reload();
  }
  
  return (
    isLogin ? (
      <div className="wrap">
        <div className="header_wrap">
            <div className="logo_area"><h1><a className="">랜덤캡슐</a></h1></div>
            <div className="menu_area">
                <div className="menu_slide_wrap">
                    <ul>
                        {
                          router.map((item) => {
                            return (
                              <li key={item.menuKey} className={currentMenuKey == item.menuKey ? 'active' : ''}>
                                <Link to={`${item.path}`}>{item.menu}</Link>
                              </li>
                            )
                          })
                        }
                    </ul>
                </div>
            </div>
        
            <div className="util_area">
                <div className="btn_admin btn_layer">
                  <a onClick={tryLogout}>LOG OUT</a>
                </div>
            </div>
        </div>
        <div className="contents_wrap">
          <Routes>
            {
              router.map((item) => {
                return (
                  <Route key={item.menuKey} path={item.path} element={<item.element/>} />      
                )
              })
            }
          </Routes>
        </div>
        <div className="footer_wrap">
            <div className="footer_left">Copyright © 2099-2099 TEST TEST TEST</div>
            <div className="footer_right">
                <ul>
                    <li>IT-VOC</li>
                    <li>User Manuals</li>
                    <li>Contact Us</li>
                </ul>
            </div>
        </div>
    </div>
    ) : (
      <LoginMain></LoginMain>
    )
  );
}

export default CommonLayout;
