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
const callButton = document.getElementById('callButton') as HTMLButtonElement;
const callInput = document.getElementById('callInput') as HTMLInputElement;
const useAudioCheckbox = document.getElementById('useAudio') as HTMLInputElement;
const useVideoCheckbox = document.getElementById('useVideo') as HTMLInputElement;
const answerButton = document.getElementById('answerButton') as HTMLButtonElement;
const rejectButton = document.getElementById('rejectButton') as HTMLButtonElement;
const hangupButton = document.getElementById('hangupButton') as HTMLButtonElement;
const localIDLabel = document.getElementById('localID') as HTMLLabelElement;
const remoteIDLabel = document.getElementById('remoteID') as HTMLLabelElement;
const logsList = document.getElementById('logs') as HTMLLabelElement;
webcamVideo.muted = true

let RTC: RTCConnection;
let localStream: MediaStream
let remoteStream: MediaStream
const socketConnection = new SocketConnection()
await socketConnection.init()
localIDLabel.innerText = socketConnection.name

function changeStateAnswerReject(disabled: boolean) {
    answerButton.onclick = undefined
    rejectButton.onclick = undefined
    answerButton.disabled = disabled
    rejectButton.disabled = disabled
    callAnimation(!disabled)
}

function getUseAudioVideo() {
    return {video: useVideoCheckbox.checked, audio: useAudioCheckbox.checked}
}

function setUseAudioVideo(video: boolean, audio: boolean) {
    useVideoCheckbox.checked = video
    useAudioCheckbox.checked = audio
}

function callAnimation(enable: boolean) {
    if (enable) {
        remoteIDLabel.classList.remove('no-animation')
    } else {
        remoteIDLabel.classList.add('no-animation')
    }
}

socketConnection.socket.on('receiveCall', ({name, audio, video}, callback) => {
    remoteIDLabel.innerText = name
    changeStateAnswerReject(false)
    answerButton.onclick = () => {
        callback({accept: true, message: ''})
        setUseAudioVideo(video, audio)
        changeStateAnswerReject(true)
        startConnection(name, false)
    }
    rejectButton.onclick = () => {
        callback({accept: false, message: 'Звонок отклонен'})
        changeStateAnswerReject(true)
    }
})

callButton.onclick = async () => {
    if (!useAudioCheckbox.checked && !useVideoCheckbox.checked) {
        return alert('Audio and video disabled!')
    }
    socketConnection.socket.emit('sendCall', {name: callInput.value, ...getUseAudioVideo()}, ({accept, message}) => {
        if (!accept) return alert(message)
        startConnection(callInput.value, true)
    })
}

hangupButton.onclick = () => {
    callButton.disabled = false
    hangupButton.disabled = true
    closeConnection()
}

async function createStreams() {
    localStream = await navigator.mediaDevices.getUserMedia(getUseAudioVideo())
    remoteStream = new MediaStream()
    webcamVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
}

async function startConnection(name: string, sender: boolean) {
    callButton.disabled = true
    hangupButton.disabled = false
    RTC = new RTCConnection(name, socketConnection.socket)
    RTC.initEvents()
    await createStreams()
    RTC.initMedia(localStream, remoteStream)
    RTC.awaitPeerAndSendOffer(sender)
}

function closeConnection() {
    RTC.closeConnection()
    localStream.getTracks().forEach((track) => {
        track.stop()
    })
    remoteStream.getTracks().forEach((track) => {
        track.stop()
    })
    RTC = undefined
}