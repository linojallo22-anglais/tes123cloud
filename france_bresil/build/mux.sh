# Assemble les morceaux vidéo + le son -> MP4 final (< 30 Mo)
set -e; OUT=$1
printf "file 'p0.mp4'\nfile 'p1.mp4'\nfile 'p2.mp4'\nfile 'p3.mp4'\n" > out/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/list.txt -c copy out/video.mp4
ffmpeg -v error -y -i out/video.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 21 -maxrate 3.2M -bufsize 6M -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$OUT"
