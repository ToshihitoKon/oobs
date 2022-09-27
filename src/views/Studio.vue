<template>
  <div class="background">
    <div style="display: flex">
      <div class="studio-container">
        <video controls autoplay :srcObject.prop="currentStream" class="video-mainarea"></video>
      </div>
      <div style="width: 20%">
        <p class="clock">LIVE {{now}}</p>
        <textarea v-model="righttextarea" class="right-textarea" placeholder="text"></textarea>
      </div>
    </div>
    <div style="display: flex">
      <textarea v-model="bottomtextarea" placeholder="text" class="bottom-textarea"></textarea>
    </div>
  </div> 
  <details>
    <summary>config</summary>
    <div>
      <select v-model="selectedVideoInput">
        <option
          v-for="input in videoinputs"
          :key="input"
          :value="input.id">{{input.label}}</option>
      </select>
    </div>
    <div>
      <select v-model="selectedAudioInput">
        <option
          v-for="input in audioinputs"
          :key="input"
          :value="input.id">{{input.label}}</option>
      </select>
    </div>
    <button v-on:click="onClickSelectDeviceButton">set device</button>
  </details>
  <details>
    <summary>record: {{ recorderStatus }}</summary>
    <button v-on:click="onClickRecordStart">start</button>
    <button v-on:click="onClickRecordRap">rap</button>
    <button v-on:click="onClickRecordStop">stop</button>
    <ul>
      <li v-for="record in recordedList"
        :key="record.url"
      >
        <video controls :src="record.url" style="width:300px"></video>
        <a download="oobs.webm" :href="record.url">download</a>
      </li>
    </ul>
  </details>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Kosugi+Maru&family=Yuji+Syuku&display=swap');

body {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
body::-webkit-scrollbar {
  display:none;
}

.background {
  background-image: url("../assets/bg.png");
  background-size: cover;
  background-repeat: no-repeat;
}

.studio-container {
  width: 80%;
}

.video-mainarea {
  width: 100%;
  margin: 16px;
}

.clock {
  margin: 4px;
  font-size: 30px;  
  font-family: 'Bebas Neue', cursive;
  text-align: center;
  background: #ffffffcc;
  border-radius: 16px;
}

.right-textarea {
  width: 100%;
  height: 95%;
  font-size: 25px;
  border: 0px;
  font-family: 'Kosugi Maru', sans-serif;
  background: #ffffffcc;
  border-radius: 16px;
  padding: 8px;
}

.bottom-textarea {
  width: 70%;
  height: 2lh;
  font-size: 30px;
  border: 0px;
  font-family: 'Yuji Syuku', serif;
  background: #ffffffcc;
  border-radius: 16px;
}

</style>

<script>
export default {
  data: ()=>{
    return {
      currentStream: undefined,
      recorder: undefined,
      recordedList: [],
      videoinputs: [],
      audioinputs: [],
      selectedVideoInput: '',
      selectedAudioInput: '',
      righttextarea: "",
      bottomtextarea: "",
      now: null,
    }
  },
  mounted(){
    this.loadLocalStorage()
    this.setDevicesOption()
    setInterval(this.setClock, 1000)
  },
  watch: {
    righttextarea(v) {
      localStorage.righttextarea = v
    },
    bottomtextarea(v) {
      localStorage.bottomtextarea = v
    }
  },
  computed: {
    recorderStatus: function(){
      if (this.recorder !== undefined) {
        return this.recorder.state
      }
      return "recorder not set"
    }
  },
  methods: {
    setClock: function(){
      const d = new Date()
      const hour = ('00' + d.getHours()).slice(-2)
      const min = ('00' + d.getMinutes()).slice(-2)
      const sec = ('00' + d.getSeconds()).slice(-2)
      this.now = `${hour}:${min}:${sec}`
    },
    loadLocalStorage: function(){
      if(localStorage.righttextarea) {
        this.righttextarea = localStorage.righttextarea
      }
      if(localStorage.bottomtextarea) {
        this.bottomtextarea = localStorage.bottomtextarea
      }
    },
    stopMediaTracks: function(stream){
      stream.getTracks().forEach(track => {
        track.stop();
      })
    },
    onClickSelectDeviceButton: function() {
      const currentStream = this.currentStream
      const currentRecorder = this.recorder
      console.log("onClickSelectCameraButton", currentStream, this.selectedVideoInput, this.selectedAudioInput)

      if ( this.selectedVideoInput === '' || this.selectedAudioInput === '') {
        return
      } 

      if (typeof currentRecorder !== 'undefined' && currentRecorder.state === 'recording') {
        currentRecorder.stop()
      }
      if (typeof currentStream !== 'undefined') {
        this.stopMediaTracks(currentStream);
      }

      const constraints = {
        video: {width: 1280, height: 720, deviceId: this.selectedVideoInput},
        audio: { deviceId: this.selectedAudioInput}
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          this.currentStream = stream;
          const recorder = new MediaRecorder(stream)
          recorder.ondataavailable = function(ev){
            console.log("ondataavailable event hooked")
            this.addRecordedList(ev)
          }.bind(this)
          this.recorder = recorder
        })
        .catch(error => {
          console.error(error);
        })
    },
    onClickRecordStart: function(){
      if (this.recorder !== undefined && this.recorder.state !== "recording") {
        console.log("recording start")
        this.recorder.start()
      }  
    },
    onClickRecordRap: function(){
      if (this.recorder !== undefined && this.recorder.state === "recording") {
        console.log("recording rap")
        this.recorder.requestData()
      }
    },
    onClickRecordStop: function(){
      if (this.recorder !== undefined && this.recorder.state === "recording") {
        console.log("recording stop")
        this.recorder.stop()
      }
    },
    addRecordedList: function(ev){
      console.log("addRecordedList")
      this.recordedList.push({
        url: window.URL.createObjectURL(ev.data),
        blob: ev.data
      })
    },
    setDevicesOption: function() {
      console.log("setDevicesOption")
      navigator.mediaDevices.enumerateDevices()
      .then(mediaDevices=>{
        const videoinputs = []
        const audioinputs = []
        mediaDevices.forEach(mediaDevice => {
          console.log(mediaDevice)
          if (mediaDevice.kind === 'videoinput') {
            videoinputs.push({
              label: mediaDevice.label || "NONAME",
              id: mediaDevice.deviceId,
            })
          }else if (mediaDevice.kind === 'audioinput') {
            audioinputs.push({
              label: mediaDevice.label || "NONAME",
              id: mediaDevice.deviceId,
            })
          }
        })
        console.log(videoinputs)
        this.videoinputs = videoinputs
        this.audioinputs = audioinputs
      })
    }
  }
}
</script>  
