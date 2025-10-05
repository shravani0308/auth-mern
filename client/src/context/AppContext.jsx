import { createContext,  useState } from "react"
import axios from 'axios'
import{toast} from 'react-toastify'
import { useEffect } from "react"

export const AppContent = createContext()

export const AppContextProvider =(props)=>{

  axios.defaults.withCredentials= true;

  const backendUrl =import.meta.env.VITE_BACKEND_URL
  const[isLoggedin,setIsLoggedin]=useState(false)
  const[userData,setuserData]=useState(false)


  const getUserData=async ()=>{
   try{
     const {data}= await axios.get(backendUrl + '/api/user/data')
     data.success ? setuserData(data.userData):toast.error(data.message)
        
     if (data.success) {
       setuserData(data.userData);
       setIsLoggedin(true);
     } else {
       toast.error(data.message);
       setIsLoggedin(false);
     }}
    catch(error){
    toast.error(error.message)
   }
   
  }

  useEffect(()=>{
    getUserData();
  }, [])

   const value={
     backendUrl,
     isLoggedin,setIsLoggedin,
     userData,setuserData,
     getUserData
   }

    return(
        <AppContent.Provider value={value}>
         { props.children}
        </AppContent.Provider>
    )
}