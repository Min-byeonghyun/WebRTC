import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 30px;
`;

const Vi = styled.video`
  width: 480px;
  height: 360px;
  background-color: #000;
  margin-bottom: 20px;
`;

const Btn = styled.button`
  margin: 5px;
  padding: 10px 20px;
  cursor: pointer;
`;

function App() {
  const videoRef = useRef(null); // 실시간 웹캠 영상 보여줄 비디오
  const recordedRef = useRef(null); // 녹화된 영상을 재생할 비디오
  const mediaRecorderRef = useRef(null); // 미디어레코더 객체 저장(녹화시작/ 중지 제어용)
  const [stream, setStream] = useState(null); //getUserMedia로 가져온 카메라 마이크 스트림 저장 , 웹캠 마이크 스트림 저장해 비디오에 연결하거나 MediaRecorder에 전달
  const [isRecording, setIsRecording] = useState(false); // 현재 녹화 중인지 여부
  const [videoURL, setVideoURL] = useState(""); // Blob으로 만든 녹화 영상 URL (video 태그에서 src로 사용)
  const recordedChunksRef = useRef([]); // 녹화된 데이터 저장

  // ✅ 웹캠 가져오기
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          // getUserMedia: 사용자의 웹캠(비디오) + 마이크(오디오) 권한을 요청하는 함수.
          video: true,
          audio: true,
        });
        videoRef.current.srcObject = mediaStream; //videoRef.current.srcObject = mediaStream: 웹캠에서 받아온 실시간 영상 video태그에 연결
        setStream(mediaStream); // 녹화에 쓰일 state 따로 저장
      } catch (err) {
        console.error("카메라 접근 실패:", err);
      }
    };
    initCamera();
  }, []);

  // 녹화 시작
  const startRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = []; // 새로운 녹화를 위해 이전 데이터 초기화

    const options = { mimeType: "video/webm; codecs=vp9" }; //
    const recorder = new MediaRecorder(stream, options);

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    };

    recorder.start();
    setIsRecording(true);
  };

  // 녹화 중지
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // 다운로드
  const downloadRecording = () => {
    if (!videoURL) return;
    const a = document.createElement("a");
    a.href = videoURL;
    a.download = "녹화본.webm";
    a.click();
  };

  return (
    <Wrapper>
      <Title>WebRTC</Title>
      <Vi ref={videoRef} autoPlay muted />
      {videoURL && <Vi ref={recordedRef} src={videoURL} controls />}
      <div>
        <Btn onClick={startRecording} disabled={isRecording}>
          녹화 시작
        </Btn>
        <Btn onClick={stopRecording} disabled={!isRecording}>
          녹화 중지
        </Btn>
        <Btn onClick={downloadRecording} disabled={!videoURL}>
          다운로드
        </Btn>
      </div>
    </Wrapper>
  );
}

export default App;
