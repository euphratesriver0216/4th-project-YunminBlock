import React, {useState,useEffect} from "react"
import axios from "axios"
import {Button} from "antd";

function Port1(){
    const [블록, set블록] = useState("")
const [chainBlocks, setChainBlocks]= useState([])

const connect = async () => {
    await axios.get(`/api/blocks`).then((req)=>setChainBlocks(req.data))
}


return (
    <Button onClick={connect}>이게 되려나 </Button>
)
 }

 export default Port1;
