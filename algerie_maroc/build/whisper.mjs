import fs from 'fs';
import { pipeline, env } from '@huggingface/transformers';
env.localModelPath = '../node_modules/sts-whisper-base/models/'; env.allowRemoteModels = false;
const buf = fs.readFileSync('../assets/voice16.f32'); const audio = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', { dtype: 'q8' });
const r = await asr(audio, { language: 'french', task: 'transcribe', return_timestamps: 'word', chunk_length_s: 30, stride_length_s: 5 });
fs.writeFileSync('whisper.json', JSON.stringify(r.chunks, null, 0));
console.log(r.text);
