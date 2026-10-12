import fs from 'fs'; import { pipeline, env } from '@huggingface/transformers';
env.localModelPath = '../node_modules/sts-whisper-base/models/'; env.allowRemoteModels = false;
const buf = fs.readFileSync('../assets/voice16.f32'); const a = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', { dtype: 'q8' });
for (const [s, e] of [[9.5, 13.7], [76.0, 81.9], [60.3, 62.6]]) { const r = await asr(a.slice(s * 16000, e * 16000), { language: 'french', task: 'transcribe' }); console.log(s, e, r.text); }
