document.addEventListener("DOMContentLoaded", function () {
  const newPost = document.querySelector("#post-form");
  if (newPost) {
    newPost.onsubmit = function (e) {
      e.preventDefault();

      let post = document.querySelector("#post").value;

      fetch("/post", {
        method: "POST",
        body: JSON.stringify({
          post: post,
        }),
      })
        .then((response) => response.json())
        .then((post) => {
          const postContainer = document.getElementById("all-posts");
          const sendPost = document.createElement("div");
          sendPost.setAttribute("class", "post-container");
          sendPost.innerHTML = `<h4 class="post-writer"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-person-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
				<path fill-rule="evenodd" d="M2 15v-1c0-1 1-4 6-4s6 3 6 4v1H2zm6-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
			</svg><a href=/profile/${post.user}><span class="capital">${post.user}</span></a></h4><a class="edit-btn noreload btn btn-light" data-id=${post.id}>Edit</a><div class="post-date">${post.timestamp}</div><div class="post-content noreload-edit">${post.post}</div><div class="like-number"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" /></svg><input class="post-like noreload-like-n" value="${post.like}"></div><div class="like"><a class="like-btn checked btn btn-secondary active noreload-like" data-postid="${post.id}">Like</a></div>`;
          postContainer.prepend(sendPost);

          let textarea = document.getElementById("post");
          textarea.value = " ";

          // Edit new post . Without reloading teh page

          document
            .querySelector(".noreload")
            .addEventListener("click", function () {
              let postId = this.dataset.id;

              fetch(`/post/${postId}`)
                .then((response) => response.json())
                .then((post) => {
                  // create popup for edit post without reloading the page
                  let editContainer = document.createElement("div");
                  editContainer.setAttribute("id", "edit-container");
                  editContainer.innerHTML = `<form id="submit_edit">
											<button id="close">x</button>
											<textarea id="edit" name="edit">${post.post}</textarea>
											<input class="btn btn-primary" type="submit">
											</form>`;

                  document.querySelector("body").append(editContainer);

                  if (editContainer) {
                    const close = document
                      .getElementById("close")
                      .addEventListener("click", function () {
                        editContainer.parentNode.removeChild(editContainer);
                      });
                  }

                  // submit edited post, without reloading the page
                  const submitEdit = document.getElementById("submit_edit");

                  submitEdit.onsubmit = function (e) {
                    e.preventDefault();
                    let edit = document.querySelector("#edit").value;

                    fetch(`/post/${postId}`, {
                      method: "POST",
                      body: JSON.stringify({
                        post: edit,
                      }),
                    })
                      .then((response) => response.json())
                      .then((edit) => {
                        editContainer.parentNode.removeChild(editContainer);
                        document.querySelector(
                          ".noreload-edit"
                        ).innerHTML = `${edit.post}`;
                      });
                  };
                });
            });

          // Change icon to like, unlike new post, without reloading the page

          let noreloadLike = document.querySelector(".noreload-like");
          let noreloadLikeNumber = document.querySelector(".noreload-like-n");

          noreloadLike.addEventListener("click", function () {
            let postId = this.dataset.postid;
            if (noreloadLike.innerHTML == "Like") {
              fetch(`/like/${postId}`)
                .then((response) => response.json())
                .then((result) => {
                  noreloadLike.innerHTML = "Unlike";
                  noreloadLike.setAttribute("id", "liked-post");
                  noreloadLike.classList.remove("like-btn");
                  parseInt(noreloadLikeNumber.value++);
                });
            }

            // Unlike post
            else if (noreloadLike.innerHTML == "Unlike") {
              fetch(`/unlike/${postId}`)
                .then((response) => response.json())
                .then((result) => {
                  noreloadLike.innerHTML = "Like";
                  noreloadLike.classList.remove("liked");
                  parseInt(noreloadLikeNumber.value--);
                });
            }
          });
        });
    };
  }

  // Edit - Like - unlike
  //GET /post/<int:post_id>
  const editPosts = document.querySelectorAll(".edit-btn");
  const postContents = document.querySelectorAll(".post-content");

  // edit posts
  for (let i = 0; i < editPosts.length; i++) {
    editPosts[i].addEventListener("click", function () {
      let postId = this.dataset.id;
      fetch(`/post/${postId}`)
        .then((response) => response.json())
        .then((post) => {
          // create popup for edit post
          let editContainer = document.createElement("div");
          editContainer.setAttribute("id", "edit-container");
          editContainer.innerHTML = `<form id="submit_edit">
											<button id="close">x</button>
											<textarea id="edit" name="edit">${post.post}</textarea>
											<input class="btn btn-primary" type="submit">
											</form>`;

          document.querySelector("body").append(editContainer);

          if (editContainer) {
            const close = document
              .getElementById("close")
              .addEventListener("click", function () {
                editContainer.parentNode.removeChild(editContainer);
              });
          }

          // submit edited post
          const submitEdit = document.getElementById("submit_edit");

          submitEdit.onsubmit = function (e) {
            e.preventDefault();
            let edit = document.querySelector("#edit").value;

            fetch(`/post/${postId}`, {
              method: "POST",
              body: JSON.stringify({
                post: edit,
              }),
            })
              .then((response) => response.json())
              .then((edit) => {
                editContainer.parentNode.removeChild(editContainer);
                postContents[i].innerHTML = `${edit.post}`;
              });
          };
        });
    });
  }

  // like post

  let likeBtns = document.querySelectorAll(".like-btn");
  let likeNumber = document.querySelectorAll(".post-like");

  for (let i = 0; i < likeBtns.length; i++) {
    likeBtns[i].addEventListener("click", function () {
      let postId = this.dataset.postid;
      if (likeBtns[i].innerHTML == "Like") {
        fetch(`/like/${postId}`)
          .then((response) => response.json())
          .then((result) => {
            likeBtns[i].innerHTML = "Unlike";
            likeBtns[i].setAttribute("id", "liked-post");
            likeBtns[i].classList.remove("like-btn");
            parseInt(likeNumber[i].value++);
          });
      }

      // Unlike post
      else if (likeBtns[i].innerHTML == "Unlike") {
        fetch(`/unlike/${postId}`)
          .then((response) => response.json())
          .then((result) => {
            likeBtns[i].innerHTML = "Like";
            likeBtns[i].classList.remove("liked");
            parseInt(likeNumber[i].value--);
          });
      }
    });
  }

  // follow - unfollow
  let followBtn = document.querySelector(".follow-btn");
  let followNumber = document.querySelector(".followers-num");

  let unfollowBtn = document.querySelector(".unfollow-btn");

  if (followBtn) {
    followBtn.addEventListener("click", function () {
      let userId = this.dataset.username;
      if (followBtn.innerHTML == "Follow") {
        fetch(`/follow/${userId}`)
          .then((response) => response.json())
          .then((result) => {
            followBtn.innerHTML = "Unfollow";
            followBtn.classList.add("unfollow-btn");
            followBtn.classList.remove("follow-btn");
            parseInt(followNumber.value++);
          });
      }

      if (followBtn.innerHTML == "Unfollow") {
        fetch(`/unfollow/${userId}`)
          .then((response) => response.json())
          .then((result) => {
            followBtn.innerHTML = "Follow";
            followBtn.classList.add("follow-btn");
            followBtn.classList.remove("unfollow-btn");
            parseInt(followNumber.value--);
          });
      }
    });
  }

  if (unfollowBtn) {
    unfollowBtn.addEventListener("click", function () {
      let userId = this.dataset.username;
      if (unfollowBtn.innerHTML == "Unfollow") {
        fetch(`/unfollow/${userId}`)
          .then((response) => response.json())
          .then((result) => {
            unfollowBtn.innerHTML = "Follow";
            unfollowBtn.classList.add("follow-btn");
            unfollowBtn.classList.remove("unfollow-btn");
            parseInt(followNumber.value--);
          });
      }

      if (unfollowBtn.innerHTML == "Follow") {
        fetch(`/follow/${userId}`)
          .then((response) => response.json())
          .then((result) => {
            unfollowBtn.innerHTML = "Unfollow";
            unfollowBtn.classList.add("unfollow-btn");
            unfollowBtn.classList.remove("follow-btn");
            parseInt(followNumber.value++);
          });
      }
    });
  }
});
