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

function Main() {
  const { user, selectedItem } = useContext(userContext);
  const [urls, setUrl] = useState([]);

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
  return (
    <div>
      <div>
        <h3 className="selectedItem">{selectedItem}</h3>
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
                  <li className="audios" key={i}>
                    <>
                      <audio src={url} controls autoPlay={false}></audio>
                      <div className="fileDetail">
                        <span>{name}</span>
                        <span>{fileSize}</span>
                      </div>
                    </>
                  </li>
                )}
                {selectedItem == "Videos" && (
                  <li className="videos" key={i}>
                    <>
                      <video src={url} controls autoPlay={false}></video>
                      <div className="fileDetail">
                        <span>{name}</span>
                        <span>{fileSize}</span>
                      </div>
                    </>
                  </li>
                )}
                {selectedItem == "Documents" && (
                  <li className="Document" key={i}>
                    <>
                      <a href={url} controls autoPlay={false} download>
                        {name}
                      </a>
                      <div className="fileDetail">
                        {/* <span>{fileSize}</span> */}
                      </div>
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
  const uploadingStatusRef = useRef();
  const uploadBtnRef = useRef();

  const uploadFile = async () => {
    if (imgInputRef.current.files && imgInputRef.current.files.length > 0) {
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
          setTimeout(() => {
            uploadingStatusRef.current.style.visibility = "hidden";
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
          <button
            ref={uploadBtnRef}
            onClick={uploadFile}
            className="btnUpload"
            type="button"
          >
            Upload
          </button>
          <div ref={uploadingStatusRef} style={{ visibility: "hidden" }}>
            uploading...
          </div>
        </div>
      </div>
    </>
  );
}
