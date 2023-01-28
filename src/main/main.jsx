import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { listAll, ref, getStorage } from "firebase/storage";
import "./style.css";
import { userContext } from "../App";
import convert from "image-file-resize";
import { BsPlay, BsPause, BsCloudUpload } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { FcMusic } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
let interval = null;
function Main() {
  const { user, selectedItem } = useContext(userContext);
  const [urls, setUrl] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState({
    url: null,
    state: null,
  });
  const playerRef = useRef();
  const audioRef = useRef();
  const getUserData = useCallback(async () => {
    const storage = getStorage();
    const listRef = ref(storage, `${user.email}/${selectedItem}`);
    const userFile = await listAll(listRef);
    const { getDownloadURL, getMetadata } = await import("firebase/storage");
    const tempUrl = [];
    if (userFile.items.length == 0) {
      setUrl([]);
      return;
    }
    await userFile.items.forEach(async (file, i) => {
      const url = await getDownloadURL(file);
      const { contentType, name, size } = await getMetadata(file);
      let sizeInKB = size / 1024;
      const fileInfo = {
        url,
        fileFormat: contentType.split("/")[1],
        name,
        fileSize:
          sizeInKB >= 1000
            ? `${Math.round(Number(sizeInKB) / 1024)} MB`
            : `${Math.round(sizeInKB)}KB`,
      };
      tempUrl.push(fileInfo);
      if (i == userFile.items.length - 1) {
        setUrl(tempUrl);
      }
    });

    return tempUrl;
  }, [selectedItem]);

  useEffect(() => {
    console.log("renered");
    getUserData();
  }, [selectedItem]);

  const hidePlayer = () => {
    playerRef.current.style.visibility =
      playerRef.current.style.visibility == "hidden"
        ? (() => {
            audioRef.current.play();
            let selectedMusicTemp = { ...selectedMusic, state: "playing" };
            setSelectedMusic(selectedMusicTemp);
            return "visible";
          })()
        : (() => {
            audioRef.current.pause();
            let selectedMusicTemp = { ...selectedMusic, state: "paused" };
            setSelectedMusic(selectedMusicTemp);
            return "hidden";
          })();
  };

  const startPreview = (e) => {
    e.target.muted = true;
    e.target.currentTime = 1;
    e.target.playbackRate = 1.5;
    e.target.play();
    interval = setInterval(() => {
      e.target.currentTime += 1;
      e.target.play();
    }, 500);
  };

  const stopPreview = (e) => {
    if (interval) clearInterval(interval);
    e.target.currentTime = 0;
    e.target.playbackRate = 1;
    e.target.pause();
  };

  return (
    <div>
      <div className="sWrapper">
        <h3>{selectedItem}</h3>
      </div>
      <div className={!urls.length && "empty"}>
        {!urls.length && <div>You don't have any uploaded {selectedItem}</div>}
      </div>
      <div>
        <ul className="fileWrapper">
          {urls.length > 0 &&
            urls.map(({ url, name, fileSize }, i) => (
              <>
                {selectedItem == "Images" && (
                  <li key={i}>
                    <img style={{ width: "100%" }} src={url} alt="" />
                    <div className="fileDetail">
                      <span>{name}</span>
                      <span>{fileSize}</span>
                    </div>
                  </li>
                )}
                {selectedItem == "Audios" && (
                  <li key={i}>
                    <>
                      <div className="fileDetail">
                        <div
                          className="audios"
                          onClick={() =>
                            setSelectedMusic({ url, name, state: "playing" })
                          }
                          style={{
                            overflowX: "hidden",
                          }}
                        >
                          <button
                            style={{
                              padding: "5px",
                              border: "none",
                              backgroundColor: "#fff",
                            }}
                          >
                            <FcMusic />{" "}
                          </button>{" "}
                          {name}
                        </div>
                        <pre>{fileSize}</pre>
                      </div>
                    </>
                  </li>
                )}
                {selectedItem == "Videos" && (
                  <li key={i}>
                    <>
                      <video
                        style={{
                          width: "100%",
                        }}
                        src={url}
                        controls={false}
                        autoPlay={false}
                        preload="metadata"
                        onMouseEnter={startPreview}
                        onMouseOut={stopPreview}
                      ></video>
                      <div className="fileDetail">
                        <span>{name}</span>
                        <span>{fileSize}</span>
                      </div>
                    </>
                  </li>
                )}
                {selectedItem == "Documents" && (
                  <li className="" key={i}>
                    <>
                      <div className="fileDetail">
                        <a href={url} download>
                          {name}
                        </a>
                        <span>{fileSize}</span>
                      </div>
                    </>
                  </li>
                )}
              </>
            ))}
        </ul>
      </div>
      {selectedItem == "Audios" && (
        <>
          <div ref={playerRef} className="player">
            {selectedMusic.url && (
              <>
                <>
                  {selectedMusic.state == "paused" ? (
                    <button
                      onClick={() => {
                        let res = audioRef.current.play();
                        let setectedTemp = {
                          ...selectedMusic,
                          state: "playing",
                        };
                        setSelectedMusic(setectedTemp);
                      }}
                    >
                      <BsPlay />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        audioRef.current.pause();
                        let setectedTemp = {
                          ...selectedMusic,
                          state: "paused",
                        };
                        setSelectedMusic(setectedTemp);
                      }}
                    >
                      <BsPause />
                    </button>
                  )}{" "}
                </>
                <audio
                  className="audioPlayer"
                  ref={audioRef}
                  src={selectedMusic.url}
                  controls
                  autoPlay={true}
                ></audio>
                <span className="musicName">{selectedItem.name}</span>
              </>
            )}{" "}
          </div>
          <button onClick={hidePlayer} className="cancel">
            <MdCancel />
          </button>
        </>
      )}
    </div>
  );
}

