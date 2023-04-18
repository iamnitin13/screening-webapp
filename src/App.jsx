import { useCallback, useRef, useState } from "react";
import "./App.scss";

function App() {
  const videoRef = useRef();
  const mediaStreamRef = useRef();
  const dataStream = useRef([]);
  const mediaRecorder = useRef();
  const urlRef = useRef();
  const [status, setStatus] = useState({ btn: "both", panel: false });
  const [timer, setTimer] = useState({
    minutes: 5,
    seconds: 0,
    bgColor: "black",
    show: false,
  });
  const intervalRef = useRef();
  const previewRef = useRef();

  const handlePermission = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, panel: true, btn: "start" }));
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      videoRef.current.srcObject = mediaStreamRef.current;
    } catch (error) {
      console.error("error logged", error);
    }
  }, []);

  const handleStartVideo = () => {
    if (!mediaStreamRef.current) return;
    mediaRecorder.current = new MediaRecorder(mediaStreamRef.current);
    setStatus((prev) => ({ ...prev, btn: "save" }));
    startTimer();
    mediaRecorder.current.start(1000);
    mediaRecorder.current.ondataavailable = (e) =>
      dataStream.current.push(e.data);
  };

  const handleSaveVideo = () => {
    setTimer((prevTimer) => {
      clearInterval(intervalRef.current);
      return { ...prevTimer, show: false };
    });
    setStatus((prev) => ({ ...prev, btn: "both" }));
    mediaRecorder.current.stop();
    mediaStreamRef.current.getTracks().forEach((track) => track.stop());

    const blob = new Blob(dataStream.current, { type: "video/webm" });
    urlRef.current = URL.createObjectURL(blob);
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        const { minutes, seconds } = prevTimer;
        if (minutes === 0 && seconds === 0) {
          clearInterval();
          return prevTimer;
        }
        if (seconds === 0) {
          return {
            ...prevTimer,
            minutes: minutes - 1,
            seconds: 59,
            bgColor: minutes <= 2 ? "red" : "black",
          };
        }
        return {
          ...prevTimer,
          seconds: seconds - 1,
          bgColor: minutes <= 2 ? "red" : "black",
          show: seconds > 0 ? true : false,
        };
      });
    }, 1000);
  };

  return (
    <div className="container">
      {/* record video and save video */}
      <div className="container__record">
        {/* show count down of 5min once started */}
        <h2>Record Assessment</h2>
        {timer.show ? (
          <div className="timer" style={{ background: timer.bgColor }}>
            {`${timer.minutes}:${timer.seconds < 10 ? "0" : ""}${
              timer.seconds
            }`}
          </div>
        ) : null}

        {!status.panel ? (
          // camera and audio permission before starting
          <button className="btn btn--permi" onClick={handlePermission}>
            Give Permission
          </button>
        ) : (
          // open camer and start the recording
          <>
            <video muted ref={videoRef} autoPlay />
            <div className="container__record__btn">
              <button
                className="btn btn--primary"
                onClick={handleStartVideo}
                disabled={true && status.btn !== "start"}
              >
                Start
              </button>
              <button
                className="btn btn--secondary"
                onClick={handleSaveVideo}
                disabled={true && status.btn !== "save"}
              >
                Save & Submit
              </button>
              <button className="btn btn--secondary" onClick={handlePermission}>
                Restart
              </button>
            </div>
          </>
        )}
      </div>

      {/* divider  */}
      <hr className="divider" />

      {/* View Recorded Video */}

      <div className="container__preview">
        <h2>View Recorded Video</h2>
        <video src={urlRef.current} controls ref={previewRef} />
        <button
          className="btn btn--secondary"
          onClick={() => (previewRef.current.src = null)}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default App;
