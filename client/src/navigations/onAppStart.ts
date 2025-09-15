import { appService } from "../services/AppService";

export const onAppStart = () => {
    appService.initialize().catch(console.error);
}