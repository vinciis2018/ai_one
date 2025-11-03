import { io, Socket } from "socket.io-client";
import { websocketurl } from "../constants/helperConstants";

let monitoringAnalysisSocketInstance: Socket | null = null;
let auditReportGenerationSocketInstance: Socket | null = null;

// const socketUrl = "ws://localhost:3333";
// const socketUrl = process.env.VITE_WEBSOCKET || "wss://server.vinciis.in";
const socketUrl = websocketurl;


export const monitoringAnalysisSocket = () => {
    if (!monitoringAnalysisSocketInstance) {
      // Check if running as PWA
      monitoringAnalysisSocketInstance = io(socketUrl, {
        transports: ["websocket"],
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
    }
   
    
    return monitoringAnalysisSocketInstance
};


export const auditReportGenerationSocket = () => {
    if (!auditReportGenerationSocketInstance) {
      // Check if running as PWA
      auditReportGenerationSocketInstance = io(socketUrl, {
          transports: ["websocket"],
          secure: true,
          rejectUnauthorized: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
      });
    }
    
    return auditReportGenerationSocketInstance
};