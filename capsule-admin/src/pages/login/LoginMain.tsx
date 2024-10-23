import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { commonStateStore } from '../../store/commonStore';
import { produce } from 'immer';
import { userLoginInputInterface } from '../../module/interfaceModule';

function LoginMain() {
  const [userLoginState, setUserLoginState] = useState<userLoginInputInterface>({loginId: '', loginPwd: ''});
  const { commonAjaxWrapper } = commonStateStore();
  const loginIdChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUserLoginState(produce(userLoginState, (draft) => {
      draft.loginId = e.target.value;
    }));
  };

  const loginPwdChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setUserLoginState(produce(userLoginState, (draft) => {
      draft.loginPwd = e.target.value;
    }));
  };

  const passwordKeyUpHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      tryLogin();
    }
  }

  const tryLogin = async() => {
    const loginId: string = userLoginState.loginId;
    const loginPwd: string = userLoginState.loginPwd;
    if(!loginId) {
      alert('아이디를 입력하십시오');
      return;
    }

    if(!loginPwd) {
      alert('패스워드를 입력하십시오');
      return;
    }

    const param = {
      id: loginId,
      password: loginPwd
    };

    const data = await commonAjaxWrapper('post', '/public/token/login', param);
    if(data) {
      alert('로그인을 성공하였습니다');
      localStorage.setItem('adminToken', JSON.stringify(data));
      setUserLoginState({loginId: '', loginPwd: ''});
      window.location.href = `${process.env.REACT_APP_CONTEXT_PATH}/`;
    }
  };

  return (
    <main className="login_main">
      <div className="box">
        <h1>로그인</h1>
        <section className="login_section">
          <label htmlFor="adminLoginInput" className="login_label">아이디</label>
          <input type="text" id="adminLoginInput" className="login_input" value={userLoginState.loginId} onChange={loginIdChangeHandler}/>
          <label htmlFor="adminLoginPwd" className="login_label">패스워드</label>
          <input type="password" id="adminLoginPwd" className="login_input" value={userLoginState.loginPwd} onChange={loginPwdChangeHandler}
          onKeyUp={passwordKeyUpHandler}/>
        </section>
        <section className="login_section login_btn_area">
          <button className="login_access_btn" onClick={tryLogin}>로그인</button>
        </section>
      </div>
    </main>
  );
}

export default LoginMain;
