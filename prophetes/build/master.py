# Compresseur + loudnorm deux passes (-14 LUFS) : mix_raw.wav -> mix.wav
import json, subprocess, re
AF = "acompressor=threshold=-18dB:ratio=3:attack=5:release=120,volume=0.6dB,loudnorm=I=-14:TP=-1.5:LRA=9"
s = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'mix_raw.wav', '-af', AF + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(s[s.rindex('{'):s.rindex('}') + 1])
f = AF + f":measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'mix_raw.wav', '-af', f, '-ar', '44100', 'mix.wav'], check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'mix.wav', '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
print('LUFS', re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
