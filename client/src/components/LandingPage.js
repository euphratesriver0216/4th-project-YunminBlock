import React, {useState,useEffect} from "react"
import axios from "axios"

function LandingPage(){
    useEffect(()=>{
        axios.get('/api/blocks').then(response =>console.log(response.data))
    })
return (
   <div>LandingPage 렌딩페이지요</div>
)
 }

 export default LandingPage;
