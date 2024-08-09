import React, { useState } from "react";
import axiosInstance from "./axiosInstance";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/system";

const FormContainer = styled(Box)(({ theme }) => ({
  "& > *": {
    margin: theme.spacing(1),
  },
}));

const NewComment = ({ postId }) => {
  const [userComment, setUserComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axiosInstance.post(`/posts/${postId}/comments`, {
      userId: 1,
      userComment,
    });
    setUserComment("");
  };

  return (
    <FormContainer component="form" onSubmit={handleSubmit}>
      <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
        <Box width="500px">
          <TextField
            label="Comment"
            variant="outlined"
            fullWidth
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
          />
        </Box>
        <Box mx={2}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!userComment}
          >
            Comment
          </Button>
        </Box>
      </Box>
    </FormContainer>
  );
};

export default NewComment;
