import { useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Heading,
  Grommet,
  BoxExtendedProps,
  Collapsible,
  Form,
  FormField,
  TextInput,
  DataTable,
  ColumnConfig,
  Text,
} from "grommet";
import { Notification } from "grommet-icons";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { appDir, join } from "@tauri-apps/api/path";
import Storage from "./services/Storage";
import type { Video, NewVideo } from "./models/Video";

// const theme = {
//   global: {
//     font: {
//       family: "Roboto",
//       size: "18px",
//       height: "20px",
//     },
//   },
// };

const columns: ColumnConfig<Video>[] = [
  {
    property: "author_name",
    header: <Text>Name</Text>,
    primary: true,
  },
  {
    property: "author_surname",
    header: <Text>Surname</Text>,
    primary: true,
  },
];

const AppBar = (props: JSX.IntrinsicAttributes & BoxExtendedProps) => (
  <Box
    tag="header"
    direction="row"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: "medium", right: "small", vertical: "small" }}
    elevation="medium"
    style={{ zIndex: "1" }}
    {...props}
  />
);

function useHookWithRefCallback() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const setRef = useCallback((node: HTMLVideoElement | null) => {
    const loadVideo = async () => {
      const appDirPath = await appDir();
      const filePath = await join(appDirPath, "videos", "telepoorte_fnl.mp4");
      const fileURL = convertFileSrc(filePath);
      return fileURL;
    };

    if (node) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      loadVideo().then((fileURL) => {
        const source = document.createElement("source");
        source.type = "video/mp4";
        source.src = fileURL;
        node.appendChild(source);
        node.load();
      });
    }

    // Save a reference to the node
    ref.current = node;
  }, []);

  return [setRef];
}

function App() {
  const [camera, setCamera] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [videoRef] = useHookWithRefCallback();

  // FIXME: type checking
  async function addVideo(formObj: any) {
    const { author_name, author_surname } = formObj;
    const video = await Storage.create(author_name, author_surname);
    console.log(video);
  }

  async function getVideos() {
    const videos = await Storage.all();
    setVideos(videos);
    // console.log(videos);
  }

  async function startCamera() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setCamera(await invoke("start_camera"));
  }

  async function stopCamera() {
    setCamera(await invoke("stop_camera"));
  }

  async function statusCamera() {
    setCamera(await invoke("status_camera"));
  }

  return (
    // <Grommet theme={theme}>
    <Grommet plain full>
      <Box fill>
        <AppBar>
          <Heading level="3" margin="none">
            CamStream
          </Heading>
          <Button
            icon={<Notification />}
            onClick={() => setShowSidebar(!showSidebar)}
          />
        </AppBar>
        <Box direction="row" flex overflow={{ horizontal: "hidden" }}>
          <Collapsible direction="horizontal" open={showSidebar}>
            <Box
              flex
              width="medium"
              background="light-2"
              elevation="small"
              align="center"
              justify="center"
            >
              <Form
                onChange={(nextValue) => console.log(nextValue)}
                // onReset={() =>
                //   setVideoForm({ author_name: "", author_surname: "" })
                // }
                onSubmit={({ value }) => {
                  // e.preventDefault();
                  addVideo(value);
                }}
              >
                <Box
                  direction="row"
                  justify="between"
                  align="center"
                  // margin="small"
                  pad={{
                    horizontal: "small",
                  }}
                  gap="small"
                >
                  <FormField
                    name="author_name"
                    htmlFor="text-input-name"
                    label="Name"
                    required
                    // validate={{
                    //   regexp: /\w+/,
                    //   // message: "Not a valid name",
                    //   // status: "error",
                    // }}
                  >
                    <TextInput id="text-input-name" name="author_name" />
                  </FormField>
                  <FormField
                    name="author_surname"
                    htmlFor="text-input-surname"
                    label="Surname"
                    required
                  >
                    <TextInput id="text-input-surname" name="author_surname" />
                  </FormField>
                </Box>
                <Box
                  direction="row"
                  align="center"
                  gap="small"
                  pad={{
                    horizontal: "small",
                  }}
                >
                  <Button type="submit" primary label="Submit" />
                  <Button type="reset" label="Reset" />
                </Box>
              </Form>
              <Box
                // width="small"
                background="light-2"
                elevation="small"
                align="center"
                justify="center"
                margin={{ top: "medium" }}
              >
                <DataTable columns={columns} data={videos} />
              </Box>
            </Box>
          </Collapsible>
          <Box flex align="center" justify="center">
            <div>
              <video ref={videoRef} width={500} controls />
              <div className="row">
                <button type="button" onClick={startCamera}>
                  Start
                </button>
                <button type="button" onClick={stopCamera}>
                  Stop
                </button>
                <button type="button" onClick={statusCamera}>
                  Status
                </button>
                <button type="button" onClick={getVideos}>
                  Log Videos
                </button>
              </div>
            </div>
            <p>{camera}</p>
          </Box>
        </Box>
      </Box>
    </Grommet>
  );
}

export default App;
