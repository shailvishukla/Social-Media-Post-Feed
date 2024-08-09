import React, { useState } from "react";
import NewComment from "./NewComment";
import Comment from "./Comment";
import { Box, Typography, Card, CardMedia } from "@mui/material";

const Post = ({ post }) => {
  const [comments, setComments] = useState(post.comments || []);

  return (
    <Box>
      <Box display={"flex"}>
        <Card key={post.id} sx={{ marginTop: 4, marginBottom: 4 }}>
          {post.imagePath && (
            <CardMedia
              component="img"
              image={`http://localhost:4001/${post.imagePath}`}
              alt="Post Image"
              sx={{
                height: 500,
                width: 500,
                objectFit: "cover",
                margin: "auto",
              }}
            />
          )}
        </Card>
        <Box my={4} mx={6}>
          <Typography variant="h6" ml={1}>{post.caption}</Typography>
          <Box>
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </Box>
          <NewComment postId={post.id} />
        </Box>
      </Box>
    </Box>
  );
};

export default Post;
