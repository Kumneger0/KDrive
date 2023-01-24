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
  const [urls, setUrl] = useState([
    "hello",
    "hi",
    "hww",
    "hello",
    "hi",
    "hww",
    "hello",
    "hi",
    "hww",
    "hello",
    "hi",
    "hww",
    "hello",
    "hi",
    "hww",
    "hello",
    "hi",
    "hww",
    "hello",
    "hi",
    "hww",
    "hello",
    "hi",
    "hww",
  ]);
  const getUserData = useCallback(async () => {
    const storage = getStorage();
    const listRef = ref(storage, `${user.email}/${selectedItem}`);
    const userFile = await listAll(listRef);
    const { getDownloadURL } = await import("firebase/storage");
    const tempUrl = [];
    userFile.items.forEach(async (file) => {
      const url = await getDownloadURL(file);
      tempUrl.push(url);
    });

    // setUrl(tempUrl);
    return tempUrl;
  }, [selectedItem]);

  useEffect(() => {
    getUserData();
  }, [selectedItem]);

  console.log("urls", urls);
  return (
    <div>
      <div>
        <h3 className="selectedItem">{selectedItem}</h3>
      </div>
      <div>
        <ul className="fileWrapper">
          {urls.length > 0 &&
            urls.map((url, i) => (
              <li key={i}>
                <img
                  style={{ width: "100%" }}
                  src="https://firebasestorage.googleapis.com/v0/b/kunedrive.appspot.com/o/kumnegerwondimu%40gmail.com%2FImages%2FScreenshot%20(3).png?alt=media&token=56af05fd-ef94-445d-85d3-f838cb380e34"
                  alt=""
                />
              </li>
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
  return (
    <>
      <div className="UploadFilesStyle">
        <input ref={imgInputRef} type="file" multiple={true} />
        <div>
          <button
            onClick={uploadFile}
            className="btnUpload"
            type="button"
            multiple={true}
          >
            Upload
          </button>
        </div>
      </div>
    </>
  );
}
