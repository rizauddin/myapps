import { Routes } from '@angular/router';
import { LuluskeComponent } from './luluske/luluske.component';
import { BatchweightComponent } from './batchweight/batchweight.component'

export const routes: Routes = [
    { path: 'luluske', component: LuluskeComponent },
    { path: 'batchweight', component: BatchweightComponent },
    { path: '**', redirectTo: 'luluske', pathMatch: 'full'},

];
