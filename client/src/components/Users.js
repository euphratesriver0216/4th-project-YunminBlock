import axios from "axios";
import React, { useState, useEffect } from "react";

export default function GetPost(props) {
  const [test, setTest] = useState(0);
  useEffect(() => {
    const getAllBlocks = async () => {
      await axios
        .get("http://localhost:3001/blocks")
        .then((response) => {
          console.log(response.data);
          console.log(response.data.length);
          setTest(response.data.length);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    getAllBlocks();
  }, [props.blocks]);

  return <div>{test}</div>;
}
