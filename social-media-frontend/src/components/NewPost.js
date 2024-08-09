import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";

const Input = styled("input")({
  display: "none",
});

const ImgPreview = styled("img")({
  width: "500px",
  height: "500px",
  display: "flex",
  margin: "auto",
});

const FormContainer = styled(Box)(({ theme }) => ({
  "& > *": {
    margin: theme.spacing(1),
  },
}));

const NewPost = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleCaptionChange = (event) => {
    setCaption(event.target.value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("caption", caption);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(
        "http://localhost:4001/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      window.location.href = "/";
    } catch (error) {
      console.error("Error uploading the post", error);
    }
  };

  return (
    <Box mx={12} my={4}>
      <FormContainer component="form" onSubmit={handleSubmit}>
        <Box display={"flex"} justifyContent={"space-between"} my={3}>
          <Typography variant="h4" gutterBottom>
            Create a New Post
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component="span"
            onClick={() => (window.location.href = "/")}
          >
            Back to feed
          </Button>
        </Box>
        {preview && <ImgPreview src={preview} alt="Preview" />}
        {image && (
          <Box my={2}>
            <TextField
              label="Caption"
              variant="outlined"
              fullWidth
              value={caption}
              onChange={handleCaptionChange}
            />
          </Box>
        )}

        <Box display={"flex"} justifyContent={"space-between"} my={4}>
          <label htmlFor="image-upload">
            <Input
              accept="image/*"
              id="image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <Button
              variant="contained"
              color="primary"
              component="span"
              disabled={image}
            >
              Create post
            </Button>
          </label>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!image}
          >
            Submit
          </Button>
        </Box>
      </FormContainer>
    </Box>
  );
};

export default NewPost;
