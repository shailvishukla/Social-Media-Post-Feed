import { Typography, Box } from "@mui/material";
import React from "react";

const Comment = ({ comment }) => {
  return (
    <Box mx={1}>
      <Typography>{comment.userComment}</Typography>
    </Box>
  );
};

export default Comment;