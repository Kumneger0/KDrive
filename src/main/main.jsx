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

function Main() {
  const { user, selectedItem } = useContext(userContext);
  const [urls, setUrl] = useState([]);

  const getUserData = useCallback(async () => {
    const storage = getStorage();
    const listRef = ref(storage, `${user.email}/${selectedItem}`);
    const userFile = await listAll(listRef);
    const { getDownloadURL } = await import("firebase/storage");
    const tempUrl = [];
    if (userFile.items.length == 0) {
      setUrl([]);
      return;
    }
    await userFile.items.forEach(async (file, i) => {
      const url = await getDownloadURL(file);
      tempUrl.push(url);
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
  return (
    <div>
      <div>
        <h3 className="selectedItem">{selectedItem}</h3>
      </div>
      <div>
        <ul className="fileWrapper">
          {urls.length > 0 &&
            urls.map((url, i) => (
              <>
                {selectedItem == "Images" && (
                  <li key={i}>
                    <img style={{ width: "100%" }} src={url} alt="" />
                  </li>
                )}
                {selectedItem == "Audios" && (
                  <li className="audios" key={i}>
                    <>
                      <audio src={url} controls autoPlay={false}></audio>
                    </>
                  </li>
                )}
                {selectedItem == "Videos" && (
                  <li className="video" key={i}>
                    <>
                      <video src={url} controls autoPlay={false}></video>
                    </>
                  </li>
                )}
              </>
            ))}
        </ul>
      </div>
      <UploadFiles />
    </div>
  );
}

export default Main;

function UploadFiles() {
  const { user } = useContext(userContext);
  const imgInputRef = useRef();
  const noFilesRef = useRef();
  const uploadFile = async () => {
    if (imgInputRef.current.files && imgInputRef.current.files.length > 0) {
      const { getStorage, ref, uploadBytes } = await import("firebase/storage");
      const storage = getStorage();
      Array.from(imgInputRef.current.files).forEach(async (file) => {
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
        const uploadTask = await uploadBytes(storageRef, file, metadata);
        console.log(uploadTask);
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
      <div className="UploadFilesStyle">
        <h3>Upload new file</h3>
        <input
          style={{ color: "transparent" }}
          ref={imgInputRef}
          type="file"
          multiple={true}
          onChange={diplayNoOfFile}
        />
        <div ref={noFilesRef} className="noOfFiles">
          0 files
        </div>
        <div>
          <button onClick={uploadFile} className="btnUpload" type="button">
            Upload
          </button>
        </div>
      </div>
    </>
  );
}
