// src/api/userApi.js
import axios from 'axios';

// 공통 axios 주소
const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // 백엔드 Flask 주소
});

//test 호출 나중에 삭제
export async function Test_api() {
  const res = await api.get('/test');
  return res.data;   // { msg: "Flask OK " }
}

//users GET 호출 작동 잘하는지 확인용 나중애 삭제
export async function User_api() {
  const res = await api.get('/users');
  return res.data;
}


// 닉네임 이메일 중복 체크 API (실시간) user.py
export async function Id_Check(type, value) {
  const res = await api.get(`/users/check/${type}`, {
    params: { value }
  });
  return res.data;  // 데이터형식  예시 { 가능여부: true/false, 에러메세지 : "..." }
}



// 회원가입 API
export async function New_User(formData) {
  const res = await api.post('/users', formData);
  return res.data;  // 데이터형식  예시 {성공여부 :메세지}
}


////user POST 호출
//export async function createUser(nickname, email) {
//  const res = await api.post('/users', { nickname, email });
//  return res.data;
//}