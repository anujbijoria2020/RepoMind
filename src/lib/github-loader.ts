import 'dotenv/config'

import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { generateEmbedding, summariseCode } from './gemini'
import { db } from '@/server/db'
import { Octokit } from 'octokit'


export const getOctokit = (githubToken?:string) => {
  return new Octokit({ auth: process.env.GITHUB_TOKEN || githubToken});
};

export const checkCreditsCount  = async(githubUrl:string,githubToken?:string)=>{
    const octokit=getOctokit(githubToken);
    
    async function getDefaultBranch(owner: string, repo: string) {
          const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
          return repoData.default_branch;
        }

        
        const githubOwner = githubUrl.split("/")[3];
        const githubRepo = githubUrl.split("/")[4];
        
        if(!githubOwner || !githubRepo){
            return 0;
        }
        const default_branch = await getDefaultBranch(githubOwner,githubRepo);

  try{
     const {data:branchData} = await octokit.rest.repos.getBranch({
        owner:githubOwner,
        repo:githubRepo,
        branch:default_branch
       });

       const sha = branchData.commit.sha;

       const {data:treeData} = await octokit.rest.git.getTree({
        owner:githubOwner,
        repo:githubRepo,
        tree_sha:sha,
        recursive:"true"
       });

       const files  = treeData.tree.filter(item=>item.type==="blob")
       .map(file=>file.path);

       return files.length;
  }catch(error){
    return console.log("error fetching repo files :",error);
  }
}

export const loadGithubRepo = async(githubUrl:string,githubToken?:string)=>{
    const loader = new GithubRepoLoader(githubUrl,{
        accessToken:process.env.GITHUB_TOKEN || githubToken,
        branch:'main',
        ignoreFiles:[
            "node_modules/**",
            "dist/**",
            "build/**",
            ".next/**",
            "out/**",
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            ".env",
            ".env.*",
            "prisma/migrations/**",
            "prisma/generated/**",
            "logs/**",
            "*.log",
            "coverage/**",
            ".turbo/**",
            ".vercel/**",
            "public/**",
            "assets/**",
            ".git/**",
            ".DS_Store",
            ".idea/**",
            ".vscode/**",
        ],
        recursive:true,
        unknown:'warn',
        maxConcurrency:5
    })
    const docs = await loader.load()
    return docs;
}

export const indexGithubRepo = async(projectId:string,githubUrl:string,githubToken?:string)=>{
    const docs = await loadGithubRepo(githubUrl,githubToken);
    const allEmbeddings = await getEmbeddings(docs);

    await Promise.allSettled(allEmbeddings.map(async (embedding,index)=>{
        if(!embedding) return;

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data:{
                summary: embedding.summary || "No summary generated",
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId
            }
        })

        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding"= ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}

const getEmbeddings = async(docs:Document[])=>{
    return await Promise.all(docs.map(async(doc)=>{
        console.log("generating summary of docs from github-loader.ts");
        const summary = await summariseCode(doc) || "No summary generated";
        const embedding = await generateEmbedding(summary);
        return{
            summary,
            embedding,
            sourceCode:JSON.parse(JSON.stringify(doc.pageContent)),
            fileName:doc.metadata.source
        }
    }))
}
