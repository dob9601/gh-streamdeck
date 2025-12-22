import streamDeck from "@elgato/streamdeck";

import { GithubMonitor } from "./actions/monitor";
import _ from "lodash";
import { FilterState, ToggleFilter } from "./actions/toggle-filter";
import { OffsetLeft } from "./actions/offset/left";
import { OffsetRight } from "./actions/offset/right";
import { DataStore } from "./data-store";
import { PageIndicator } from "./actions/page-indicator";

export type GitHubTrackerGlobalSettings = {
    accessToken: string;
    wrapText: boolean;
    filterState: FilterState;
    offset: number;
};

streamDeck.logger.setLevel("debug");

const dataStore = new DataStore();

const monitor = new GithubMonitor(dataStore);
streamDeck.actions.registerAction(monitor);
streamDeck.actions.registerAction(new ToggleFilter(dataStore));

const offsetLeft = new OffsetLeft(dataStore);
streamDeck.actions.registerAction(offsetLeft);
const offsetRight = new OffsetRight(dataStore);
streamDeck.actions.registerAction(offsetRight);

streamDeck.actions.registerAction(new PageIndicator(dataStore));

let lastGlobalSettings: GitHubTrackerGlobalSettings | null = null;
streamDeck.settings.onDidReceiveGlobalSettings<GitHubTrackerGlobalSettings>(
    async (event) => {
        if (lastGlobalSettings?.wrapText !== event.settings.wrapText) {
            monitor.renderActions();
        }

        if (lastGlobalSettings?.offset !== event.settings.offset) {
            monitor.renderActions();
            offsetLeft.renderState(event.settings.offset);
            offsetRight.renderState(event.settings.offset);
        }

        if (lastGlobalSettings?.accessToken !== event.settings.accessToken) {
            dataStore.refreshGithubClient(event.settings.accessToken);
        }

        lastGlobalSettings = event.settings;
    },
);

// Finally, connect to the Stream Deck.
streamDeck.connect();
