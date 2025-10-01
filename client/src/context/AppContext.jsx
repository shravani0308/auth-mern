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

  axios.defaults.withCredentials= true;

const getAuthState=async()=>{
  try {
    const{data}=await axios.get(backendUrl + '/api/auth/is-auth')
    if(data.success){
      setIsLoggedin(true)
      getUserData()
    }
  } catch (error) {
    toast.error(error.message)
  }
}

  const getUserData=async ()=>{
   try{
     const {data}= await axios.get(backendUrl + '/api/user/data',{withCredentials:true})
     data.success ? setuserData(data.userData):toast.error(data.message)
   }
    catch(error){
    toast.error(error.message)
   }
   
  }

  useEffect(()=>{
    getAuthState();
  })

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