export default Main;

export function UploadFiles() {
  const { user } = useContext(userContext);
  const imgInputRef = useRef();
  const noFilesRef = useRef();
  const uploadingStatusRef = useRef();
  const uploadBtnRef = useRef();

  const uploadFile = async (e) => {
    if (imgInputRef.current.files && imgInputRef.current.files.length > 0) {
      imgInputRef.current.disabled = true;
      e.target.disabled = true;
      uploadingStatusRef.current.style.visibility = "visible";
      const { getStorage, ref, uploadBytes } = await import("firebase/storage");
      const storage = getStorage();
      Array.from(imgInputRef.current.files).forEach(async (file, i) => {
        let type = file.type.split("/")[0];
        let directoryName = null;
        if (type === "image") {
          directoryName = "Images";
        }
        if (type === "video") {
          directoryName = "Videos";
        }
        if (type === "audio") {
          directoryName = "Audios";
        }
        if (!directoryName) {
          directoryName = "Documents";
        }
        const metadata = {
          customMetadata: {
            owner: user.email,
          },
        };
        const storageRef = ref(
          storage,
          `${user.email}/${directoryName}/${file.name}`
        );

        let reduced = null;
        if (type == "image") {
          reduced = await convert({
            file,
            width: 600,
            height: 400,
            type: "jpeg",
          });
        }
        if (type == "image" && reduced) {
          const uploadTask = await uploadBytes(storageRef, reduced, metadata);
          console.log(uploadTask);
        }
        const uploadTask = await uploadBytes(storageRef, file, metadata);
        console.log(uploadTask);
        if (i == imgInputRef.current.files.length - 1) {
          uploadingStatusRef.current.style.visibility = "visible";
          uploadingStatusRef.current.innerText = `${imgInputRef.current.files.length} files uploaded`;
          toast(`you have uploaded ${imgInputRef.current.files.length} files`);
          setTimeout(() => {
            imgInputRef.current.disabled = false;
            e.target.disabled = false;
            uploadingStatusRef.current.style.visibility = "hidden";
            imgInputRef.current.value = null;
          }, 1000);
        }
      });
    }
  };
  const diplayNoOfFile = () => {
    if (imgInputRef.current.files) {
      noFilesRef.current.innerText = `${imgInputRef.current.files.length} files`;
    }
  };
  return (
    <>
      <div className="uploadingArea">
        <h4>
          <button>
            <BsCloudUpload />
          </button>
        </h4>
        <input
          style={{ color: "transparent" }}
          className="fileSelect"
          ref={imgInputRef}
          type="file"
          multiple={true}
          onChange={diplayNoOfFile}
        />
        <div ref={noFilesRef} className="noOfFiles">
          0 files
        </div>
        <div>
          <button
            ref={uploadBtnRef}
            onClick={uploadFile}
            className="btnUpload"
            type="button"
          >
            Upload
          </button>
          <ToastContainer
            position="bottom-right"
            newestOnTop
            pauseOnHover
            autoClose={5000}
            theme="dark"
          />

          <div ref={uploadingStatusRef} style={{ visibility: "hidden" }}>
            uploading...
          </div>
        </div>
      </div>
    </>
  );
}
