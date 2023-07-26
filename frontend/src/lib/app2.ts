import SocketConnection from "./SocketConnection";
import RTCConnection from "./RTCConnection";

// function createLogElement(time: string, text: string, color = 'black'): string {
//     return `<div class="log"><p style="color: ${color}" class="log-text">${time} ${text}</p></div>`
// }
//
// function addLog(log: string, color?: string) {
//     const time = (Math.round(((new Date()).getTime() - startTime) / 1000)).toString()
//     const logElement = createLogElement(time, log, color)
//     logsList.insertAdjacentHTML('beforeend', logElement)
// }

const webcamVideo = document.getElementById('webcamVideo') as HTMLVideoElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
const webcamButton = document.getElementById('webcamButton') as HTMLButtonElement;
const callButton = document.getElementById('callButton') as HTMLButtonElement;
const callInput = document.getElementById('callInput') as HTMLInputElement;
const answerButton = document.getElementById('answerButton') as HTMLButtonElement;
const hangupButton = document.getElementById('hangupButton') as HTMLButtonElement;
const localIDLabel = document.getElementById('localID') as HTMLLabelElement;
const remoteIDLabel = document.getElementById('remoteID') as HTMLLabelElement;
const logsList = document.getElementById('logs') as HTMLLabelElement;
webcamVideo.muted = true

// const localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
const localStream = new MediaStream()
const remoteStream = new MediaStream()
webcamVideo.srcObject = localStream;
remoteVideo.srcObject = remoteStream;

const socketConnection = new SocketConnection()
await socketConnection.init()
localIDLabel.innerText = socketConnection.name

webcamButton.onclick = async () => {
    callButton.disabled = false;
    callInput.disabled = false;
    answerButton.disabled = false;
    webcamButton.disabled = true;
};

callButton.onclick = async () => {
    socketConnection.socket.emit('sendCall', callInput.value, ({accept, message}) => {
        if (!accept) return alert(message)
        console.log('READY')
    })
}
