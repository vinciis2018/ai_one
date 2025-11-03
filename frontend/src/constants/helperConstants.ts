// Helper function to clean and format URLs
const cleanUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_SERVER_NODE?.replace(
    /[\\"\\']/g,
    ""
  ).replace(/\/$/, "");
  console.log(`${baseUrl}${path}`)
  return `${baseUrl}${path}`;
};


const cleanWebsocketUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_WEBSOCKET?.replace(
    /[\\"\\']/g,
    ""
  ).replace(/\/$/, "");
  console.log(`${baseUrl}${path}`)
  return `${baseUrl}${path}`;
};


export const nodeurl = cleanUrl("/api/v1");

export const websocketurl = cleanWebsocketUrl("");


