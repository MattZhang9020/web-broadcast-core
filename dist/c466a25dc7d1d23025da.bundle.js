!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.webBroadcastCore=t():e.webBroadcastCore=t()}(self,(()=>(self.addEventListener("message",(function(e){"start"===e.data&&setTimeout((()=>{self.postMessage("")}),5)})),{})));