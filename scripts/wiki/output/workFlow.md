MANUAL step. 1. add wiki urls to scripts/wiki/wikibooks-urls.txt (this I will do manually)
MANUAL step. 2. I want to trigger manully to terminal npm run convert-and-upload. this will trigger in sequence with retry logic or waiting until all the images are downloaded (figure out proper logic to to step by step with safety measures):
   AUTOMATICa. run 
pm run wiki:extract which will add wiki raw json and images to C:\Users\karolis\VibeCoding\receptai\scripts\wiki\output

   AUTOMATIC b.  run for file in scripts/wiki/output/*-wikibooks-raw.json; do
       echo "Converting: $file"
       node scripts/wiki/convert-wikibooks-with-assistant.js "$file"
       done
so that all raw wiki recipes are converted and saved to C:\Users\karolis\VibeCoding\receptai\scripts\wiki\output\chatGPT

AUTOMATIC c. successful converted wiki raw files then move to C:\Users\karolis\VibeCoding\receptai\scripts\wiki\output\processed\wiki_json_raw
