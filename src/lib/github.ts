import { db } from '@/server/db';
import {Octokit} from 'octokit'
import { aiSummariseCommit } from './gemini';
import axios from 'axios';

export const octokit = new Octokit({
    auth:process.env.GITHUB_TOKEN
});

type Response= {
    commitHash:string,
    commitMessage:string,
    commitAuthorName:string,
    commitAuthorAvatar:string,
    commitDate:string
}

export const getCommitHashes = async (githubUrl:string):Promise<any> =>{
    const [owner,repo] = githubUrl.split("/").slice(-2);
    if(!owner||!repo){
        throw new Error("Invalid github url");
    }
    const {data}  = await octokit.rest.repos.listCommits({
        owner,
        repo
    })
    const sortedCommits = data.sort((a:any,b:any)=>{
       return new Date(b.commit.author.data).getTime() - new Date(a.commit.author.date).getTime() as any
    })
   
    return sortedCommits.slice(0,10).map((commit:any)=>({
             commitHash :commit.sha as string,
             commitMessage :commit.commit.message ?? " ",
             commitAuthorName : commit.commit?.author?.name ?? "",
             commitAuthorAvatar : commit?.author?.avatar_url ??"",
             commitDate : commit.commit?.author?.date ?? ''
    }))
} 

export const pollCommits  = async(projectId:string)=>{
    const {githubUrl} = await fetchProjectGithubUrl(projectId);
    const commitHashes  = await getCommitHashes(githubUrl)
    const unprocessedCommits  = await filterUnprocessedCommits(projectId,commitHashes);

    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit=>{
        return summariseCommit(githubUrl,commit.commitHash)
    }))

    const summaries = summaryResponses.map((response:any)=>{
         if(response.status==='fulfilled'){
            return response.value as string || "No summary generated"
         }
         return "No summary generated"
    })

    const commits = await Promise.all(
      summaries.map((summary, i) =>
        db.commit.create({
          data: {
            projectId,
            commitHash: unprocessedCommits[i]?.commitHash,
            commitMessage: unprocessedCommits[i]?.commitMessage,
            commitAuthorName: unprocessedCommits[i]?.commitAuthorName,
            commitAuthorAvatar: unprocessedCommits[i]?.commitAuthorAvatar,
            commitDate: unprocessedCommits[i]?.commitDate,
            summary,
          } as any,
        })
      )
    );
    return commits;
}

async function summariseCommit(githubUrl:string,commitHash:string){
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
        headers:{
            Accept:"application/vnd.github.v3.diff"
        }
    })
    const summary = await aiSummariseCommit(data as string) || "No summary generated";
    return summary;
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true }
  });

  if (!project) throw new Error('Project not found');

  return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(projectId:string,commitHashes:Response[]) {
    const processedCommits = await db.commit.findMany({
        where:{projectId}
    })
    const unprocessedCommits = commitHashes.filter((commit)=>
        !processedCommits.some((processedCommits:any)=>
            processedCommits.commitHash===commit.commitHash));

    return unprocessedCommits
}

await pollCommits('cmfs4h27f0000u154fkmyl7f2').then(console.log)
