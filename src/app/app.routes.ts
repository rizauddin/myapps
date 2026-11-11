import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'luluske',
        loadComponent: () => import('./luluske/luluske.component').then(m => m.LuluskeComponent),
        data: { layout: 'luluske' },
    },
    {
        path: 'batchweight',
        loadComponent: () => import('./batchweight/batchweight.component').then(m => m.BatchweightComponent),
    },
    { path: '**', redirectTo: '/luluske', pathMatch: 'full' },
];
