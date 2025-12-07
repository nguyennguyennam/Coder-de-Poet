import axios from "axios";

const apiCourse = axios.create({
  baseURL: process.env.REACT_APP_COURSE_SERVICE_URL,
  withCredentials: true,
});

console.log("apiCourse baseURL:", process.env.REACT_APP_COURSE_SERVICE_URL);

export default apiCourse;
