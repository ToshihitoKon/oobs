<template>
  <div class="background">
    <div style="display: flex">
      <div class="studio-container">
        <video autoplay :srcObject.prop="currentStream" class="video-mainarea"></video>
      </div>
      <div style="width: 20%">
        <p class="clock">LIVE {{now}}</p>
        <textarea v-model="righttextarea" class="right-textarea" placeholder="text"></textarea>
      </div>
    </div>
    <textarea v-model="bottomtextarea" placeholder="text" class="bottom-textarea"></textarea>
    <details>
      <summary>config</summary>
      <select v-model="selectedVideoInput">
        <option
          v-for="input in videoinputs"
          :key="input"
          :value="input.id">{{input.label}}</option>
      </select>
      <button v-on:click="onClickSelectCameraButton">select camera</button>
    </details>
  </div> 
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
  background: #ffe6ee
}

.studio-container {
  width: 80%;
}

.video-mainarea {
  width: 100%;
}

.clock {
  margin: 4px;
  font-size: 30px;  
  font-family: 'Bebas Neue', cursive;
  text-align: center;
}

.right-textarea {
  width: 100%;
  height: 95%;
  font-size: 25px;
  border: 0px;
  font-family: 'Kosugi Maru', sans-serif;
  background: #ffffff00;
}

.bottom-textarea {
  width: 100%;
  height: 2lh;
  font-size: 30px;
  border: 0px;
  font-family: 'Yuji Syuku', serif;
  background: #ffffff00;
}

</style>

<script>
export default {
  data: ()=>{
    return {
      currentStream: undefined,
      videoinputs: [],
      selectedVideoInput: '',
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
    onClickSelectCameraButton: function() {
      const currentStream = this.currentStream
      const selectValue = this.selectedVideoInput
      console.log("onClickSelectCameraButton", currentStream, selectValue)

      if (typeof currentStream !== 'undefined') {
        this.stopMediaTracks(currentStream);
      }
      const videoConstraints = {width: 1280, height: 720};
      if ( selectValue === '') {
        videoConstraints.facingMode = 'environment';
      } else {
        videoConstraints.deviceId = {exact: selectValue};
      }
      const constraints = {
        video: videoConstraints,
        audio: false
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          this.currentStream = stream;
        })
        .catch(error => {
          console.error(error);
        })
    },
    setDevicesOption: function() {
      console.log("setDevicesOption")
      navigator.mediaDevices.enumerateDevices()
      .then(mediaDevices=>{
        const videoinputs = []
        mediaDevices.forEach(mediaDevice => {
          if (mediaDevice.kind === 'videoinput') {
            console.log(mediaDevice)
            videoinputs.push({
              label: mediaDevice.label || "NONAME",
              id: mediaDevice.deviceId,
            })
          }
        })
        console.log(videoinputs)
        this.videoinputs = videoinputs
      })
    }
  }
}
</script>  
