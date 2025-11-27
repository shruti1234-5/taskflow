import { createTaskController , getTaskController} from "@/controllers/taskController";

export async function POST(req){
    return createTaskController(req);
}

export async function GET(req){
    return getTaskController(req);
}