import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Button,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Post from "./Post";
import io from "socket.io-client";

const socket = io("http://localhost:4001");

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();

    // Setup socket listeners
    const handleNewPost = (post) => {
      setPosts((prevPosts) => [post, ...prevPosts]);
    };

    const handleNewComment = (comment) => {
      setPosts((prevPosts) => {
        const postIndex = prevPosts.findIndex(
          (post) => post.id === comment.postId
        );
        if (postIndex >= 0) {
          const updatedPosts = [...prevPosts];
          const post = updatedPosts[postIndex];

          // checking if comment already exists
          if (!post.comments.some((c) => c.id === comment.id)) {
            post.comments.push(comment);
          }

          return updatedPosts;
        }
        return prevPosts;
      });
    };

    const handleReceivePosts = (newPosts) => {
        setPosts((prevPosts) => {
          // Filter out any duplicate posts
          const uniquePosts = newPosts.filter(
            (newPost) => !prevPosts.some((post) => post.id === newPost.id)
          );
          return [...prevPosts, ...uniquePosts];
        });
  
        if (newPosts.length === 0) {
          setHasMore(false);
          setOpenSnackbar(true);
        }
  
        setLoading(false);
    };

    socket.on("newPost", handleNewPost);
    socket.on("newComment", handleNewComment);
    socket.on("receivePost", handleReceivePosts);

    return () => {
      socket.off("newPost", handleNewPost);
      socket.off("newComment", handleNewComment);
      socket.off("receivePost", handleReceivePosts);
    };
  }, []);

  const fetchPosts = async () => {
    if (loading) return;
    setLoading(true);

    try {

        console.log("called get post socket");
        socket.emit("getPost", { page: page, limit : 10});
        setPage(page + 1);


    //   const response = await axios.get(
    //     `http://localhost:4001/posts?page=${page}&limit=10`
    //   );
    //   const newPosts = response.data.rows;

    //   if (newPosts.length === 0) {
    //     setHasMore(false);
    //     setOpenSnackbar(true);
    //   } else {
    //     setPosts((prevPosts) => {
    //       // filtered duplicate posts
    //       const uniquePosts = newPosts.filter(
    //         (newPost) => !prevPosts.some((post) => post.id === newPost.id)
    //       );
    //       return [...prevPosts, ...uniquePosts];
    //     });
    //     setPage(page + 1);
    // }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }

    setLoading(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box mx={12} my={4}>
      <Box display={"flex"} justifyContent={"space-between"} my={3}>
        <Typography variant="h4" gutterBottom>
          Post Feed
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component="span"
          onClick={() => (window.location.href = "/new")}
        >
          New post
        </Button>
      </Box>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchPosts}
        hasMore={hasMore}
        loader={<CircularProgress />}
        endMessage={
          <Typography variant="body2" color="textSecondary" align="center">
            No more posts
          </Typography>
        }
      >
        {posts.map((post) => (
          <Post post={post} />
        ))}
      </InfiniteScroll>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="No more posts available"
      />
    </Box>
  );
};

export default PostFeed;
