//document.body.style.background = "yellow";
let sounds = [];
chrome.runtime.onMessage.addListener((msg, sender, response) => {
     if (msg.from === "popup" && msg.subject === "DOMInfo") {
          let audios = $("audio");

          audios.each(function (index, audio) {
               let initJq = $(audio);
               let src = initJq.find("source").attr("src");
               if (typeof src != "undefined") {
                    sounds.push(src);
               } else if (initJq.attr("src") != "undefined") {
                    sounds.push(initJq.attr("src"));
               }
          });

          if ($("#player").length !== 0) {
               $("#player").remove();
          }

          initPlayer();
          playTrack();
          response(sounds);
     }
});

let player;
let playlist;
let playerMain;
let btnNext;
let btnPrev;
let btnPause;
let currentTrack;
let play;
function initPlayer() {
     let body = $("body");

     body.append(`
     <div id="player">        
     <audio controls id="playerMain" autoplay preload="metadata">
         <source src="" type="audio/mp3" />
     </audio>            
     
     <div class="div-logo">                
         <img src="https://awebmaker.ir/icon-48.png" alt="BPPlayer">
         <h4>BPlayer</h4>
     </div>
     <div class="div-actions">
         <button id="btnPrev" type="button">
             <svg width="21" height="21" viewBox="0 0 512 512">
                 <path d="M112,64a16,16,0,0,1,16,16V216.43L360.77,77.11a35.13,35.13,0,0,1,35.77-.44c12,6.8,19.46,20,19.46,34.33V401c0,14.37-7.46,27.53-19.46,34.33a35.14,35.14,0,0,1-35.77-.45L128,295.57V432a16,16,0,0,1-32,0V80A16,16,0,0,1,112,64Z"/>
             </svg>
         </button>
         
         <button id="btnPause" type="button">
             <svg width="21" height="21" viewBox="0 0 512 512">
                 <path d="M133,440a35.37,35.37,0,0,1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37,7.46-27.53,19.46-34.33a35.13,35.13,0,0,1,35.77.45L399.12,225.48a36,36,0,0,1,0,61L151.23,434.88A35.5,35.5,0,0,1,133,440Z"/>
             </svg>
         </button>
         <button id="btnNext" type="button">
             <svg width="21" height="21" viewBox="0 0 512 512">
                 <path d="M400,64a16,16,0,0,0-16,16V216.43L151.23,77.11a35.13,35.13,0,0,0-35.77-.44C103.46,83.47,96,96.63,96,111V401c0,14.37,7.46,27.53,19.46,34.33a35.14,35.14,0,0,0,35.77-.45L384,295.57V432a16,16,0,0,0,32,0V80A16,16,0,0,0,400,64Z"/>
             </svg>
         </button>
         <button id="btnVolumeHigh" type="button">
               <svg  width="21" height="21" viewBox="0 0 512 512">
                    <path d="M232,416a23.88,23.88,0,0,1-14.2-4.68,8.27,8.27,0,0,1-.66-.51L125.76,336H56a24,24,0,0,1-24-24V200a24,24,0,0,1,24-24h69.75l91.37-74.81a8.27,8.27,0,0,1,.66-.51A24,24,0,0,1,256,120V392a24,24,0,0,1-24,24ZM125.82,336Zm-.27-159.86Z"/><path d="M320,336a16,16,0,0,1-14.29-23.19c9.49-18.87,14.3-38,14.3-56.81,0-19.38-4.66-37.94-14.25-56.73a16,16,0,0,1,28.5-14.54C346.19,208.12,352,231.44,352,256c0,23.86-6,47.81-17.7,71.19A16,16,0,0,1,320,336Z"/><path d="M368,384a16,16,0,0,1-13.86-24C373.05,327.09,384,299.51,384,256c0-44.17-10.93-71.56-29.82-103.94a16,16,0,0,1,27.64-16.12C402.92,172.11,416,204.81,416,256c0,50.43-13.06,83.29-34.13,120A16,16,0,0,1,368,384Z"/><path d="M416,432a16,16,0,0,1-13.39-24.74C429.85,365.47,448,323.76,448,256c0-66.5-18.18-108.62-45.49-151.39a16,16,0,1,1,27-17.22C459.81,134.89,480,181.74,480,256c0,64.75-14.66,113.63-50.6,168.74A16,16,0,0,1,416,432Z"/>
               </svg>
         </button>
         <button id="btnVolumeMute" type="button">
               <svg  width="21" height="21" viewBox="0 0 512 512">
                    <line x1="416" y1="432" x2="64" y2="80" style="fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M243.33,98.86a23.89,23.89,0,0,0-25.55,1.82l-.66.51L188.6,124.54a8,8,0,0,0-.59,11.85l54.33,54.33A8,8,0,0,0,256,185.06V120.57A24.51,24.51,0,0,0,243.33,98.86Z"/><path d="M251.33,335.29,96.69,180.69A16,16,0,0,0,85.38,176H56a24,24,0,0,0-24,24V312a24,24,0,0,0,24,24h69.76l92,75.31A23.9,23.9,0,0,0,243.63,413,24.51,24.51,0,0,0,256,391.45V346.59A16,16,0,0,0,251.33,335.29Z"/><path d="M352,256c0-24.56-5.81-47.87-17.75-71.27a16,16,0,1,0-28.5,14.55C315.34,218.06,320,236.62,320,256q0,4-.31,8.13a8,8,0,0,0,2.32,6.25l14.36,14.36a8,8,0,0,0,13.55-4.31A146,146,0,0,0,352,256Z"/><path d="M416,256c0-51.18-13.08-83.89-34.18-120.06a16,16,0,0,0-27.64,16.12C373.07,184.44,384,211.83,384,256c0,23.83-3.29,42.88-9.37,60.65a8,8,0,0,0,1.9,8.26L389,337.4a8,8,0,0,0,13.13-2.79C411,311.76,416,287.26,416,256Z"/><path d="M480,256c0-74.25-20.19-121.11-50.51-168.61a16,16,0,1,0-27,17.22C429.82,147.38,448,189.5,448,256c0,46.19-8.43,80.27-22.43,110.53a8,8,0,0,0,1.59,9l11.92,11.92A8,8,0,0,0,452,385.29C471.6,344.9,480,305,480,256Z"/>
               </svg>
         </button>
         <div class="timeline">
             <span id="current-time">2:40</span>
             <div  class="slider">
               <span id="seek-bar"></span>
             </div>
             <span id="total-time">3:50</span>
         </div>
         <button id="btnShuffle" type="button">
             <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 512 512">
                 <polyline points="400 304 448 352 400 400" style="fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><polyline points="400 112 448 160 400 208" style="fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M64,352h85.19a80,80,0,0,0,66.56-35.62L256,256" style="fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M64,160h85.19a80,80,0,0,1,66.56,35.62l80.5,120.76A80,80,0,0,0,362.81,352H416" style="fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M416,160H362.81a80,80,0,0,0-66.56,35.62L288,208" style="fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
             </svg>
         </button>
     </div>
 </div>`);

     player = $("#player");
     playlist = $("#playlist");
     playerMain = $("#playerMain");
     btnNext = $("#btnNext");
     btnPrev = $("#btnPrev");
     btnPause = $("#btnPause");
     btnVolumeHigh = $("#btnVolumeHigh");
     btnVolumeMute = $("#btnVolumeMute");
     btnShuffle = $("#btnShuffle");
     playerTimeline = $("#playerTimeline");
     currentTime = $("#current-time");
     totalTime = $("#total-time");
     seekBar = $("#seek-bar");

     currentTrack = 0;
     play = false;
     shuffle = false;

     btnNext.click(function () {
          if (currentTrack < sounds.length) {
               if (shuffle) {
                    currentTrack =
                         Math.floor(Math.random() * sounds.length) + 1;
               } else {
                    currentTrack++;
               }

               playTrack();
          }
     });
     btnPrev.click(function () {
          if (currentTrack > 0) {
               if (shuffle) {
                    currentTrack =
                         Math.floor(Math.random() * sounds.length) + 1;
               } else {
                    currentTrack--;
               }

               playTrack();
          }
     });
     btnPause.click(function () {
          if (play) {
               playerMain.trigger("pause");
          } else {
               playerMain.trigger("play");
          }
     });

     btnVolumeMute.click(function () {
          playerMain.prop("muted", false);
          btnVolumeHigh.css("display", "inline");
          btnVolumeMute.css("display", "none");
     });

     btnVolumeHigh.click(function () {
          playerMain.prop("muted", true);
          btnVolumeMute.css("display", "inline");
          btnVolumeHigh.css("display", "none");
     });

     btnShuffle.click(function () {
          shuffle = !shuffle;
          console.log(shuffle);
          if (shuffle) {
               btnShuffle.addClass("active");
          } else {
               btnShuffle.removeClass("active");
          }
     });

     playerMain.on({
          play: function () {
               totalTime.text(timeFormat(playerMain[0].duration));
               play = true;
               btnPause.addClass("active");
               btnPause.html(`<svg width="21" height="21" viewBox="0 0 512 512">
                    <path d="M208,432H160a16,16,0,0,1-16-16V96a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16V416A16,16,0,0,1,208,432Z"/><path d="M352,432H304a16,16,0,0,1-16-16V96a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16V416A16,16,0,0,1,352,432Z"/>
               </svg>`);
          },
          pause: function () {
               play = false;
               btnPause.removeClass("active");
               btnPause.html(`<svg width="21" height="21" viewBox="0 0 512 512">
                    <path d="M133,440a35.37,35.37,0,0,1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37,7.46-27.53,19.46-34.33a35.13,35.13,0,0,1,35.77.45L399.12,225.48a36,36,0,0,1,0,61L151.23,434.88A35.5,35.5,0,0,1,133,440Z"/>
               </svg>`);
          },
          ended: function () {
               if (currentTrack < sounds.length) {
                    if (shuffle) {
                         currentTrack =
                              Math.floor(Math.random() * sounds.length) + 1;
                    } else {
                         currentTrack++;
                    }
                    playTrack();
               } else {
                    currentTrack = 0;
                    playTrack();
               }
          },
     });

     playerMain.bind("timeupdate", function () {
          var percent =
               (playerMain[0].currentTime / playerMain[0].duration) * 100;

          currentTime.text(timeFormat(playerMain[0].currentTime));
          seekBar.css("width", percent + "%");
     });
}

function timeFormat(time) {
     var mins = Math.floor(time / 60);
     var secs = Math.floor(time % 60);
     if (secs < 10) {
          secs = "0" + String(secs);
     }
     if (isNaN(mins) || isNaN(secs)) {
          return "00:00";
     }
     return mins + ":" + secs;
}

function playTrack() {
     playerMain.attr("src", sounds[currentTrack]);
     setTimeout(() => {
          playerMain.trigger("play");
     }, 500);
}
