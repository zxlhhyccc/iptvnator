import { EpgProgram } from './../../models/epg-program.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChannelQuery, Channel, ChannelStore } from '../../../state';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Settings, VideoPlayer } from '../../../settings/settings.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STORE_KEY } from '../../../shared/enums/store-keys.enum';

@Component({
    selector: 'app-video-player',
    templateUrl: './video-player.component.html',
    styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnInit {
    /** Active selected channel */
    activeChannel$: Observable<Channel> = this.channelQuery
        .select((state) => state.active)
        .pipe(tap((channel) => (this.channelTitle = channel?.name)));

    /** Channels list */
    channels$: Observable<Channel[]> = this.channelQuery.selectAll();

    /** Name of the selected channel */
    channelTitle: string;

    /** EPG availability flag */
    epgAvailable$: Observable<boolean> = this.channelQuery.select(
        (store) => store.epgAvailable
    );

    /** Current epg program */
    epgProgram$: Observable<EpgProgram> = this.channelQuery.select(
        (store) => store.currentEpgProgram
    );

    /** Favorites list */
    favorites$: Observable<string[]> = this.channelQuery.select(
        (store) => store.favorites
    );

    /** Selected video player options */
    playerSettings: Partial<Settings> = {
        player: VideoPlayer.VideoJs,
        showCaptions: false,
    };

    /** Sidebar object */
    @ViewChild('sidenav') sideNav: MatSidenav;

    /**
     * Creates an instance of VideoPlayerComponent
     * @param channelQuery akita's channel query
     * @param channelStore akita's channel store
     * @param storage browser storage service
     * @param snackBar service to push snackbar notifications
     */
    constructor(
        private channelQuery: ChannelQuery,
        private channelStore: ChannelStore,
        private snackBar: MatSnackBar,
        private storage: StorageMap
    ) {}

    /**
     * Sets video player and subscribes to channel list from the store
     */
    ngOnInit(): void {
        this.applySettings();
    }

    /**
     * Reads the app configuration from the browsers storage and applies the settings in the current component
     */
    applySettings(): void {
        this.storage.get(STORE_KEY.Settings).subscribe((settings: Settings) => {
            if (settings && Object.keys(settings).length > 0) {
                this.playerSettings = {
                    player: settings.player,
                    showCaptions: settings.showCaptions,
                };
            }
        });
    }

    /**
     * Closes the channels sidebar
     */
    close(): void {
        this.sideNav.close();
    }

    /**
     * Adds/removes a given channel to the favorites list
     * @param channel channel to add
     */
    addToFavorites(channel: Channel): void {
        this.snackBar.open('Favorites were updated!', null, { duration: 2000 });
        this.channelStore.updateFavorite(channel);
    }
}
