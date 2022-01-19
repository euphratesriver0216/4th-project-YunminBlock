import React, { useState } from "react";
import axios from "axios";
import BlockDefault from "./Block";

function Port1() {
  const [HaBlocks, setHaBlocks] = useState([]);
  const onSubmitBlock = (e) => {
    e.preventDefault();
    axios.get("/api/blocks").then((response) => {
      if (response.data) {
        setHaBlocks(response.data);
      } else {
        alert("실패");
      }
    });
  };
  console.log(HaBlocks);
  return (
    <>
      <form onSubmit={onSubmitBlock}>
        <button>블럭가져오기</button>
        <BlockDefault HaBlocks={HaBlocks} />
      </form>
      <div>어디있어</div>
    </>
  );
}

export default Port1;
