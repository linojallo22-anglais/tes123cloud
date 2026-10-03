import { pipeline, env } from '@huggingface/transformers'; import fs from 'fs';
env.localModelPath='./mcdonalds/node_modules/sts-whisper-base/models/'; env.allowRemoteModels=false;
const b=fs.readFileSync('paypal/build/a.f32'); const audio=new Float32Array(b.buffer,b.byteOffset,b.length/4);
const asr=await pipeline('automatic-speech-recognition','Xenova/whisper-base',{dtype:'q8'});
const out=await asr(audio,{language:'english',task:'transcribe',return_timestamps:'word',chunk_length_s:30,stride_length_s:5});
fs.writeFileSync('paypal/build/asr.json',JSON.stringify(out)); console.log('DONE');
