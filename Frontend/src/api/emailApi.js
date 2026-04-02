
import axios from "axios";

const API = "http://127.0.0.1:5000";

export const predictEmail = async (emailText, userId="U001") => {
  const res = await axios.post(`${API}/analyze/email`, {
    email_text: emailText,
    user_id: userId
  });
  return res.data;
};

export const predictURL = async (urlText, userId="U001") => {
  const res = await axios.post(`${API}/analyze/url`, {
    url_text: urlText,
    user_id: userId
  });
  return res.data;
};

export const signup = async (email,password)=>{
  const res = await axios.post(`${API}/signup`,{email,password});
  return res.data;
};

export const login = async (email,password)=>{
  const res = await axios.post(`${API}/login`,{email,password});
  return res.data;
};

export const getHistory = async (userId)=>{
  const res = await axios.get(`${API}/history/${userId}`);
  return res.data;
};

export const adminLogin = async (email,password)=>{
  const res = await axios.post(`${API}/admin/login`,{email,password});
  return res.data;
};

export const getUsers = async ()=>{
  const res = await axios.get(`${API}/admin/users`);
  return res.data;
};

export const updateUserStatus = async (userId,status)=>{
  const res = await axios.post(`${API}/admin/update-status`,{
    user_id:userId,
    status:status
  });
  return res.data;
};

export const getAdminStats = async ()=>{
  const res = await axios.get(`${API}/admin/stats`);
  return res.data;
};
