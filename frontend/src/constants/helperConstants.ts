// Helper function to clean and format URLs
const cleanUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_SERVER?.replace(
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


export const BASE_URL = cleanUrl("");

export const websocketurl = cleanWebsocketUrl("");



export const allDomains = [
    { key: 1, label: "Science", value: "science", icon: "fi-br-physics" },
    { key: 2, label: "Physics", value: "physics", icon: "fi-br-magnet" },
    { key: 3, label: "Chemistry", value: "chemistry", icon: "fi-br-flask-gear" },
    { key: 4, label: "Maths", value: "maths", icon: "fi-br-square-root" },
    { key: 5, label: "Biology", value: "biology", icon: "fi-br-dna" },
    { key: 6, label: "General", value: "general", icon: "fi-br-messages-question" },
  ];
