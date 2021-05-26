const myVideo = document.createElement("video");
myVideo.muted = true;
myVideo.autoplay = true;
videoGrid = document.getElementById("video-grid");
const socket = io("/");
let user = "";
while (user.length == 0) {
  user = prompt("Enter Your Name", "");
}

var peer = new Peer(undefined, {
  path: "/peerjs",
  port: "3030",
  host: "/",
});

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      video.autoplay = true;
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  console.log("new user" + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  video.autoplay = true;
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
};

let text = $("input");

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length > 0) {
    console.log(text.val());
    socket.emit("message", text.val(), user);
    text.val("");
  }
});

socket.on("createMessage", (msg, sender) => {
  $(".messages").append(`<li class="message"><b>${sender}:</b> ${msg}</li>`);
  scrollBottom();
  scrollBottom();
});
const scrollBottom = () => {
  let d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  console.log(myVideoStream);
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    setUnmuteButton();
    myVideoStream.getAudioTracks()[0].enabled = false;
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i>
  <span>Unmute</span>`;
  document.querySelector(".mute__button").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
  <span>Mute</span>`;
  document.querySelector(".mute__button").innerHTML = html;
};

const playStop = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    setPlayVideo();
    myVideoStream.getVideoTracks()[0].enabled = false;
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class="play fas fa-video-slash"></i>
  <span>Start Video</span>`;
  document.querySelector(".video__button").innerHTML = html;
};
const setStopVideo = () => {
  const html = `<i class=" fas fa-video"></i>
  <span>Stop Video</span>`;
  document.querySelector(".video__button").innerHTML = html;
};
