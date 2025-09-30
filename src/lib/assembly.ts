import {AssemblyAI} from 'assemblyai';

const client = new AssemblyAI({
    apiKey:process.env.ASSEMBLY_AI_API_KEY || "b9ddc93b7df84324ba7cddfe8d1e84c9",
})

function msToTime(ms:number){
    const seconds = ms /1000;
    const minutes = Math.floor(seconds/60);
    const remainingSeconds = Math.floor(seconds%60);
    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`
}

export const processMeeting = async(meetingUrl:string)=>{
   const transcript = await client.transcripts.transcribe({
audio:meetingUrl,
auto_chapters:true,

   })
   const summaries = transcript.chapters?.map(chapter=>({
    start:msToTime(chapter.start),
    end:msToTime(chapter.end),
    gist:chapter.gist,
    headline:chapter.headline,
    summary:chapter.summary
   })) || []

   if(!transcript.text) throw new Error("No transcript found");

   return {
    transcript,summaries
   }
}


// const FILE_UR= "https://assembly.ai/sports_injuries.mp3";

// const response = await processMeeting(FILE_UR);
// console.log(response);